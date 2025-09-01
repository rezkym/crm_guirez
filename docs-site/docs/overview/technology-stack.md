# Technology Stack

## Core Technologies

### Runtime Environment

#### Node.js (v18+)
- **Purpose**: JavaScript runtime untuk server-side execution
- **Why**: Event-driven, non-blocking I/O ideal untuk high-concurrency CRM
- **Features Used**:
  - Native ES modules support
  - Built-in crypto untuk security operations
  - Worker threads untuk CPU-intensive tasks

#### TypeScript (v5.9+)
- **Purpose**: Type-safe JavaScript dengan static typing
- **Configuration**:
  ```json
  {
    "target": "ES2020",
    "strict": true,
    "esModuleInterop": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
  ```
- **Benefits**:
  - Compile-time error detection
  - Better IDE support dan IntelliSense
  - Self-documenting code dengan types

### Web Framework

#### Express.js (v5)
- **Purpose**: Minimal web framework untuk REST API
- **Why**: Mature, stable, extensive middleware ecosystem
- **Key Middleware**:
  - Body parsing untuk JSON
  - CORS handling
  - Request ID generation
  - Error handling

### Database Layer

#### MySQL 8
- **Purpose**: Primary data store
- **Features Used**:
  - JSON column types
  - Window functions
  - Common Table Expressions (CTEs)
  - Full-text search indexes
- **Configuration**:
  ```sql
  -- Character set untuk multi-language support
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci
  
  -- Timezone handling
  default_time_zone = '+00:00'
  ```

#### TypeORM (v0.3.26)
- **Purpose**: Object-Relational Mapping
- **Features**:
  - Database migrations
  - Entity decorators
  - Query builder
  - Connection pooling
- **Configuration**:
  ```typescript
  {
    type: 'mysql',
    synchronize: false,  // Use migrations only
    logging: ['error', 'warn'],
    entities: ['src/models/**/*.entity.ts'],
    migrations: ['src/db/migrations/*.ts']
  }
  ```

### Authentication & Security

#### JWT (JSON Web Tokens)
- **Purpose**: Stateless authentication
- **Implementation**:
  - Access Token: 15 minutes TTL
  - Refresh Token: 7 days TTL
  - RS256 algorithm untuk production
- **Token Structure**:
  ```typescript
  interface TokenPayload {
    sub: string;      // user_id
    sid: string;      // session_id
    type: 'access' | 'refresh';
    iat: number;
    exp: number;
  }
  ```

#### PBKDF2 Password Hashing
- **Purpose**: Secure password storage
- **Configuration**:
  - Iterations: 100,000
  - Key Length: 64 bytes
  - Digest: SHA-256
  - Salt: 32 bytes (unique per password)

### Architecture Patterns

#### Clean Architecture
```
src/
├── domain/          # Business logic & interfaces
├── services/        # Application services
├── controllers/     # HTTP controllers
├── repositories/    # Data access layer
├── models/         # Database entities
├── core/           # Framework utilities
└── config/         # Configuration
```

#### Dependency Injection
- **Pattern**: Constructor injection
- **Container**: Custom DI container
- **Benefits**:
  - Testability
  - Loose coupling
  - Configuration flexibility

## Dependencies

### Production Dependencies

```json
{
  "mysql2": "^3.14.3",        // MySQL driver
  "typeorm": "^0.3.26",       // ORM
  "uuid": "^11.1.0",          // UUID generation
  "express": "^5.1.0"         // Web framework
}
```

### Development Dependencies

```json
{
  "@types/express": "^5.0.3",      // TypeScript definitions
  "@types/node": "^24.3.0",        // Node.js types
  "typescript": "^5.9.2",          // TypeScript compiler
  "ts-node": "^10.9.2",            // TypeScript execution
  "nodemon": "^3.1.10",            // Hot reload
  "eslint": "^9.33.0",             // Linting
  "prettier": "^3.6.2",            // Code formatting
  "dotenv": "^17.2.1"              // Environment variables
}
```

## Data Storage Architecture

### Primary Storage (MySQL)

#### Tables Structure
```sql
-- Core authentication tables
auth_sessions      -- User sessions
auth_tokens        -- Token blacklist/whitelist

-- RBAC tables
users              -- User accounts
hotels             -- Multi-tenant hotels
roles              -- Role definitions
permissions        -- Permission definitions
role_has_permissions   -- Role-permission mapping
model_has_roles        -- User/model role assignments
model_has_permissions  -- Direct permission grants
hotel_users           -- Hotel membership
```

### In-Memory Storage

#### Session Store
- **Implementation**: Memory-based (Redis-compatible interface)
- **Purpose**: Fast session validation
- **Data Structure**:
  ```typescript
  Map<sessionId, {
    userId: string;
    createdAt: Date;
    expiresAt: Date;
    lastActivity: Date;
  }>
  ```

#### Rate Limit Store
- **Implementation**: Memory-based with TTL
- **Purpose**: Brute-force protection
- **Limits**:
  - IP-based: 10 attempts per 15 minutes
  - Email-based: 5 attempts per 15 minutes

## Security Stack

### Application Security

1. **Input Validation**
   - Type checking via TypeScript
   - Runtime validation in controllers
   - SQL injection prevention via parameterized queries

2. **Authentication Flow**
   ```
   Login → Validate → Issue Tokens → Store Session
     ↓
   Refresh → Validate → Rotate Tokens → Update Session
     ↓
   Logout → Revoke Tokens → Clear Session
   ```

3. **Rate Limiting**
   - Per-IP limiting
   - Per-email limiting
   - Exponential backoff
   - Captcha integration ready

### Network Security

1. **HTTPS Enforcement** (Production)
   - TLS 1.3 minimum
   - HSTS headers
   - Certificate pinning

2. **CORS Policy**
   ```typescript
   {
     origin: process.env.ALLOWED_ORIGINS?.split(','),
     credentials: true,
     methods: ['GET', 'POST', 'PUT', 'DELETE'],
     allowedHeaders: ['Content-Type', 'Authorization']
   }
   ```

3. **Security Headers**
   - X-Frame-Options: DENY
   - X-Content-Type-Options: nosniff
   - X-XSS-Protection: 1; mode=block
   - Content-Security-Policy: default-src 'self'

## Development Tools

### Code Quality

#### ESLint Configuration
```javascript
{
  extends: ['eslint:recommended', 'typescript'],
  rules: {
    'no-unused-vars': 'error',
    'no-console': 'warn',
    'prefer-const': 'error'
  }
}
```

#### Prettier Configuration
```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

### Database Management

#### Migration Commands
```bash
npm run db:migrate      # Run pending migrations
npm run db:rollback     # Rollback last migration
npm run db:fresh        # Drop all & migrate
npm run db:seed         # Seed sample data
npm run db:refresh      # Fresh + seed
```

### Development Workflow

```bash
# Development server dengan hot reload
npm run dev

# Type checking
npx tsc --noEmit

# Linting
npx eslint src/

# Formatting
npx prettier --write src/
```

## Performance Optimizations

### Database Optimizations

1. **Connection Pooling**
   ```typescript
   {
     connectionLimit: 10,
     queueLimit: 0,
     waitForConnections: true
   }
   ```

2. **Query Optimization**
   - Indexed columns: email, hotel_id, user_id
   - Composite indexes untuk common queries
   - Query result caching untuk read-heavy operations

3. **N+1 Query Prevention**
   - Eager loading dengan TypeORM relations
   - Query builder untuk complex joins
   - DataLoader pattern untuk batching

### Application Optimizations

1. **Async/Await Pattern**
   - Non-blocking I/O operations
   - Parallel processing dengan Promise.all()
   - Error boundaries dengan try-catch

2. **Memory Management**
   - Session cleanup setiap 1 jam
   - Rate limit store dengan TTL
   - Garbage collection monitoring

3. **Response Caching**
   - ETag headers untuk static resources
   - Cache-Control headers
   - CDN-ready architecture

## Monitoring & Observability

### Metrics Collection

```typescript
interface Metrics {
  // Performance metrics
  apiResponseTime: Histogram;
  databaseQueryTime: Histogram;
  
  // Business metrics
  loginAttempts: Counter;
  activeSession: Gauge;
  
  // Error metrics
  errorRate: Counter;
  authFailures: Counter;
}
```

### Logging Strategy

1. **Structured Logging**
   ```typescript
   {
     timestamp: ISO8601,
     level: 'info' | 'warn' | 'error',
     requestId: UUID,
     userId?: string,
     message: string,
     metadata: object
   }
   ```

2. **Log Levels**
   - ERROR: System errors, exceptions
   - WARN: Degraded performance, retry operations
   - INFO: Business events, state changes
   - DEBUG: Development only

## Deployment Architecture

### Container-Ready
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["node", "dist/server.js"]
```

### Environment Configuration
```env
# Application
NODE_ENV=production
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=crm_mindimedia
DB_USER=crm_user
DB_PASSWORD=secure_password

# Security
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

# Rate Limiting
RATE_LIMIT_WINDOW=15m
RATE_LIMIT_MAX_ATTEMPTS=10
```

## Future Technology Considerations

### Planned Enhancements

1. **Redis Integration**
   - Centralized session store
   - Distributed rate limiting
   - Query result caching

2. **Message Queue**
   - Event-driven architecture
   - Async job processing
   - Email notifications

3. **ElasticSearch**
   - Full-text search
   - Log aggregation
   - Analytics engine

4. **GraphQL API**
   - Flexible data fetching
   - Real-time subscriptions
   - Schema stitching

### Scalability Path

1. **Horizontal Scaling**
   - Load balancer ready
   - Stateless application design
   - Database read replicas

2. **Microservices Migration**
   - Auth service extraction
   - RBAC service isolation
   - Event sourcing preparation

---

*CRM MindiMedia - Built on Modern, Scalable Technology*
