-- Table for saved offers
CREATE TABLE IF NOT EXISTS offers (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    offer_number VARCHAR(255), -- Optional offer number
    common_data JSONB NOT NULL, -- Common data (client, vehicle, address, etc.)
    offers_data JSONB NOT NULL, -- Array of offers (one per insurer)
    insurance_types JSONB NOT NULL, -- Array of insurance types (casco, mtpl, gap)
    title VARCHAR(255), -- Optional title for quick identification
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_offers_user_id ON offers(user_id);
CREATE INDEX IF NOT EXISTS idx_offers_created_at ON offers(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_offers_updated_at ON offers(updated_at DESC);

-- Trigger to automatically update updated_at
CREATE TRIGGER update_offers_updated_at BEFORE UPDATE ON offers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

