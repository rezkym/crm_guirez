# Database Documentation

## Environment Variables

Untuk menggunakan database, pastikan file `.env` sudah dikonfigurasi dengan variabel berikut:

```env
# Database Configuration
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASS=your_password
DB_NAME=mindi_crm
DB_SSL=false
DB_LOGGING=0
```

## Available Commands

### Migration Commands

```bash
# Menjalankan semua migration yang belum dijalankan
npm run db:migrate

# Rollback satu migration terakhir
npm run db:rollback

# Drop semua tabel dan jalankan ulang semua migration
npm run db:fresh
```

### Seeder Commands

```bash
# Menjalankan seeder (mengisi data development)
npm run db:seed

# Fresh migration + seeder (drop tabel, migrate, lalu seed)
npm run db:refresh
```

## Urutan Penggunaan

1. **Setup Database**: Pastikan MySQL server berjalan dan database `mindi_crm` sudah dibuat
2. **Konfigurasi Environment**: Copy `env.example` ke `.env` dan sesuaikan konfigurasi database
3. **Install Dependencies**: Jalankan `npm install` untuk menginstall TypeORM dan MySQL2
4. **Run Migration**: Jalankan `npm run db:migrate` untuk membuat semua tabel
5. **Run Seeder**: Jalankan `npm run db:seed` untuk mengisi data development

### Quick Start

```bash
# Untuk development, gunakan refresh untuk setup database dari awal
npm run db:refresh
```

## Database Schema

Database terdiri dari 8 tabel utama:

1. **permissions** - Izin akses sistem
2. **users** - Data pengguna
3. **hotels** - Data hotel
4. **roles** - Peran/role dalam sistem
5. **role_has_permissions** - Relasi role-permission (many-to-many)
6. **model_has_roles** - Relasi model-role dengan hotel context
7. **model_has_permissions** - Relasi model-permission dengan hotel context
8. **hotel_users** - Member hotel (user yang terdaftar di hotel)

## Development Data

Seeder akan mengisi database dengan data development berikut:

### Users (dengan scope)
- Internal (dibuat/di-manage oleh superadmin):
  - `admin@example.com` / `admin123` — Super Administrator (user_scope=internal)
  - `internal.admin@example.com` / `admin123` — Internal Admin (user_scope=internal)
- Eksternal (client/hotel):
  - `owner@example.com` / `owner123` — Hotel Owner (user_scope=external)
  - `manager@example.com` / `manager123` — Hotel Manager (user_scope=external)
  - `marketing@example.com` / `marketing123` — Hotel Marketing (user_scope=external)
  - `user@example.com` / `user123` — Regular User (user_scope=external)

### Permissions
- `users:read`, `users:write`
- `hotels:read`, `hotels:write`
- `roles:manage`, `permissions:manage`

### Roles
- Global (internal):
  - **superadmin**: akses penuh (global)
  - **admin**: administratif global (subset dari superadmin)
- Tenant (eksternal, scope hotel):
  - **owner**: admin penuh untuk hotel sendiri
  - **manager**: manage hotel dan baca users pada hotel
  - **marketing**: akses fitur pemasaran pada hotel
  - **user**: akses terbatas (baca hotel)

### Sample Data
- Hotel "Hotel Contoh" dimiliki oleh `owner@example.com` dengan member `manager`, `marketing`, dan `user`

## Important Notes

- **Seeders hanya untuk development**: Jangan gunakan seeder di production
- **Password Security**: Password di-hash menggunakan PBKDF2 dengan 210,000 iterations
- **Foreign Key Constraints**: Semua FK menggunakan `RESTRICT` untuk mencegah penghapusan data yang masih berelasi
- **Soft Delete Support**: Semua tabel memiliki kolom `deleted_at` untuk soft delete
