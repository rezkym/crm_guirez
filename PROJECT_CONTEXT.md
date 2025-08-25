# Project Context

## Project Overview and Purpose

**CRM MindiMedia** is a TypeScript-based Customer Relationship Management (CRM) system built collaboratively between MindiMedia and Guirez. The application is designed as a multi-tenant hotel management CRM system with sophisticated role-based access control (RBAC) capabilities.

### Key Business Domain
- **Primary Focus**: Hotel management and customer relationship management
- **Multi-tenancy**: Supports multiple hotels with isolated data and permissions
- **User Management**: Comprehensive user system with role-based permissions
- **Target Users**: Hotel owners, administrators, assessors, marketing personnel, and superadmins

## Technology Stack and Frameworks

### Core Technologies
- **Runtime**: Node.js
- **Language**: TypeScript (ES2020 target)
- **Framework**: Express.js 5.x
- **Architecture Pattern**: Repository-Service Architecture

### Development Tools
- **Package Manager**: npm
- **TypeScript Compiler**: 5.9.2
- **Development Server**: ts-node with nodemon
- **Code Quality**: ESLint, Prettier
- **Environment Management**: dotenv

### Configuration
- **Strict TypeScript**: Enabled with ES2020 target
- **Module System**: CommonJS
- **Source Maps**: Enabled for debugging
- **Declaration Files**: Generated for type safety

## Project Structure and Key Directories

```
src/
├── app.ts                  # Express application configuration
├── server.ts              # Application entry point
├── config/                # Configuration management
├── controllers/           # HTTP request handlers (thin layer)
├── services/             # Business logic implementation
├── repositories/         # Data access layer contracts
├── domain/               # Domain entities and types
├── core/                 # Core utilities and middleware
│   ├── http/             # HTTP helpers, status codes, error handling
│   └── middleware/       # Custom middleware (auth, requestId, notFound)
├── rbac/                 # Role-Based Access Control system
├── router/               # API routing (versioned)
├── data/                 # Data source configuration
├── db/                   # Database migrations and seeders (placeholder)
└── types/                # TypeScript type extensions
```

## Architecture Patterns and Design Decisions

### Architectural Principles
1. **Repository-Service Pattern**: Clear separation between business logic and data access
2. **Layered Architecture**: Controllers → Services → Repositories
3. **RBAC Implementation**: Comprehensive role and permission system
4. **API Versioning**: Structured versioning with `/api/v1` prefix
5. **Error Handling**: Centralized error handling with custom HTTP errors

### Key Design Decisions
- **Strict TypeScript**: Enforces type safety throughout the application
- **Async/Await Pattern**: Wrapped with `asyncHandler` for error handling
- **Soft Deletes**: Implemented at entity level with `deleted_at` timestamps
- **Multi-tenancy**: Hotel-scoped permissions and data isolation
- **RESTful API**: Standard HTTP methods with appropriate status codes

### Domain Model
- **Users**: Core user entity with email authentication and 2FA support
- **Hotels**: Business entities owned by users
- **Roles & Permissions**: Flexible RBAC with resource-action based permissions
- **Multi-level Access**: Global and hotel-specific role assignments

## Current Development Status and Recent Changes

### Recent Commits Analysis
- **Latest**: Documentation updates and AGENTS.md improvements
- **Architecture Cleanup**: TypeScript configuration refinement
- **Core Structure**: Complete MVP architecture implementation
- **Database Preparation**: Configuration ready, awaiting ERD for schema

### Current State
- **Status**: Early development phase with complete architectural foundation
- **Database**: Schema pending (ERD not yet provided)
- **Testing**: Test framework not yet implemented
- **Deployment**: Configuration for local development only

### Modified Files (Current Session)
- `src/core/http/errorHandler.ts` - Error handling improvements
- `src/core/http/response.ts` - Response helper enhancements
- `src/core/middleware/notFoundHandler.ts` - 404 handling updates

## Key Files and Their Purposes

### Core Application Files
- **`src/server.ts`**: Application entry point, server startup
- **`src/app.ts`**: Express configuration, middleware registration
- **`src/config/app.ts`**: Environment-based application configuration

### Business Logic Files
- **`src/domain/entity.ts`**: Core domain entities (User, Hotel, Role, Permission)
- **`src/rbac/enums.ts`**: Role and permission enumeration
- **`src/repositories/base.repository.ts`**: Generic repository contract

### Infrastructure Files
- **`src/core/http/`**: HTTP utilities, error handling, response helpers
- **`src/core/middleware/`**: Authentication, request ID, error handling middleware
- **`src/types/express.d.ts`**: Express type augmentations

## Development Workflow and Processes

### Development Commands
```bash
npm run dev    # Start development server with hot reload
npm test       # Run tests (not yet implemented)
```

### Code Standards
- **TypeScript Strict Mode**: Enforced for type safety
- **ES2020 Features**: Modern JavaScript capabilities
- **Error Handling**: All async operations wrapped with `asyncHandler`
- **Response Patterns**: Standardized HTTP responses (`ok`, `created`, `noContent`)
- **Authentication**: JWT-based with Express request augmentation

### API Conventions
- **Base Path**: `/api/v1/`
- **Error Format**: Standardized HTTP error responses
- **Async Handlers**: All controllers wrapped for proper error handling
- **Request ID**: Unique identifier for request tracing

## Future Development Areas

### Immediate Next Steps
1. **Database Schema**: Implement migrations based on provided ERD
2. **Authentication System**: Complete JWT implementation
3. **Test Framework**: Implement comprehensive testing strategy
4. **API Endpoints**: Build CRUD operations for core entities

### Technical Debt
- Missing test framework and test coverage
- Database implementation pending
- Production deployment configuration needed
- API documentation generation

### Scalability Considerations
- Repository pattern allows easy ORM integration
- Multi-tenant architecture supports horizontal scaling
- Versioned API structure supports backward compatibility
- RBAC system supports complex permission scenarios