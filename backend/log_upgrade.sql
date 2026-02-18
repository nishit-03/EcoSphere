-- ============================================================
-- EcoSphere — Log Action Upgrade Migration
-- Run in Supabase SQL Editor AFTER supabase_setup.sql
-- ============================================================

-- ─── Add missing columns to posts ────────────────────────────
ALTER TABLE posts ADD COLUMN IF NOT EXISTS location_lat DOUBLE PRECISION;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS location_lng DOUBLE PRECISION;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS waste_weight_kg FLOAT;

-- ─── Expand action_type CHECK to include 'custom' ────────────
-- Drop old constraint and recreate with 'custom' added
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_action_type_check;
ALTER TABLE posts ADD CONSTRAINT posts_action_type_check CHECK (action_type IN (
    'walking', 'cycling', 'cleanup', 'planting',
    'recycling', 'energy_saving', 'public_transit', 'custom', 'other'
));

-- ─── Verification ────────────────────────────────────────────
SELECT
    column_name, data_type
FROM information_schema.columns
WHERE table_name = 'posts'
  AND column_name IN ('location_lat', 'location_lng', 'waste_weight_kg')
ORDER BY column_name;
