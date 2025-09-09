## Laporan Hasil Pengujian API

### Lingkungan & Prasyarat
- Base URL: `http://localhost:3000`
- API Prefix: `/api`, Version: `/v1`
- Server sudah berjalan (tanpa instalasi tambahan)
- Akun dari seeder:
  - admin@example.com / admin123
  - manager@example.com / manager123
  - user@example.com / user123

### Ringkasan Hasil (High-level)
- Health endpoints: OK (200)
- Login: valid berhasil (pakai password seeder), invalid sesuai ekspektasi
- Protected `/me/profile`: OK (200) dengan token valid; 401 untuk kasus tanpa/invalid token
- RBAC `/me/admin`: 403 untuk admin & manager karena user tidak memiliki role ter-attach (roles kosong)
- Permissions (`/me/settings`, `POST /me/action`): 403 (permission/role tidak ada)
- Refresh: 
  - Missing: 400; Invalid format: 400 (dokumen mengharapkan 401)
  - Valid refresh: 200; Reuse token sama: 401 dengan code `REFRESH_REUSE_DETECTED`
- Logout: 401 (token invalid/expired saat dicoba)
- Rate limiting (login gagal berulang): throttle aktif setelah beberapa kali percobaan salah

### Catatan Deviasi dari Dokumen
- Invalid refresh token mengembalikan 400 (bukan 401 seperti di dokumen)
- RBAC sukses (200) tidak tervalidasi karena roles tidak ter-attach pada user hasil login (payload profile menunjukkan `roles: []`)

---

## Rincian Pengujian & Hasil Aktual

### 1) Health Check
```bash
curl -s -o /dev/stderr -w "%{http_code}\n" http://localhost:3000/api/health
```
Hasil: 200, body (ringkas):
```json
{"data":{"status":"ok","uptimeSeconds":1417},"meta":{"requestId":"..."}}
```

```bash
curl -s -o /dev/stderr -w "%{http_code}\n" http://localhost:3000/api/v1/health
```
Hasil: 200, body (ringkas):
```json
{"data":{"status":"ok","uptimeSeconds":1429,"version":"v1"},"meta":{"requestId":"..."}}
```

### 2) Authentication Flow
- Login valid (seeder):
```bash
curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```
Hasil: 200, berisi `data.tokens.accessToken` dan `data.tokens.refreshToken`.

- Login dengan password salah:
```bash
curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"wrongpassword"}'
```
Hasil: 401 `{"error":"Invalid credentials"}`

- Login email invalid:
```bash
curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"invalid-email","password":"password123"}'
```
Hasil: 400 `{"error":"Invalid email format"}`

- Login body kosong:
```bash
curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{}'
```
Hasil: 400 `{"error":"Email and password are required"}`

### 3) Menyimpan Token ke Variabel Shell (untuk tes lanjutan)
```bash
ADMIN_LOGIN=$(curl -s -X POST http://localhost:3000/api/v1/auth/login -H "Content-Type: application/json" -d '{"email":"admin@example.com","password":"admin123"}')
ADMIN_AT=$(echo $ADMIN_LOGIN | jq -r '.data.tokens.accessToken')
ADMIN_RT=$(echo $ADMIN_LOGIN | jq -r '.data.tokens.refreshToken')

MANAGER_LOGIN=$(curl -s -X POST http://localhost:3000/api/v1/auth/login -H "Content-Type: application/json" -d '{"email":"manager@example.com","password":"manager123"}')
MANAGER_AT=$(echo $MANAGER_LOGIN | jq -r '.data.tokens.accessToken')

USER_LOGIN=$(curl -s -X POST http://localhost:3000/api/v1/auth/login -H "Content-Type: application/json" -d '{"email":"user@example.com","password":"user123"}')
USER_AT=$(echo $USER_LOGIN | jq -r '.data.tokens.accessToken')
```

### 4) Protected Endpoint: `/me/profile`
- Tanpa token:
```bash
curl -s -X GET http://localhost:3000/api/v1/me/profile
```
Hasil: 401 `{"error":"Access token required"}`

- Token invalid:
```bash
curl -s -X GET http://localhost:3000/api/v1/me/profile \
  -H "Authorization: Bearer invalid.token.here"
```
Hasil: 401 `{"error":"Invalid token format"}`

- Token admin valid:
```bash
curl -s -X GET http://localhost:3000/api/v1/me/profile \
  -H "Authorization: Bearer $ADMIN_AT"
```
Hasil: 200, body mengandung `userId`, `sessionId`, `roles: []`, `permissions: []`.

### 5) RBAC Endpoints
- `/me/admin` dengan admin:
```bash
curl -s -X GET http://localhost:3000/api/v1/me/admin \
  -H "Authorization: Bearer $ADMIN_AT"
```
Hasil: 403 `{"error":"Requires one of these roles: admin, manager"}`

- `/me/admin` dengan manager:
```bash
curl -s -X GET http://localhost:3000/api/v1/me/admin \
  -H "Authorization: Bearer $MANAGER_AT"
```
Hasil: 403 `{"error":"Requires one of these roles: admin, manager"}`

- `/me/superadmin`: tidak dieksekusi (tidak ada akun superadmin pada seeder saat pengujian ini).

### 6) Permission Endpoints
- GET `/me/settings` dengan manager:
```bash
curl -s -X GET http://localhost:3000/api/v1/me/settings \
  -H "Authorization: Bearer $MANAGER_AT"
```
Hasil: 403 `{"error":"Requires permission: read:settings"}`

- GET `/me/settings` dengan user:
```bash
curl -s -X GET http://localhost:3000/api/v1/me/settings \
  -H "Authorization: Bearer $USER_AT"
```
Hasil: 403 `{"error":"Requires permission: read:settings"}`

- POST `/me/action` dengan manager:
```bash
curl -s -X POST http://localhost:3000/api/v1/me/action \
  -H "Authorization: Bearer $MANAGER_AT" \
  -H "Content-Type: application/json" \
  -d '{}'
```
Hasil: 403 `{"error":"Requires one of roles: manager OR permissions: write:actions"}`

### 7) Token Refresh
- Missing token:
```bash
curl -s -X POST http://localhost:3000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{}'
```
Hasil: 400 `{"error":"Refresh token is required"}`

- Invalid token format:
```bash
curl -s -X POST http://localhost:3000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"invalid.token.here"}'
```
Hasil: 400 `{"error":"Invalid token format"}`

- Valid refresh + reuse:
```bash
echo First_refresh && \
curl -s -X POST http://localhost:3000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"'$ADMIN_RT'"}' && echo && \
echo Second_refresh_reuse && \
curl -s -X POST http://localhost:3000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"'$ADMIN_RT'"}'
```
Hasil:
```json
// First_refresh → 200: kembalikan accessToken & refreshToken baru
// Second_refresh_reuse → 401: { "error": { "code": "REFRESH_REUSE_DETECTED", ... } }
```

### 8) Logout
```bash
curl -s -X POST http://localhost:3000/api/v1/auth/logout \
  -H "Authorization: Bearer $ADMIN_AT"
```
Hasil: 401 `{"error":"Invalid or expired token"}`

### 9) Rate Limiting (Login Gagal Berulang)
```bash
for i in {1..10}; do
  curl -s -X POST http://localhost:3000/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@example.com","password":"wrongpassword"}'; echo; sleep 0.1;
done
```
Hasil (ringkas): beberapa respons 401 "Invalid credentials" di awal, kemudian muncul
`"Too many login attempts. Try again after <timestamp>"` untuk sisa percobaan.

---

## Rekomendasi Tindak Lanjut (Tanpa Perubahan Kode dalam Pengujian Ini)
- Attach role/permission ke user (mis. admin → role admin, manager → role manager) agar jalur sukses RBAC/permission dapat tervalidasi (200)
- Selaraskan kode status untuk refresh token invalid (400 vs 401) dengan dokumentasi atau perbarui dokumentasi sesuai perilaku aktual


