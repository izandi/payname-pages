-- Payname Pages Database Schema
-- Users table for wallet addresses
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    address VARCHAR(42) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Domains table for verified domain ownership
CREATE TABLE IF NOT EXISTS domains (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    owner_address VARCHAR(42) NOT NULL,
    verified_bool BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_address) REFERENCES users(address)
);

-- Payouts configuration for each domain
CREATE TABLE IF NOT EXISTS payouts (
    id SERIAL PRIMARY KEY,
    domain_id INTEGER UNIQUE NOT NULL,
    to_address VARCHAR(42) NOT NULL,
    mode VARCHAR(20) DEFAULT 'onchain' CHECK (mode IN ('onchain', 'offchain')),
    tx_hash VARCHAR(66),
    signature TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (domain_id) REFERENCES domains(id) ON DELETE CASCADE
);

-- Messages with cryptographic verification
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    domain_id INTEGER NOT NULL,
    from_address VARCHAR(42) NOT NULL,
    body TEXT NOT NULL,
    signature TEXT NOT NULL,
    verified_bool BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    hidden_bool BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (domain_id) REFERENCES domains(id) ON DELETE CASCADE
);

-- Orderbook snapshots cache
CREATE TABLE IF NOT EXISTS offer_snapshots (
    id SERIAL PRIMARY KEY,
    domain_id INTEGER NOT NULL,
    best_bid DECIMAL(20,8),
    best_ask DECIMAL(20,8),
    liquidity_score DECIMAL(10,4),
    source_ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (domain_id) REFERENCES domains(id) ON DELETE CASCADE
);

-- Muted addresses per domain
CREATE TABLE IF NOT EXISTS mutes (
    id SERIAL PRIMARY KEY,
    domain_id INTEGER NOT NULL,
    muted_address VARCHAR(42) NOT NULL,
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(domain_id, muted_address),
    FOREIGN KEY (domain_id) REFERENCES domains(id) ON DELETE CASCADE
);

-- Page customization versions
CREATE TABLE IF NOT EXISTS page_versions (
    id SERIAL PRIMARY KEY,
    domain_id INTEGER NOT NULL,
    title VARCHAR(255),
    description TEXT,
    theme_json JSONB,
    og_image_url TEXT,
    seo_schema_json JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (domain_id) REFERENCES domains(id) ON DELETE CASCADE
);

-- Campaign/goal tracking
CREATE TABLE IF NOT EXISTS campaigns (
    id SERIAL PRIMARY KEY,
    domain_id INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    target_amount DECIMAL(20,8) NOT NULL,
    currency VARCHAR(10) DEFAULT 'ETH',
    ends_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (domain_id) REFERENCES domains(id) ON DELETE CASCADE
);

-- Receipt/proof of payment tracking
CREATE TABLE IF NOT EXISTS receipts (
    id SERIAL PRIMARY KEY,
    campaign_id INTEGER,
    domain_id INTEGER NOT NULL,
    payer_address VARCHAR(42) NOT NULL,
    tx_hash VARCHAR(66) NOT NULL,
    amount DECIMAL(20,8) NOT NULL,
    token VARCHAR(42),
    minted_nft_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE SET NULL,
    FOREIGN KEY (domain_id) REFERENCES domains(id) ON DELETE CASCADE
);

-- Chat threads for XMTP integration (optional)
CREATE TABLE IF NOT EXISTS chat_threads (
    id SERIAL PRIMARY KEY,
    domain_id INTEGER NOT NULL,
    peer_address VARCHAR(42) NOT NULL,
    last_msg_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(domain_id, peer_address),
    FOREIGN KEY (domain_id) REFERENCES domains(id) ON DELETE CASCADE
);

-- Chat messages index for XMTP
CREATE TABLE IF NOT EXISTS chat_messages (
    id SERIAL PRIMARY KEY,
    thread_id INTEGER NOT NULL,
    from_address VARCHAR(42) NOT NULL,
    body_cipher TEXT,
    msg_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (thread_id) REFERENCES chat_threads(id) ON DELETE CASCADE
);

-- Audit logs for security tracking
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    actor_address VARCHAR(42) NOT NULL,
    action VARCHAR(100) NOT NULL,
    target_type VARCHAR(50),
    target_id INTEGER,
    meta_json JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_domains_owner ON domains(owner_address);
CREATE INDEX IF NOT EXISTS idx_messages_domain ON messages(domain_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_verified ON messages(verified_bool, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_receipts_domain ON receipts(domain_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs(actor_address, created_at DESC);
