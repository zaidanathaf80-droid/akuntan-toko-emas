# Setup Supabase untuk Lucky & Power

## 📋 Daftar Isi
1. [Membuat Project Supabase](#membuat-project-supabase)
2. [Mengambil Connection String](#mengambil-connection-string)
3. [Konfigurasi Laravel](#konfigurasi-laravel)
4. [Testing Connection](#testing-connection)
5. [Troubleshooting](#troubleshooting)

---

## 1. Membuat Project Supabase

### A. Daftar Akun
1. Buka https://supabase.com
2. Klik **"Sign Up"** di pojok kanan atas
3. Pilih metode sign up:
   - **GitHub** (recommended - lebih cepat)
   - **Email** (buat akun baru)
4. Ikuti instruksi verifikasi

### B. Buat Project Baru
1. Setelah login, klik **"New Project"** atau **"Create a new project"**
2. Isi form dengan data berikut:

| Field | Nilai |
|-------|-------|
| **Project Name** | `lucky-and-power` |
| **Database Password** | Buat password kuat (min 8 karakter, mix huruf/angka/simbol) |
| **Region** | Pilih terdekat: Singapore, Tokyo, atau Sydney |
| **Pricing Plan** | Free (untuk development) |

3. Klik **"Create new project"**
4. **Tunggu 2-3 menit** sampai project selesai di-setup

---

## 2. Mengambil Connection String

### A. Akses Database Settings
1. Setelah project selesai, di sidebar kiri klik **"Settings"** (icon gear ⚙️)
2. Pilih tab **"Database"**
3. Scroll ke bawah cari section **"Connection string"** atau **"Connection pooling"**

### B. Copy Connection String
Kamu akan melihat beberapa opsi:
- **URI** (recommended untuk Laravel)
- **Connection Pooling** (untuk production)
- **JDBC**, **Go**, dll

**Pilih "URI"** dan copy string yang terlihat seperti:
```
postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_ID.supabase.co:5432/postgres?sslmode=require
```

### C. Parse Connection String
Dari string di atas, ekstrak:
- **Host**: `db.YOUR_PROJECT_ID.supabase.co`
- **Port**: `5432`
- **Database**: `postgres`
- **Username**: `postgres`
- **Password**: `YOUR_PASSWORD` (password yang kamu buat saat membuat project)

---

## 3. Konfigurasi Laravel

### A. Update .env File
Buka file `Backend/backend/.env` dan ubah bagian database:

```env
# Ganti dari MySQL ke PostgreSQL
DB_CONNECTION=pgsql
DB_HOST=db.YOUR_PROJECT_ID.supabase.co
DB_PORT=5432
DB_DATABASE=postgres
DB_USERNAME=postgres
DB_PASSWORD=YOUR_PASSWORD
```

**Contoh lengkap:**
```env
DB_CONNECTION=pgsql
DB_HOST=db.abcdefghijklmnop.supabase.co
DB_PORT=5432
DB_DATABASE=postgres
DB_USERNAME=postgres
DB_PASSWORD=MySecurePassword123!
```

### B. Verifikasi config/database.php
Buka `Backend/backend/config/database.php` dan pastikan PostgreSQL sudah dikonfigurasi:

```php
'pgsql' => [
    'driver' => 'pgsql',
    'url' => env('DATABASE_URL'),
    'host' => env('DB_HOST', '127.0.0.1'),
    'port' => env('DB_PORT', '5432'),
    'database' => env('DB_DATABASE', 'postgres'),
    'username' => env('DB_USERNAME', 'postgres'),
    'password' => env('DB_PASSWORD', ''),
    'charset' => 'utf8',
    'prefix' => '',
    'prefix_indexes' => true,
    'schema' => 'public',
    'sslmode' => 'require',
],
```

Jika tidak ada, tambahkan konfigurasi di atas.

---

## 4. Testing Connection

### A. Test dari Terminal
```bash
cd Backend/backend

# Test koneksi database
php artisan tinker
```

Di Tinker shell, jalankan:
```php
DB::connection()->getPdo();
// Jika berhasil, akan return PDO object
// Jika error, akan muncul pesan error
```

### B. Jalankan Migration
```bash
php artisan migrate
```

Jika berhasil, semua tabel akan dibuat di Supabase.

### C. Cek di Supabase Dashboard
1. Buka https://supabase.com
2. Masuk ke project kamu
3. Di sidebar, klik **"SQL Editor"**
4. Kamu akan melihat tabel-tabel yang sudah dibuat (users, transactions, dll)

---

## 5. Troubleshooting

### Error: "SQLSTATE[08006]"
**Penyebab**: Connection timeout atau host tidak ditemukan

**Solusi**:
- Pastikan host benar: `db.YOUR_PROJECT_ID.supabase.co`
- Pastikan password benar
- Cek internet connection

### Error: "SQLSTATE[42P01]"
**Penyebab**: Tabel tidak ditemukan

**Solusi**:
```bash
php artisan migrate:fresh
```

### Error: "SSL certificate problem"
**Penyebab**: SSL verification gagal

**Solusi**: Di `.env`, tambahkan:
```env
DB_SSLMODE=require
```

Atau di `config/database.php`, pastikan:
```php
'sslmode' => 'require',
```

### Koneksi Lambat
**Solusi**: Gunakan Connection Pooling
1. Di Supabase Settings > Database
2. Pilih **"Connection Pooling"** bukan "Direct Connection"
3. Copy URI dari Connection Pooling
4. Update `.env` dengan URI baru

---

## 📝 Checklist Setup

- [ ] Daftar akun Supabase
- [ ] Buat project baru
- [ ] Copy connection string
- [ ] Update `.env` dengan credentials Supabase
- [ ] Verifikasi `config/database.php`
- [ ] Test koneksi dengan `php artisan tinker`
- [ ] Jalankan `php artisan migrate`
- [ ] Verifikasi tabel di Supabase Dashboard

---

## 🔗 Referensi Berguna

- [Supabase Documentation](https://supabase.com/docs)
- [Laravel Database Configuration](https://laravel.com/docs/11.x/database)
- [PostgreSQL Connection Strings](https://www.postgresql.org/docs/current/libpq-connect.html)

---

**Selesai!** Database kamu sekarang terhubung ke Supabase PostgreSQL. 🎉
