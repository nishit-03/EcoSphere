-- ============================================
-- EcoSphere Database Schema
-- PostgreSQL
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── COMMUNITIES ────────────────────────────
CREATE TABLE communities (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            VARCHAR(255) NOT NULL,
    type            VARCHAR(50) NOT NULL CHECK (type IN ('college', 'organization', 'city')),
    banner_image    TEXT,
    total_impact    FLOAT DEFAULT 0,          -- cumulative CO₂ in kg
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_communities_type ON communities(type);

-- ─── USERS ──────────────────────────────────
CREATE TABLE users (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name              VARCHAR(255) NOT NULL,
    email             VARCHAR(255) UNIQUE NOT NULL,
    profile_image_url TEXT,
    community_id      UUID REFERENCES communities(id) ON DELETE SET NULL,
    trust_score       FLOAT DEFAULT 50.0 CHECK (trust_score >= 0 AND trust_score <= 100),
    total_points      INTEGER DEFAULT 0,
    streak_count      INTEGER DEFAULT 0,
    created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_community ON users(community_id);
CREATE INDEX idx_users_email ON users(email);

-- ─── POSTS ──────────────────────────────────
CREATE TABLE posts (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id                 UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    community_id            UUID REFERENCES communities(id) ON DELETE SET NULL,
    action_type             VARCHAR(50) NOT NULL CHECK (action_type IN (
                                'walking', 'cycling', 'cleanup', 'planting',
                                'recycling', 'energy_saving', 'public_transit', 'other'
                            )),
    before_image_url        TEXT,
    after_image_url         TEXT,
    route_data              JSONB,                      -- GPS coordinates, polyline
    co2_saved               FLOAT DEFAULT 0,            -- kg
    calories_burned         FLOAT DEFAULT 0,
    distance_km             FLOAT DEFAULT 0,
    ai_verification_status  VARCHAR(20) DEFAULT 'pending' CHECK (ai_verification_status IN (
                                'pending', 'verified', 'rejected'
                            )),
    ai_confidence_score     FLOAT CHECK (ai_confidence_score >= 0 AND ai_confidence_score <= 1),
    ai_caption              TEXT,                       -- AI-generated motivational text
    caption                 TEXT,                       -- User-written caption
    likes_count             INTEGER DEFAULT 0,
    comments_count          INTEGER DEFAULT 0,
    share_count             INTEGER DEFAULT 0,
    created_at              TIMESTAMPTZ DEFAULT NOW()
);

-- Core query indexes
CREATE INDEX idx_posts_user ON posts(user_id);
CREATE INDEX idx_posts_community ON posts(community_id);
CREATE INDEX idx_posts_created ON posts(created_at DESC);
CREATE INDEX idx_posts_verified ON posts(ai_verification_status) WHERE ai_verification_status = 'verified';

-- Feed ranking composite index
CREATE INDEX idx_posts_feed_rank ON posts(ai_verification_status, created_at DESC, likes_count DESC);

-- ─── LIKES ──────────────────────────────────
CREATE TABLE likes (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id     UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(post_id, user_id)                  -- one like per user per post
);

CREATE INDEX idx_likes_post ON likes(post_id);
CREATE INDEX idx_likes_user ON likes(user_id);

-- ─── COMMENTS ───────────────────────────────
CREATE TABLE comments (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id             UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content             TEXT NOT NULL CHECK (char_length(content) > 0),
    ai_moderation_flag  BOOLEAN DEFAULT FALSE,    -- flagged by AI content moderation
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_comments_post ON comments(post_id);
CREATE INDEX idx_comments_user ON comments(user_id);
CREATE INDEX idx_comments_created ON comments(created_at DESC);

-- ─── NOTIFICATIONS ──────────────────────────
CREATE TABLE notifications (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type            VARCHAR(30) NOT NULL CHECK (type IN (
                        'like', 'comment', 'badge', 'challenge', 'verification'
                    )),
    reference_id    UUID,                       -- post_id, badge_id, etc.
    message         TEXT NOT NULL,
    is_read         BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, is_read, created_at DESC);
CREATE INDEX idx_notifications_unread ON notifications(user_id) WHERE is_read = FALSE;

-- ─── SAVED POSTS (Bookmarks) ───────────────
CREATE TABLE saved_posts (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    post_id     UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, post_id)
);

CREATE INDEX idx_saved_posts_user ON saved_posts(user_id, created_at DESC);

-- ─── FEED RANKING VIEW ─────────────────────
-- Materialized view for ranked feed (refreshed periodically)
CREATE MATERIALIZED VIEW feed_ranked AS
SELECT
    p.*,
    u.name AS user_name,
    u.profile_image_url AS user_avatar,
    u.trust_score AS user_trust,
    c.name AS community_name,
    -- Ranking formula: impact * 0.4 + engagement * 0.35 + recency * 0.25
    (
        (COALESCE(p.co2_saved, 0) * 10) * 0.4 +
        (COALESCE(p.likes_count, 0) + COALESCE(p.comments_count, 0) * 2) * 0.35 +
        (1.0 / (EXTRACT(EPOCH FROM (NOW() - p.created_at)) / 3600 + 1)) * 100 * 0.25
    ) AS rank_score
FROM posts p
JOIN users u ON p.user_id = u.id
LEFT JOIN communities c ON p.community_id = c.id
WHERE p.ai_verification_status = 'verified'
ORDER BY rank_score DESC;

CREATE INDEX idx_feed_ranked_score ON feed_ranked(rank_score DESC);

-- ─── TRIGGERS ───────────────────────────────
-- Auto-update likes_count on posts
CREATE OR REPLACE FUNCTION update_likes_count() RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE posts SET likes_count = likes_count - 1 WHERE id = OLD.post_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_likes_count
AFTER INSERT OR DELETE ON likes
FOR EACH ROW EXECUTE FUNCTION update_likes_count();

-- Auto-update comments_count on posts
CREATE OR REPLACE FUNCTION update_comments_count() RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE posts SET comments_count = comments_count - 1 WHERE id = OLD.post_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_comments_count
AFTER INSERT OR DELETE ON comments
FOR EACH ROW EXECUTE FUNCTION update_comments_count();

-- ─── ROUTE HEATMAP (aggregated intensity grid) ──
CREATE TABLE route_heatmap (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lat             DOUBLE PRECISION NOT NULL,
    lng             DOUBLE PRECISION NOT NULL,
    activity_type   VARCHAR(50) NOT NULL CHECK (activity_type IN (
                        'walking', 'cycling', 'cleanup', 'planting',
                        'recycling', 'energy_saving', 'public_transit', 'other'
                    )),
    intensity_score FLOAT DEFAULT 1.0 CHECK (intensity_score >= 0),
    last_updated    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_heatmap_location ON route_heatmap(lat, lng);
CREATE INDEX idx_heatmap_activity ON route_heatmap(activity_type);

