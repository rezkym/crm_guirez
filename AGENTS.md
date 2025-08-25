# AGENTS

## Project Overview

**CRM MindiMedia** is a multi-tenant hotel management CRM system built with TypeScript and Express.js. This is a collaborative project between MindiMedia and Guirez, implementing sophisticated role-based access control (RBAC) with repository-service architecture patterns.

### Business Domain Context
- **Primary Focus**: Hotel management and customer relationship management
- **Multi-tenancy**: Hotel-scoped permissions and data isolation
- **Target Users**: Hotel owners, administrators, assessors, marketing personnel, superadmins
- **Authentication**: JWT-based with 2FA support

### Technology Stack
- **Runtime**: Node.js with TypeScript (ES2020)
- **Framework**: Express.js 5.x
- **Architecture**: Repository-Service pattern with layered design
- **Development**: ts-node + nodemon, ESLint, Prettier
- **Database**: Configuration ready, schema pending ERD implementation

## Architecture Patterns

### Core Design Principles
1. **Layered Architecture**: Controllers → Services → Repositories
2. **RBAC System**: Resource-action based permissions with global and hotel-specific roles
3. **API Versioning**: Structured with `/api/v1/` prefix
4. **Error Handling**: Centralized with custom HTTP error classes
5. **Soft Deletes**: Entity-level with `deleted_at` timestamps

### Domain Model
- **Users**: Core entity with email authentication and role assignments
- **Hotels**: Business entities with owner relationships
- **Roles & Permissions**: Flexible RBAC supporting multi-level access
- **Multi-tenancy**: Data isolation by hotel scope

## Directory Structure

### Core Application Files
- `src/server.ts` – application entry point and server startup
- `src/app.ts` – Express configuration and middleware registration
- `src/config/app.ts` – environment-based application configuration

### Business Logic Layer
- `src/controllers/` – thin HTTP request handlers; delegate to services
- `src/services/` – business logic implementation; interact with repositories
- `src/repositories/` – data access layer contracts and implementations
- `src/domain/entity.ts` – core domain entities (User, Hotel, Role, Permission)

### Infrastructure Layer
- `src/core/http/` – HTTP helpers (status codes, responses, error handling, async wrapper)
- `src/core/middleware/` – custom middleware (`requestId`, `auth`, `notFoundHandler`)
- `src/rbac/enums.ts` – role/permission enumeration and RBAC utilities
- `src/router/` – API routing with versioned endpoints (`v1`)

### Data and Configuration
- `src/data/` – data source configuration with placeholder implementation
- `src/db/` – migrations/seeders placeholders (unused until ERD implementation)
- `src/types/express.d.ts` – Express type augmentation for request properties

## Development Conventions

### TypeScript Standards
- Use strict TypeScript with ES2020 target
- Maintain type safety throughout the application
- Generate declaration files for external consumption

### API Patterns
- Wrap all async handlers with `asyncHandler` for proper error handling
- Use response helpers (`ok`, `created`, `noContent`) for consistent responses
- Throw `HttpError` subclasses for standardized error responses
- Implement unique request IDs for tracing

### Code Organization
- Maintain strict controller → service → repository layering
- Extend `Express.Request` via `src/types/express.d.ts` when adding request properties
- Enforce permissions through RBAC utilities in `src/rbac/`
- Place future migrations in `src/db/migrations/` and seeds in `src/db/seeders/`

### Authentication & Authorization
- JWT-based authentication with Express request augmentation
- Multi-level RBAC: global roles and hotel-specific permissions
- Resource-action based permission checking

## Development Workflow

### Commands
```bash
npm run dev    # Start development server with hot reload
npm test       # Run tests (framework not yet implemented)
```

### Current Development Status
- **Phase**: Early development with complete architectural foundation
- **Database**: Configuration ready, awaiting ERD for schema implementation
- **Testing**: Test framework not yet implemented
- **Modified Files**: Recent improvements to error handling and response utilities

### Immediate Development Priorities
1. Database schema implementation based on provided ERD
2. Complete authentication system with JWT implementation
3. Implement comprehensive testing strategy
4. Build CRUD operations for core entities (Users, Hotels, Roles)

## Agent Guidelines

When working on this codebase:
- Always maintain the repository-service-controller layering
- Implement proper RBAC checks for multi-tenant operations
- Use the established error handling patterns with `HttpError` subclasses
- Follow the async/await pattern with `asyncHandler` wrapper
- Maintain API versioning structure (`/api/v1/`)
- Consider multi-tenancy implications in all business logic
- Preserve the TypeScript strict mode configuration
- Use the standardized response helpers for consistent API responses
