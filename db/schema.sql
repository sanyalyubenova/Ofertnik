-- Neon PostgreSQL Database Schema for Ofertnik

-- Table for users
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'user', -- 'admin' or 'user'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for insurers
CREATE TABLE IF NOT EXISTS insurers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for CASCO tariffs
CREATE TABLE IF NOT EXISTS casco_tariffs (
    id SERIAL PRIMARY KEY,
    insurer_id INTEGER REFERENCES insurers(id) ON DELETE CASCADE,
    vehicle_age_min INTEGER,
    vehicle_age_max INTEGER,
    insurance_sum_min DECIMAL(10, 2),
    insurance_sum_max DECIMAL(10, 2),
    tariff_rate DECIMAL(10, 4) NOT NULL, -- Percentage rate
    discounts JSONB, -- Array of discount objects
    surcharges JSONB, -- Array of surcharge objects
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(insurer_id, vehicle_age_min, vehicle_age_max, insurance_sum_min, insurance_sum_max)
);

-- Table for MTPL tariffs
-- MTPL structure: basePremium + multipliers (stored as JSONB for flexibility)
CREATE TABLE IF NOT EXISTS mtpl_tariffs (
    id SERIAL PRIMARY KEY,
    insurer_id INTEGER REFERENCES insurers(id) ON DELETE CASCADE,
    base_premium DECIMAL(10, 2) NOT NULL,
    engine_size_multiplier JSONB, -- { "0-1000": 0.77, "1001-1400": 0.86, ... }
    power_multiplier JSONB, -- { "0-50": 0.89, "51-75": 1.0, ... }
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(insurer_id)
);

-- Table for GAP tariffs
CREATE TABLE IF NOT EXISTS gap_tariffs (
    id SERIAL PRIMARY KEY,
    insurer_id INTEGER REFERENCES insurers(id) ON DELETE CASCADE,
    coverage_level DECIMAL(5, 2) NOT NULL, -- 100, 125, 150
    tariff_rate DECIMAL(10, 4) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(insurer_id, coverage_level)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_casco_insurer ON casco_tariffs(insurer_id);
CREATE INDEX IF NOT EXISTS idx_casco_age ON casco_tariffs(vehicle_age_min, vehicle_age_max);
CREATE INDEX IF NOT EXISTS idx_casco_sum ON casco_tariffs(insurance_sum_min, insurance_sum_max);
CREATE INDEX IF NOT EXISTS idx_mtpl_insurer ON mtpl_tariffs(insurer_id);
CREATE INDEX IF NOT EXISTS idx_gap_insurer ON gap_tariffs(insurer_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_casco_tariffs_updated_at BEFORE UPDATE ON casco_tariffs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mtpl_tariffs_updated_at BEFORE UPDATE ON mtpl_tariffs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gap_tariffs_updated_at BEFORE UPDATE ON gap_tariffs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

