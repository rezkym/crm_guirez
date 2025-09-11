# Seeds Data - JSON Configuration

Folder ini berisi konfigurasi JSON untuk database seeding yang memudahkan penambahan dan pengelolaan permissions, roles, dan role-permission mappings tanpa perlu mengubah kode TypeScript.

## File Konfigurasi

### 1. `permission_seeds.json`
Berisi semua permissions yang akan di-seed ke database.

**Format:**
```json
{
  "permissions": [
    {
      "name": "read:users",
      "guard_name": "api",
      "resource": "users",
      "action": "read",
      "description": "Izin membaca data pengguna"
    }
  ]
}
```

**Field:**
- `name`: Nama permission dalam format `action:resource`
- `guard_name`: Guard name (biasanya "api")
- `resource`: Resource yang diatur (contoh: users, hotels, settings)
- `action`: Action yang diizinkan (contoh: read, write, manage)
- `description`: (Optional) Deskripsi permission

### 2. `role_seeds.json`
Berisi semua roles yang akan di-seed ke database.

**Format:**
```json
{
  "roles": [
    {
      "name": "Super Administrator",
      "guard_name": "api",
      "slug": "superadmin",
      "hotel_id": null,
      "description": "Administrator utama dengan akses penuh"
    }
  ]
}
```

**Field:**
- `name`: Nama lengkap role
- `guard_name`: Guard name (biasanya "api")
- `slug`: Slug/identifier unik untuk role
- `hotel_id`: ID hotel untuk role hotel-specific, atau null untuk global role
- `description`: (Optional) Deskripsi role

### 3. `attach_role_permission.json`
Berisi mapping role-permission yang menentukan permission apa saja yang dimiliki setiap role.

**Format:**
```json
{
  "role_permissions": {
    "superadmin": [
      "read:users",
      "write:users",
      "read:hotels"
    ],
    "manager": [
      "read:hotels",
      "read:users"
    ]
  }
}
```

**Field:**
- Key: Slug role
- Value: Array permission names yang dimiliki role tersebut

## Cara Menambah Permission Baru

1. **Tambahkan di `permission_seeds.json`:**
```json
{
  "name": "read:bookings",
  "guard_name": "api",
  "resource": "bookings",
  "action": "read",
  "description": "Izin membaca data booking"
}
```

2. **Assign ke role di `attach_role_permission.json`:**
```json
{
  "role_permissions": {
    "manager": [
      "read:hotels",
      "read:users",
      "read:bookings"  // ← Tambahkan disini
    ]
  }
}
```

3. **Jalankan seeding:**
```bash
npm run db:seed
```

## Cara Menambah Role Baru

1. **Tambahkan di `role_seeds.json`:**
```json
{
  "name": "Front Office",
  "guard_name": "api",
  "slug": "front_office",
  "hotel_id": null,
  "description": "Staff front office hotel"
}
```

2. **Assign permissions di `attach_role_permission.json`:**
```json
{
  "role_permissions": {
    "front_office": [
      "read:bookings",
      "write:bookings",
      "read:hotels"
    ]
  }
}
```

3. **Jalankan seeding:**
```bash
npm run db:seed
```

## Format Permission Naming

Gunakan format konsisten: `action:resource`

**Actions yang umum:**
- `read`: Membaca data
- `write`: Menulis/mengubah data (create, update, delete)
- `manage`: Akses penuh (biasanya untuk admin)
- `invite`: Mengundang user
- `assign_role`: Mengassign role

**Resources yang ada:**
- `users`: Manajemen pengguna
- `hotels`: Manajemen hotel
- `roles`: Manajemen role
- `permissions`: Manajemen permission
- `settings`: Pengaturan sistem
- `reports`: Laporan
- `bookings`: (Future) Booking/reservasi
- `actions`: Tindakan sistem

## Role Hierarchy

Saat ini tersedia role dengan tingkat akses:

1. **superadmin**: Akses penuh ke semua fitur
2. **owner**: Akses penuh untuk hotel tertentu
3. **admin**: Akses administratif untuk hotel
4. **manager**: Akses manajemen terbatas
5. **assessor**: Akses untuk penilaian
6. **marketing**: Akses untuk fitur marketing
7. **user**: Akses terbatas untuk pengguna biasa

## Validasi Data

Sistem akan memvalidasi data sebelum seeding:

- **Permission**: Harus memiliki name, guard_name, resource, dan action
- **Role**: Harus memiliki name, guard_name, dan slug
- **Mapping**: Akan memberikan warning jika role atau permission tidak ditemukan

## Tips Development

1. **Backup sebelum seeding**: Data akan dihapus dan di-recreate
2. **Test di development**: Selalu test perubahan di environment development
3. **Konsisten naming**: Gunakan format naming yang konsisten
4. **Dokumentasi**: Tambahkan description untuk kemudahan maintenance
5. **Gradual rollout**: Tambahkan permission baru secara bertahap

## Troubleshooting

### Error "Permission tidak ditemukan"
- Cek spelling di `attach_role_permission.json`
- Pastikan permission sudah ada di `permission_seeds.json`

### Error "Role tidak ditemukan"
- Cek slug di `attach_role_permission.json`
- Pastikan role sudah ada di `role_seeds.json`

### Error validasi
- Pastikan semua field required sudah diisi
- Cek format JSON yang benar (koma, quotes, dll.)

### Error FK constraint
- Seeder akan otomatis menghapus data dalam urutan yang benar
- Jangan manual delete di database saat seeding berjalan
