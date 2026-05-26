-- ============================================
-- Lucky & Power - Database Schema for Supabase
-- ============================================
-- Copy-paste semua query ini ke Supabase SQL Editor
-- Jalankan satu per satu atau sekaligus

-- 1. CREATE USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    email_verified_at TIMESTAMP NULL,
    password VARCHAR(255) NOT NULL,
    remember_token VARCHAR(100) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. CREATE PASSWORD RESET TOKENS TABLE
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    email VARCHAR(255) PRIMARY KEY,
    token VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NULL
);

-- 3. CREATE SESSIONS TABLE
CREATE TABLE IF NOT EXISTS sessions (
    id VARCHAR(255) PRIMARY KEY,
    user_id BIGINT NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    payload TEXT NOT NULL,
    last_activity INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 4. CREATE CACHE TABLE
CREATE TABLE IF NOT EXISTS cache (
    key VARCHAR(255) PRIMARY KEY,
    value TEXT NOT NULL,
    expiration INTEGER NOT NULL
);

-- 5. CREATE CACHE LOCKS TABLE
CREATE TABLE IF NOT EXISTS cache_locks (
    key VARCHAR(255) PRIMARY KEY,
    owner VARCHAR(255) NOT NULL,
    expiration INTEGER NOT NULL
);

-- 6. CREATE JOBS TABLE
CREATE TABLE IF NOT EXISTS jobs (
    id BIGSERIAL PRIMARY KEY,
    queue VARCHAR(255) NOT NULL,
    payload TEXT NOT NULL,
    attempts SMALLINT NOT NULL,
    reserved_at INTEGER NULL,
    available_at INTEGER NOT NULL,
    created_at INTEGER NOT NULL
);

-- 7. CREATE JOB BATCHES TABLE
CREATE TABLE IF NOT EXISTS job_batches (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    total_jobs INTEGER NOT NULL,
    pending_jobs INTEGER NOT NULL,
    failed_jobs INTEGER NOT NULL,
    failed_job_ids TEXT NOT NULL,
    options TEXT NULL,
    cancelled_at INTEGER NULL,
    created_at INTEGER NOT NULL,
    finished_at INTEGER NULL
);

-- 8. CREATE FAILED JOBS TABLE
CREATE TABLE IF NOT EXISTS failed_jobs (
    id BIGSERIAL PRIMARY KEY,
    uuid VARCHAR(255) NOT NULL UNIQUE,
    connection TEXT NOT NULL,
    queue TEXT NOT NULL,
    payload TEXT NOT NULL,
    exception TEXT NOT NULL,
    failed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. CREATE TRANSACTIONS TABLE (MAIN TABLE)
CREATE TABLE IF NOT EXISTS transactions (
    id BIGSERIAL PRIMARY KEY,
    type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
    amount BIGINT NOT NULL,
    category VARCHAR(50) NOT NULL,
    date TIMESTAMP NOT NULL,
    notes TEXT NULL,
    
    -- Additional fields from migrations
    namaBarang VARCHAR(100) NULL,
    namaSpesifik VARCHAR(255) NULL,
    kadar DECIMAL(8, 2) NULL,
    beratAwal DECIMAL(8, 2) NULL,
    beratTerima DECIMAL(8, 2) NULL,
    lantak DOUBLE PRECISION NULL,
    jenisProses VARCHAR(50) NULL,
    jenisTransaksi VARCHAR(50) NULL,
    
    -- PTG fields
    kadar_karat VARCHAR(20) NULL,
    berat DECIMAL(10, 2) NULL,
    ongkos DOUBLE PRECISION NULL,
    harga_per_gram DOUBLE PRECISION NULL,
    
    -- LAKU fields
    kode_baki VARCHAR(10) NULL,
    baris_ke INTEGER NULL,
    is_laku_locked BOOLEAN DEFAULT FALSE,
    
    -- LAKU optional fields (dari AddTransaction.jsx)
    laku_panjang DECIMAL(8, 2) NULL,
    laku_ti BOOLEAN DEFAULT FALSE,
    laku_pt INTEGER NULL,
    laku_selisih VARCHAR(50) NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. CREATE LOCKED SNAPSHOTS TABLE
CREATE TABLE IF NOT EXISTS locked_snapshots (
    id BIGSERIAL PRIMARY KEY,
    category VARCHAR(50) NOT NULL,
    date TIMESTAMP NOT NULL,
    period VARCHAR(50) NOT NULL,
    totalModal DOUBLE PRECISION NOT NULL,
    totalBeratTerima DOUBLE PRECISION NOT NULL,
    rataRataLantak DOUBLE PRECISION NOT NULL,
    totalBeratAwal DOUBLE PRECISION NOT NULL,
    totalBeratTambahan DOUBLE PRECISION NOT NULL,
    nilaiKemurnianEmas DOUBLE PRECISION NOT NULL,
    hargaEmasPerGram VARCHAR(100) NULL,
    hargaEmasStatus VARCHAR(50) NOT NULL,
    transaction_ids JSONB NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- CREATE INDEXES FOR BETTER PERFORMANCE
-- ============================================

-- Indexes on transactions table
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_kadar_karat ON transactions(kadar_karat);
CREATE INDEX IF NOT EXISTS idx_transactions_kode_baki ON transactions(kode_baki);
CREATE INDEX IF NOT EXISTS idx_transactions_is_laku_locked ON transactions(is_laku_locked);

-- Indexes on locked_snapshots table
CREATE INDEX IF NOT EXISTS idx_locked_snapshots_category ON locked_snapshots(category);
CREATE INDEX IF NOT EXISTS idx_locked_snapshots_date ON locked_snapshots(date);
CREATE INDEX IF NOT EXISTS idx_locked_snapshots_period ON locked_snapshots(period);

-- Indexes on sessions table
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_last_activity ON sessions(last_activity);

-- Indexes on jobs table
CREATE INDEX IF NOT EXISTS idx_jobs_queue ON jobs(queue);

-- Indexes on cache table
CREATE INDEX IF NOT EXISTS idx_cache_expiration ON cache(expiration);

-- Indexes on cache_locks table
CREATE INDEX IF NOT EXISTS idx_cache_locks_expiration ON cache_locks(expiration);

-- Indexes on failed_jobs table
CREATE INDEX IF NOT EXISTS idx_failed_jobs_uuid ON failed_jobs(uuid);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Jalankan query di bawah untuk verifikasi semua tabel sudah dibuat

-- Lihat semua tabel
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Lihat struktur transactions table
SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'transactions';

-- Lihat semua indexes
SELECT indexname FROM pg_indexes WHERE schemaname = 'public';
