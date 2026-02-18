-- ============================================================
-- EcoSphere — Supabase Setup SQL
-- Run this ENTIRE script in the Supabase SQL Editor
-- (Dashboard → SQL Editor → New Query → Paste → Run)
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── COMMUNITIES ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS communities (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            VARCHAR(255) NOT NULL,
    type            VARCHAR(50) NOT NULL DEFAULT 'college' CHECK (type IN ('college', 'organization', 'city')),
    banner_image    TEXT,
    total_impact    FLOAT DEFAULT 0,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── USERS ──────────────────────────────────────────────────
-- id matches auth.users.id for real signups (enforced by trigger, not FK)
-- No FK constraint so dummy seed users can be inserted freely
CREATE TABLE IF NOT EXISTS users (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name              VARCHAR(255) NOT NULL DEFAULT 'EcoUser',
    email             VARCHAR(255),
    profile_image_url TEXT,
    community_id      UUID REFERENCES communities(id) ON DELETE SET NULL,
    trust_score       FLOAT DEFAULT 50.0 CHECK (trust_score >= 0 AND trust_score <= 100),
    total_points      INTEGER DEFAULT 0,
    streak_count      INTEGER DEFAULT 0,
    created_at        TIMESTAMPTZ DEFAULT NOW()
);


CREATE INDEX IF NOT EXISTS idx_users_community ON users(community_id);

-- ─── POSTS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS posts (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id                 UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    community_id            UUID REFERENCES communities(id) ON DELETE SET NULL,
    action_type             VARCHAR(50) NOT NULL DEFAULT 'other' CHECK (action_type IN (
                                'walking', 'cycling', 'cleanup', 'planting',
                                'recycling', 'energy_saving', 'public_transit', 'other'
                            )),
    action_label            TEXT,
    before_image_url        TEXT,
    after_image_url         TEXT,
    route_data              JSONB,
    co2_saved               FLOAT DEFAULT 0,
    calories_burned         FLOAT DEFAULT 0,
    distance_km             FLOAT DEFAULT 0,
    ai_verification_status  VARCHAR(20) DEFAULT 'pending' CHECK (ai_verification_status IN (
                                'pending', 'verified', 'rejected'
                            )),
    ai_confidence_score     FLOAT CHECK (ai_confidence_score >= 0 AND ai_confidence_score <= 1),
    ai_caption              TEXT,
    caption                 TEXT,
    likes_count             INTEGER DEFAULT 0,
    comments_count          INTEGER DEFAULT 0,
    share_count             INTEGER DEFAULT 0,
    created_at              TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_posts_user ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_community ON posts(community_id);
CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_verified ON posts(ai_verification_status) WHERE ai_verification_status = 'verified';

-- ─── LIKES ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS likes (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id     UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_likes_post ON likes(post_id);
CREATE INDEX IF NOT EXISTS idx_likes_user ON likes(user_id);

-- ─── COMMENTS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS comments (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id             UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content             TEXT NOT NULL CHECK (char_length(content) > 0),
    ai_moderation_flag  BOOLEAN DEFAULT FALSE,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_user ON comments(user_id);

-- ─── NOTIFICATIONS ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type            VARCHAR(30) NOT NULL CHECK (type IN (
                        'like', 'comment', 'badge', 'challenge', 'verification'
                    )),
    reference_id    UUID,
    message         TEXT NOT NULL,
    is_read         BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read, created_at DESC);

-- ─── SAVED POSTS ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS saved_posts (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    post_id     UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, post_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_posts_user ON saved_posts(user_id, created_at DESC);

-- ─── ROUTE HEATMAP ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS route_heatmap (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lat             DOUBLE PRECISION NOT NULL,
    lng             DOUBLE PRECISION NOT NULL,
    activity_type   VARCHAR(50) NOT NULL DEFAULT 'other',
    intensity_score FLOAT DEFAULT 1.0,
    last_updated    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── TRIGGERS: auto-update likes_count ──────────────────────
CREATE OR REPLACE FUNCTION update_likes_count() RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.post_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_likes_count ON likes;
CREATE TRIGGER trg_likes_count
AFTER INSERT OR DELETE ON likes
FOR EACH ROW EXECUTE FUNCTION update_likes_count();

-- ─── TRIGGERS: auto-update comments_count ───────────────────
CREATE OR REPLACE FUNCTION update_comments_count() RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE posts SET comments_count = GREATEST(comments_count - 1, 0) WHERE id = OLD.post_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_comments_count ON comments;
CREATE TRIGGER trg_comments_count
AFTER INSERT OR DELETE ON comments
FOR EACH ROW EXECUTE FUNCTION update_comments_count();

-- ─── TRIGGER: auto-create user profile on signup ────────────
CREATE OR REPLACE FUNCTION handle_new_user() RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, name, email)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        NEW.email
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ─── FUNCTION: increment streak ─────────────────────────────
CREATE OR REPLACE FUNCTION increment_streak(uid UUID) RETURNS VOID AS $$
BEGIN
    UPDATE users SET streak_count = streak_count + 1 WHERE id = uid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── ROW LEVEL SECURITY ─────────────────────────────────────
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE route_heatmap ENABLE ROW LEVEL SECURITY;

-- Communities: anyone can read
CREATE POLICY "communities_read" ON communities FOR SELECT USING (true);

-- Users: anyone can read profiles, only own user can update
CREATE POLICY "users_read" ON users FOR SELECT USING (true);
CREATE POLICY "users_update_own" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "users_insert_own" ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- Posts: anyone can read verified posts, only author can insert/update/delete
CREATE POLICY "posts_read" ON posts FOR SELECT USING (ai_verification_status = 'verified' OR auth.uid() = user_id);
CREATE POLICY "posts_insert" ON posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "posts_update_own" ON posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "posts_delete_own" ON posts FOR DELETE USING (auth.uid() = user_id);

-- Likes: anyone can read, authenticated users can insert/delete own
CREATE POLICY "likes_read" ON likes FOR SELECT USING (true);
CREATE POLICY "likes_insert" ON likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "likes_delete_own" ON likes FOR DELETE USING (auth.uid() = user_id);

-- Comments: anyone can read, authenticated users can insert/delete own
CREATE POLICY "comments_read" ON comments FOR SELECT USING (true);
CREATE POLICY "comments_insert" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "comments_delete_own" ON comments FOR DELETE USING (auth.uid() = user_id);

-- Notifications: only own user can read/update
CREATE POLICY "notifications_own" ON notifications FOR ALL USING (auth.uid() = user_id);

-- Saved posts: only own user
CREATE POLICY "saved_posts_own" ON saved_posts FOR ALL USING (auth.uid() = user_id);

-- Heatmap: anyone can read
CREATE POLICY "heatmap_read" ON route_heatmap FOR SELECT USING (true);

-- ─── SEED: Default Community ─────────────────────────────────
INSERT INTO communities (id, name, type)
VALUES ('00000000-0000-0000-0000-000000000001', 'AISSMS EcoSphere', 'college')
ON CONFLICT DO NOTHING;
