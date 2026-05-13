-- =====================================================
-- Wallet & Transaction Management System - Schema
-- PostgreSQL (Supabase compatible)
-- =====================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- users
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name          VARCHAR(120) NOT NULL,
    email         VARCHAR(180) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

-- =====================================================
-- wallets
-- One wallet per user. Balance is stored in paise/cents.
-- =====================================================
CREATE TABLE IF NOT EXISTS wallets (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    balance    BIGINT NOT NULL DEFAULT 0 CHECK (balance >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets (user_id);

-- =====================================================
-- transactions
-- type:   'DEPOSIT' | 'TRANSFER'
-- status: 'SUCCESS' | 'FAILED' | 'PENDING'
-- Money values stored in paise/cents as BIGINT.
-- =====================================================
CREATE TABLE IF NOT EXISTS transactions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_wallet_id    UUID REFERENCES wallets(id) ON DELETE SET NULL,
    receiver_wallet_id  UUID REFERENCES wallets(id) ON DELETE SET NULL,
    type                VARCHAR(20) NOT NULL CHECK (type IN ('DEPOSIT', 'TRANSFER')),
    amount              BIGINT NOT NULL CHECK (amount > 0),
    status              VARCHAR(20) NOT NULL CHECK (status IN ('SUCCESS', 'FAILED', 'PENDING')),
    description         TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tx_sender   ON transactions (sender_wallet_id);
CREATE INDEX IF NOT EXISTS idx_tx_receiver ON transactions (receiver_wallet_id);
CREATE INDEX IF NOT EXISTS idx_tx_created  ON transactions (created_at DESC);
