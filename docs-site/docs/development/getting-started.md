# Getting Started

Panduan lengkap untuk memulai development CRM MindiMedia.

## Prerequisites

### System Requirements
- **Node.js**: v18.0.0 atau lebih tinggi
- **npm**: v8.0.0 atau lebih tinggi
- **MySQL**: v8.0 atau lebih tinggi
- **Git**: Latest version
- **OS**: macOS, Linux, atau Windows dengan WSL2

### Development Tools (Recommended)
- **VS Code** dengan extensions:
  - ESLint
  - Prettier
  - TypeScript and JavaScript Language Features
  - MySQL (untuk database exploration)
- **Postman** atau **Insomnia** untuk API testing
- **MySQL Workbench** atau **TablePlus** untuk database management

## Installation Steps

### 1. Clone Repository

```bash
# Clone repository
git clone https://github.com/mindimedia/crm-mindimedia.git
cd crm-mindimedia

# Atau jika menggunakan SSH
git clone git@github.com:mindimedia/crm-mindimedia.git
cd crm-mindimedia
```

### 2. Install Dependencies

```bash
# Install semua dependencies
npm install

# Verify installation
npm list --depth=0
```

### 3. Database Setup

#### Create Database
```sql
-- Login ke MySQL
mysql -u root -p

-- Create database
CREATE DATABASE crm_mindimedia CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user (optional, untuk security)
CREATE USER 'crm_user'@'localhost' IDENTIFIED BY 'SecurePassword123!';
GRANT ALL PRIVILEGES ON crm_mindimedia.* TO 'crm_user'@'localhost';
FLUSH PRIVILEGES;

-- Verify
SHOW DATABASES;
exit;
```

### 4. Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit .env file
nano .env  # atau gunakan editor favorit Anda
```

#### Required Environment Variables
```env
# Application
NODE_ENV=development
PORT=3000
APP_NAME="CRM MindiMedia"

# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=crm_mindimedia
DB_USER=root          # atau crm_user jika menggunakan user khusus
DB_PASSWORD=password  # ganti dengan password MySQL Anda

# Security
JWT_SECRET=your-very-long-random-string-minimum-32-chars
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d
PASSWORD_SALT_ROUNDS=10

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_ATTEMPTS=10
RATE_LIMIT_BLOCK_DURATION=60

# Session
SESSION_EXPIRES_IN=24h
MAX_CONCURRENT_SESSIONS=5

# Development
DEBUG=true
LOG_LEVEL=debug
```

### 5. Database Migrations

```bash
# Run all migrations
npm run db:migrate

# Verify migrations
mysql -u root -p crm_mindimedia -e "SHOW TABLES;"
```

Expected tables:
- users
- hotels
- roles
- permissions
- role_has_permissions
- model_has_roles
- model_has_permissions
- hotel_users
- auth_sessions
- auth_tokens

### 6. Seed Database

```bash
# Seed dengan sample data
npm run db:seed

# Atau fresh install (drop all + migrate + seed)
npm run db:refresh
```

## Running the Application

### Development Mode

```bash
# Start dengan hot reload
npm run dev

# Server akan berjalan di http://localhost:3000
```

### Production Mode

```bash
# Build TypeScript
npm run build

# Start production server
npm start
```

### Verify Installation

```bash
# Check health endpoint
curl http://localhost:3000/health

# Expected response:
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 10.123,
  "environment": "development"
}
```

## Project Structure

```
crm-mindimedia/
├── src/
│   ├── domain/              # Business logic & interfaces
│   │   ├── auth/           # Authentication domain
│   │   └── entity.ts       # Base entities
│   │
│   ├── services/           # Application services
│   │   ├── auth.service.ts
│   │   └── token.service.ts
│   │
│   ├── controllers/        # HTTP controllers
│   │   ├── auth.controller.ts
│   │   └── health.controller.ts
│   │
│   ├── repositories/       # Data access layer
│   │   ├── user.repository.ts
│   │   └── hotel.repository.ts
│   │
│   ├── models/            # Database entities
│   │   ├── auth-session.entity.ts
│   │   └── auth-token.entity.ts
│   │
│   ├── rbac/              # Role-based access control
│   │   ├── rbac.service.ts
│   │   └── enums.ts
│   │
│   ├── core/              # Core utilities
│   │   ├── http/         # HTTP helpers
│   │   ├── middleware/   # Express middleware
│   │   └── security/     # Security utilities
│   │
│   ├── config/            # Configuration
│   │   ├── database.ts
│   │   └── auth.ts
│   │
│   ├── router/            # API routes
│   │   └── v1/
│   │
│   ├── db/                # Database files
│   │   ├── migrations/   # TypeORM migrations
│   │   └── seeders/      # Data seeders
│   │
│   ├── app.ts            # Express app setup
│   └── server.ts         # Server entry point
│
├── docs/                  # Documentation
├── build/                # Compiled JavaScript
├── node_modules/        # Dependencies
├── .env                 # Environment variables
├── .env.example        # Environment template
├── package.json        # Project metadata
├── tsconfig.json       # TypeScript config
└── README.md          # Project readme
```

## Development Workflow

### 1. Create Feature Branch

```bash
# Create new feature branch
git checkout -b feature/your-feature-name

# Or bugfix branch
git checkout -b bugfix/issue-description
```

### 2. Development Cycle

```bash
# Make changes
code src/

# Run tests (when available)
npm test

# Check TypeScript compilation
npx tsc --noEmit

# Lint code
npx eslint src/

# Format code
npx prettier --write src/
```

### 3. Database Changes

```bash
# Create new migration
npx typeorm migration:create src/db/migrations/YourMigrationName

# Run migration
npm run db:migrate

# Rollback if needed
npm run db:rollback
```

### 4. Testing API

#### Using curl
```bash
# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"superadmin@mindimedia.com","password":"SuperAdmin123!"}'

# Use access token
curl -X GET http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### Using Postman
1. Import collection dari `CRM_API_Complete.postman_collection.json`
2. Set environment variable `base_url` = `http://localhost:3000`
3. Run requests in order

## Default Test Users

After seeding, these users are available:

| Role | Email | Password | Permissions |
|------|-------|----------|-------------|
| Super Admin | superadmin@mindimedia.com | SuperAdmin123! | All permissions |
| Hotel Owner | owner@hotel.com | OwnerPass123! | Full hotel access |
| Hotel Manager | manager@hotel.com | ManagerPass123! | Hotel operations |
| Receptionist | receptionist@hotel.com | RecepPass123! | Limited access |

## Common Development Tasks

### Reset Database
```bash
# Drop all tables, recreate, and seed
npm run db:refresh
```

### Check Database Schema
```bash
# Connect to MySQL
mysql -u root -p crm_mindimedia

# Show all tables
SHOW TABLES;

# Describe table structure
DESCRIBE users;
DESCRIBE hotels;
DESCRIBE roles;

# Check relationships
SELECT * FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
WHERE REFERENCED_TABLE_SCHEMA = 'crm_mindimedia';
```

### Debug Mode

Enable detailed logging:
```env
# In .env file
DEBUG=true
LOG_LEVEL=debug
```

View logs:
```bash
# Logs will appear in console
npm run dev

# For production, consider using pm2
npm install -g pm2
pm2 start dist/server.js --name crm-api
pm2 logs crm-api
```

### Generate Documentation

```bash
# Generate API documentation
npm run docs:typedoc

# Generate dependency graph
npm run docs:deps

# Build all documentation
npm run docs:build

# Serve documentation locally
npm run docs:serve
# Open http://localhost:8080
```

## Troubleshooting

### Common Issues

#### 1. Database Connection Failed
```
Error: ER_ACCESS_DENIED_ERROR
```
**Solution**: Check DB credentials in .env file

#### 2. Port Already in Use
```
Error: EADDRINUSE :::3000
```
**Solution**: 
```bash
# Find process using port
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill process or change port in .env
PORT=3001
```

#### 3. TypeORM Migration Error
```
Error: No migrations are pending
```
**Solution**: Check migration status
```bash
npx typeorm migration:show -d src/data/typeorm-data-source.ts
```

#### 4. Module Not Found
```
Error: Cannot find module 'xxx'
```
**Solution**: 
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### 5. TypeScript Compilation Error
```
TSError: ⨯ Unable to compile TypeScript
```
**Solution**:
```bash
# Check TypeScript errors
npx tsc --noEmit

# Fix imports and types
```

## Best Practices

### Code Style
- Use TypeScript strict mode
- Follow ESLint rules
- Format with Prettier
- Write descriptive variable names
- Add JSDoc comments for public APIs

### Git Workflow
- Commit often with clear messages
- Follow conventional commits
- Keep PRs small and focused
- Write tests for new features
- Update documentation

### Security
- Never commit .env files
- Use strong passwords for test users
- Validate all inputs
- Sanitize database queries
- Log security events

### Performance
- Use database indexes wisely
- Implement caching where needed
- Paginate large result sets
- Use connection pooling
- Monitor response times

## Next Steps

1. **Explore the API**: Use Postman collection to understand endpoints
2. **Read Architecture Docs**: Understand Clean Architecture implementation
3. **Study RBAC System**: Learn permission and role management
4. **Review Security**: Understand authentication flow
5. **Contribute**: Create feature branches and submit PRs

## Resources

- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [TypeORM Documentation](https://typeorm.io/)
- [JWT.io](https://jwt.io/) - JWT debugger
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

---

*Happy Coding! 🚀*
