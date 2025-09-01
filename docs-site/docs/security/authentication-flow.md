# Authentication Flow

## Overview

CRM MindiMedia menggunakan **Bearer Token Authentication** dengan sistem dual-token (Access Token + Refresh Token) untuk keamanan optimal. Sistem ini mendukung token rotation, session tracking, dan anomaly detection.

## Authentication Architecture

```mermaid
sequenceDiagram
  participant C as Client
  participant Auth as AuthController
  participant AS as AuthService
  participant RL as RateLimitService
  participant US as UserService
  participant SS as SessionStore
  participant TS as TokenService
  participant DB as Database
  
  C->>Auth: POST /api/v1/auth/login
  Auth->>RL: checkEmailRateLimit(email)
  RL-->>Auth: allowed
  Auth->>AS: login(email, password)
  AS->>US: validateCredentials(email, password)
  US->>DB: findUserByEmail(email)
  DB-->>US: user + credentials
  US->>US: verifyPassword(PBKDF2)
  US-->>AS: userValidated
  AS->>SS: createSession(userId, ip, userAgent)
  SS->>DB: INSERT auth_sessions
  AS->>TS: generateTokenPair(sessionId)
  TS-->>AS: {accessToken, refreshToken}
  AS-->>Auth: loginResult
  Auth-->>C: 200 OK + tokens
```

## Token Types

### Access Token
- **Purpose**: Short-lived token untuk API access
- **TTL**: 15 minutes
- **Usage**: Sent in Authorization header
- **Payload**:
  ```json
  {
    "sub": "user_id",
    "sid": "session_id",
    "type": "access",
    "iat": 1234567890,
    "exp": 1234568790
  }
  ```

### Refresh Token
- **Purpose**: Long-lived token untuk mendapatkan access token baru
- **TTL**: 7 days
- **Usage**: Sent in request body untuk refresh
- **Payload**:
  ```json
  {
    "sub": "user_id",
    "sid": "session_id",
    "type": "refresh",
    "iat": 1234567890,
    "exp": 1235172690
  }
  ```

## Authentication Endpoints

### 1. Login Endpoint
**POST** `/api/v1/auth/login`

#### Request
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

#### Response Success (200 OK)
```json
{
  "data": {
    "user": {
      "id": "123",
      "email": "user@example.com",
      "status": "active",
      "roles": ["hotel-manager"]
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
      "expiresIn": 900,
      "refreshExpiresIn": 604800
    }
  },
  "meta": {
    "requestId": "req_123abc"
  }
}
```

#### Response Errors
- **400 Bad Request**: Invalid input format
- **401 Unauthorized**: Invalid credentials
- **429 Too Many Requests**: Rate limit exceeded

### 2. Refresh Token Endpoint
**POST** `/api/v1/auth/refresh`

#### Request
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### Response Success (200 OK)
```json
{
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 900,
    "refreshExpiresIn": 604800
  },
  "meta": {
    "requestId": "req_456def"
  }
}
```

### 3. Logout Endpoint
**POST** `/api/v1/auth/logout`

#### Headers
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

#### Response Success (200 OK)
```json
{
  "data": null,
  "meta": {
    "requestId": "req_789ghi"
  }
}
```

### 4. Current User Endpoint
**GET** `/api/v1/auth/me`

#### Headers
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

#### Response Success (200 OK)
```json
{
  "data": {
    "user": {
      "id": "123",
      "email": "user@example.com",
      "status": "active"
    },
    "roles": ["hotel-manager"],
    "permissions": [
      "hotels.read",
      "hotels.update",
      "users.read"
    ]
  },
  "meta": {
    "requestId": "req_321xyz"
  }
}
```

## Security Mechanisms

### 1. Password Security

#### PBKDF2 Hashing
```typescript
const config = {
  iterations: 100000,
  keyLength: 64,
  digest: 'sha256',
  saltLength: 32
};

// Password hash format
const passwordHash = pbkdf2Sync(
  password,
  salt,
  config.iterations,
  config.keyLength,
  config.digest
);
```

#### Password Requirements
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character

### 2. Rate Limiting

#### IP-Based Rate Limiting
```typescript
const ipRateLimit = {
  windowMs: 15 * 60 * 1000,  // 15 minutes
  maxAttempts: 10,           // 10 attempts
  blockDuration: 60 * 60 * 1000  // 1 hour block
};
```

#### Email-Based Rate Limiting
```typescript
const emailRateLimit = {
  windowMs: 15 * 60 * 1000,  // 15 minutes
  maxAttempts: 5,            // 5 attempts
  blockDuration: 2 * 60 * 60 * 1000  // 2 hour block
};
```

### 3. Token Rotation

```mermaid
sequenceDiagram
  participant C as Client
  participant API as API
  participant TS as TokenService
  participant SS as SessionStore
  
  C->>API: POST /refresh with old refreshToken
  API->>TS: validateRefreshToken(token)
  TS->>SS: checkTokenUsage(tokenId)
  
  alt Token Never Used
    SS-->>TS: valid, first use
    TS->>TS: generateNewTokenPair()
    TS->>SS: markTokenAsUsed(oldToken)
    TS->>SS: storeNewTokens()
    TS-->>API: newTokenPair
    API-->>C: 200 OK + new tokens
  else Token Already Used (Reuse Detected)
    SS-->>TS: REUSE_DETECTED
    TS->>SS: revokeAllSessionTokens()
    TS-->>API: ERROR: Token reuse
    API-->>C: 401 Session Revoked
  end
```

### 4. Session Management

#### Session Lifecycle
```mermaid
stateDiagram-v2
  [*] --> Created: Login Success
  Created --> Active: First API Call
  Active --> Active: API Activity
  Active --> Expired: TTL Reached
  Active --> Revoked: Logout/Security Event
  Expired --> [*]
  Revoked --> [*]
```

#### Session Storage
```typescript
interface AuthSession {
  id: string;              // UUID v4
  userId: bigint;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
  lastActivity: Date;
  expiresAt: Date;
  revokedAt?: Date;
  revokeReason?: 'logout' | 'token_reuse' | 'suspicious_activity' | 'admin';
}
```

## Anomaly Detection

### Suspicious Activity Patterns

1. **Concurrent Session Limit**
   ```typescript
   const MAX_CONCURRENT_SESSIONS = 5;
   // Automatically revoke oldest session when limit exceeded
   ```

2. **Geographic Anomaly**
   ```typescript
   // Detect rapid location changes
   if (distanceBetweenIPs > 1000km && timeDiff < 1hour) {
     flagSuspiciousActivity(sessionId);
   }
   ```

3. **User Agent Changes**
   ```typescript
   // Detect session hijacking attempts
   if (currentUserAgent !== sessionUserAgent) {
     requireReauthentication();
   }
   ```

4. **Unusual Activity Patterns**
   - Rapid API calls (>100 requests/minute)
   - Access from multiple IPs simultaneously
   - Token refresh patterns anomaly

## Implementation Code Examples

### Client-Side Token Management

```typescript
class AuthManager {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private refreshTimer: NodeJS.Timeout | null = null;

  async login(email: string, password: string): Promise<void> {
    const response = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) throw new Error('Login failed');

    const { data } = await response.json();
    this.setTokens(data.tokens);
    this.scheduleTokenRefresh(data.tokens.expiresIn);
  }

  private setTokens(tokens: TokenPair): void {
    this.accessToken = tokens.accessToken;
    this.refreshToken = tokens.refreshToken;
    
    // Store in secure storage
    localStorage.setItem('refreshToken', tokens.refreshToken);
  }

  private scheduleTokenRefresh(expiresIn: number): void {
    // Refresh 1 minute before expiry
    const refreshIn = (expiresIn - 60) * 1000;
    
    this.refreshTimer = setTimeout(() => {
      this.refreshAccessToken();
    }, refreshIn);
  }

  async refreshAccessToken(): Promise<void> {
    if (!this.refreshToken) throw new Error('No refresh token');

    const response = await fetch('/api/v1/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: this.refreshToken })
    });

    if (!response.ok) {
      // Refresh failed, redirect to login
      this.logout();
      return;
    }

    const { data } = await response.json();
    this.setTokens(data);
    this.scheduleTokenRefresh(data.expiresIn);
  }

  async makeAuthenticatedRequest(url: string, options?: RequestInit): Promise<Response> {
    if (!this.accessToken) throw new Error('Not authenticated');

    return fetch(url, {
      ...options,
      headers: {
        ...options?.headers,
        'Authorization': `Bearer ${this.accessToken}`
      }
    });
  }

  logout(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }
    
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('refreshToken');
    
    // Redirect to login page
    window.location.href = '/login';
  }
}
```

### Server-Side Token Validation Middleware

```typescript
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        error: { message: 'Missing or invalid authorization header' }
      });
      return;
    }

    const token = authHeader.substring(7);
    
    // Validate token format
    if (!TokenUtil.isValidTokenFormat(token)) {
      res.status(401).json({
        error: { message: 'Invalid token format' }
      });
      return;
    }

    // Verify and decode token
    const decoded = await TokenService.verifyAccessToken(token);
    
    // Check session validity
    const session = await SessionStore.getSession(decoded.sid);
    
    if (!session || session.revokedAt) {
      res.status(401).json({
        error: { message: 'Session invalid or expired' }
      });
      return;
    }

    // Update session activity
    await SessionStore.updateActivity(decoded.sid);

    // Attach user context to request
    req.user = {
      id: decoded.sub,
      sessionId: decoded.sid
    };

    next();
  } catch (error) {
    res.status(401).json({
      error: { message: 'Authentication failed' }
    });
  }
}
```

## Best Practices

### Do's ✅
1. **Always use HTTPS** in production
2. **Store tokens securely** (HttpOnly cookies or secure storage)
3. **Implement token refresh** before expiry
4. **Monitor for anomalies** and suspicious patterns
5. **Log authentication events** for audit
6. **Use strong password policies**
7. **Implement account lockout** after failed attempts

### Don'ts ❌
1. **Don't store passwords** in plain text
2. **Don't expose sensitive info** in tokens
3. **Don't ignore rate limiting**
4. **Don't use long-lived access tokens**
5. **Don't log passwords** or tokens
6. **Don't trust client-side validation** alone
7. **Don't reuse tokens** after logout

## Troubleshooting

### Common Issues

1. **Token Expired**
   - Solution: Implement automatic token refresh
   - Error Code: `TOKEN_EXPIRED`

2. **Invalid Token Format**
   - Solution: Check token structure and encoding
   - Error Code: `INVALID_TOKEN`

3. **Session Revoked**
   - Solution: Re-authenticate user
   - Error Code: `SESSION_REVOKED`

4. **Rate Limit Exceeded**
   - Solution: Implement exponential backoff
   - Error Code: `RATE_LIMIT_EXCEEDED`

5. **Token Reuse Detected**
   - Solution: Immediate re-authentication required
   - Error Code: `REFRESH_REUSE_DETECTED`

---

*Secure Authentication - The Foundation of Trust in CRM MindiMedia*
