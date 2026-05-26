# Setup Supabase Lengkap untuk Lucky & Power

## 📋 Checklist Setup

- [ ] Buat project baru di Supabase
- [ ] Copy credentials Supabase
- [ ] Update `.env` di Backend
- [ ] Jalankan SQL queries di Supabase
- [ ] Test koneksi Laravel
- [ ] Verifikasi tabel di Supabase

---

## Step 1: Buat Project Baru di Supabase

1. Buka https://supabase.com
2. Login dengan akun kamu
3. Klik **"New Project"**
4. Isi form:
   - **Project Name**: `lucky-and-power` (atau nama lain)
   - **Database Password**: Buat password kuat (min 8 karakter)
   - **Region**: Pilih `Asia Pacific (Singapore)` atau `Asia Pacific (Tokyo)`
5. Klik **"Create new project"**
6. **Tunggu 2-3 menit** sampai project selesai

---

## Step 2: Ambil Credentials Supabase

Setelah project selesai:

1. Di halaman project, klik **"Settings"** (icon gear ⚙️)
2. Pilih tab **"General"**
3. Cari section **"Project ID"** dan **"Project region"**
4. Copy **Project ID** (contoh: `yocedwdzdxnyggqoniw`)

Dari Project ID, kamu bisa construct connection string:
```
Host: db.YOUR_PROJECT_ID.supabase.co
Port: 5432
Database: postgres
Username: postgres
Password: PASSWORD_YANG_KAU_BUAT
```

---

## Step 3: Update `.env` di Backend

Buka file `Backend/backend/.env` dan update bagian database:

```env
DB_CONNECTION=pgsql
DB_HOST=db.YOUR_PROJECT_ID.supabase.co
DB_PORT=5432
DB_DATABASE=postgres
DB_USERNAME=postgres
DB_PASSWORD=YOUR_PASSWORD
```

**Contoh:**
```env
DB_CONNECTION=pgsql
DB_HOST=db.yocedwdzdxnyggqoniw.supabase.co
DB_PORT=5432
DB_DATABASE=postgres
DB_USERNAME=postgres
DB_PASSWORD=MySecurePassword123!
```

---

## Step 4: Jalankan SQL Queries di Supabase

1. Buka project Supabase kamu
2. Di sidebar kiri, klik **"SQL Editor"**
3. Klik **"New Query"**
4. Copy-paste **SEMUA** query dari file `SUPABASE_QUERIES.sql`
5. Klik **"Run"** atau tekan `Ctrl+Enter`

**Atau** jalankan per bagian:
- Jalankan CREATE TABLE queries dulu
- Kemudian jalankan CREATE INDEX queries
- Terakhir jalankan VERIFICATION queries

---

## Step 5: Test Koneksi Laravel

Buka terminal di folder `Backend/backend`:

```bash
# Test koneksi database
php artisan tinker
```

Di Tinker shell, jalankan:
```php
DB::connection()->getPdo();
// Jika berhasil, akan return PDO object
// Jika error, akan muncul pesan error
```

Jika berhasil, exit dengan:
```php
exit
```

---

## Step 6: Verifikasi Tabel di Supabase

1. Buka Supabase Dashboard
2. Di sidebar kiri, klik **"Table Editor"**
3. Kamu akan melihat semua tabel yang sudah dibuat:
   - `users`
   - `password_reset_tokens`
   - `sessions`
   - `cache`
   - `cache_locks`
   - `jobs`
   - `job_batches`
   - `failed_jobs`
   - **`transactions`** (tabel utama)
   - `locked_snapshots`

---

## 🔍 Troubleshooting

### Error: "SQLSTATE[08006]"
**Penyebab**: Connection timeout

**Solusi**:
- Pastikan Host benar: `db.YOUR_PROJECT_ID.supabase.co`
- Pastikan password benar
- Cek internet connection

### Error: "SQLSTATE[42P01] - relation does not exist"
**Penyebab**: Tabel belum dibuat

**Solusi**:
- Jalankan SQL queries lagi di Supabase SQL Editor
- Pastikan semua query berhasil (tidak ada error)

### Error: "SSL certificate problem"
**Penyebab**: SSL verification gagal

**Solusi**: Di `.env`, tambahkan:
```env
DB_SSLMODE=require
```

### Koneksi Lambat
**Solusi**: Gunakan Connection Pooling
1. Di Supabase Settings > Database
2. Cari "Connection Pooling" section
3. Copy URI dari sana
4. Update `.env` dengan URI baru

---

## 📝 File-File Penting

| File | Lokasi | Fungsi |
|------|--------|--------|
| `.env` | `Backend/backend/.env` | Konfigurasi database |
| `SUPABASE_QUERIES.sql` | Root folder | SQL queries untuk membuat tabel |
| `config/database.php` | `Backend/backend/config/database.php` | Konfigurasi Laravel database |

---

## ✅ Verifikasi Akhir

Jalankan command ini untuk memastikan semuanya terhubung:

```bash
cd Backend/backend

# Test koneksi
php artisan tinker
DB::table('transactions')->count();
// Jika berhasil, akan return: 0 (karena belum ada data)

# Atau test dengan query
DB::select('SELECT * FROM information_schema.tables WHERE table_schema = ?', ['public']);
// Akan menampilkan semua tabel
```

---

## 🎉 Selesai!

Database kamu sekarang sudah terhubung ke Supabase PostgreSQL dan siap digunakan!

Sekarang kamu bisa:
1. Menjalankan backend Laravel: `php artisan serve`
2. Menjalankan frontend React: `npm run dev`
3. Mulai menambah data transaksi

---

## 📞 Bantuan Lebih Lanjut

Jika ada error atau pertanyaan:
1. Cek file `SUPABASE_SETUP.md` untuk panduan detail
2. Baca error message dengan teliti
3. Pastikan semua credentials benar di `.env`
4. Verifikasi tabel di Supabase Table Editor
