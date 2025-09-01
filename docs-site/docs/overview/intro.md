# CRM MindiMedia

## Pengantar

CRM MindiMedia adalah sistem manajemen hubungan pelanggan (Customer Relationship Management) yang dirancang khusus untuk industri perhotelan dengan arsitektur multi-tenant. Sistem ini memungkinkan pengelolaan banyak hotel dalam satu platform dengan isolasi data yang sempurna dan kontrol akses berbasis peran (RBAC) yang canggih.

## Visi Produk

Menjadi platform CRM terdepan untuk industri perhotelan di Indonesia dengan menyediakan:
- 🏨 **Multi-Hotel Management**: Satu platform untuk mengelola banyak properti hotel
- 🔐 **Enterprise-Grade Security**: Keamanan tingkat perusahaan dengan autentikasi modern
- 🎯 **Role-Based Access Control**: Kontrol akses granular berbasis peran dan permission
- 📊 **Audit Trail Lengkap**: Pelacakan aktivitas komprehensif untuk compliance
- ⚡ **High Performance**: Arsitektur yang scalable dan performant

## Fitur Utama

### 1. Multi-Tenant Architecture
- Isolasi data per hotel yang sempurna
- Shared resources untuk efisiensi
- Hotel-scoped permissions dan roles
- Cross-hotel reporting untuk owner

### 2. Advanced Authentication System
- Bearer token authentication dengan JWT
- Token rotation otomatis
- Session management dengan anomaly detection
- Rate limiting untuk mencegah brute force

### 3. Comprehensive RBAC System
- Hierarchical role structure
- Granular permission control
- Hotel-scoped dan global roles
- Dynamic permission resolution

### 4. Clean Architecture Implementation
- Separation of concerns yang jelas
- Dependency injection container
- Domain-driven design principles
- Testable dan maintainable codebase

## Target Pengguna

### Hotel Owner
- Pemilik hotel atau jaringan hotel
- Memerlukan overview dari semua properti
- Akses penuh ke semua fitur dan data
- Dapat membuat dan mengelola hotel baru

### Hotel Manager
- Manajer operasional hotel
- Akses terbatas pada hotel yang dikelola
- Dapat mengelola staff dan operasional
- Reporting dan analytics per hotel

### Hotel Staff
- Staff operasional hotel
- Akses terbatas sesuai peran (Receptionist, Admin, etc.)
- Task-specific permissions
- Audit trail untuk setiap aktivitas

### System Administrator
- Administrator sistem (Superadmin)
- Maintenance dan monitoring
- User support dan troubleshooting
- System configuration

## Teknologi Stack

### Backend
- **Runtime**: Node.js v18+ dengan TypeScript
- **Framework**: Express.js 5
- **Database**: MySQL 8 dengan TypeORM
- **Authentication**: JWT dengan PBKDF2 hashing
- **Architecture**: Clean Architecture + DDD

### Security
- **Password Hashing**: PBKDF2 dengan salt unik
- **Token Management**: Access & Refresh token pair
- **Rate Limiting**: IP-based dan email-based
- **Session Management**: Redis-compatible memory store

### Development
- **Type Safety**: TypeScript dengan strict mode
- **Code Quality**: ESLint + Prettier
- **Database Migrations**: TypeORM migrations
- **Hot Reload**: Nodemon + ts-node

## Quick Start

```bash
# Clone repository
git clone [repository-url]
cd crm_mindimedia

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env dengan konfigurasi database

# Run migrations
npm run db:migrate

# Seed database
npm run db:seed

# Start development server
npm run dev
```

## Struktur Dokumentasi

- **[01-overview](./)**
  - Pengantar dan overview sistem
  - Business domain dan value proposition
  - Technology stack dan dependencies

- **[02-architecture](../02-architecture)**
  - Clean Architecture implementation
  - Multi-tenant design patterns
  - Database schema dan ERD

- **[03-security](../03-security)**
  - Authentication flow
  - RBAC system design
  - Security features

- **[04-business-features](../04-business-features)**
  - Hotel management
  - User management
  - Session management

- **[05-development](../05-development)**
  - Getting started guide
  - API testing dengan Postman
  - Database operations

- **[06-api-reference](../06-api-reference)**
  - Auto-generated API documentation
  - TypeScript interfaces dan types
  - Service layer documentation

## Kontak & Support

Untuk pertanyaan atau dukungan teknis, silakan hubungi:
- **Technical Lead**: MindiMedia Development Team
- **Repository**: [GitHub/GitLab URL]
- **Documentation**: [Docs URL]

---

*CRM MindiMedia - Enterprise Hotel Management System*
*Built with ❤️ by MindiMedia & Guirez*
