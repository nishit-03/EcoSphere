-- ============================================================
-- EcoSphere — Community Feature Tables
-- Run AFTER supabase_setup.sql in Supabase SQL Editor
-- ============================================================

-- ─── Add description to communities ─────────────────────────
DO $$ BEGIN
    ALTER TABLE communities ADD COLUMN IF NOT EXISTS description TEXT;
    ALTER TABLE communities ADD COLUMN IF NOT EXISTS member_count INTEGER DEFAULT 0;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- ─── COMMUNITY MEMBERS ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS community_members (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    community_id    UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at       TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(community_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_cm_community ON community_members(community_id);
CREATE INDEX IF NOT EXISTS idx_cm_user ON community_members(user_id);

-- ─── COMMUNITY TASKS ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS community_tasks (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    community_id    UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
    title           VARCHAR(255) NOT NULL,
    description     TEXT,
    points          INTEGER DEFAULT 10,
    deadline        TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ct_community ON community_tasks(community_id);

-- ─── COMMUNITY TASK COMPLETIONS ────────────────────────────
CREATE TABLE IF NOT EXISTS community_task_completions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id         UUID NOT NULL REFERENCES community_tasks(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    completed_at    TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(task_id, user_id)
);

-- ─── COMMUNITY EVENTS ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS community_events (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    community_id    UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
    title           VARCHAR(255) NOT NULL,
    description     TEXT,
    location        TEXT,
    event_date      TIMESTAMPTZ NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ce_community ON community_events(community_id);

-- ─── COMMUNITY EVENT RSVPS ────────────────────────────────
CREATE TABLE IF NOT EXISTS community_event_rsvps (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id        UUID NOT NULL REFERENCES community_events(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(event_id, user_id)
);

-- ─── COMMUNITY MESSAGES ───────────────────────────────────
CREATE TABLE IF NOT EXISTS community_messages (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    community_id    UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content         TEXT NOT NULL CHECK (char_length(content) > 0),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_cmsg_community ON community_messages(community_id, created_at DESC);

-- ─── TRIGGER: auto-update member_count ─────────────────────
CREATE OR REPLACE FUNCTION update_member_count() RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE communities SET member_count = member_count + 1 WHERE id = NEW.community_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE communities SET member_count = GREATEST(member_count - 1, 0) WHERE id = OLD.community_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_member_count ON community_members;
CREATE TRIGGER trg_member_count
AFTER INSERT OR DELETE ON community_members
FOR EACH ROW EXECUTE FUNCTION update_member_count();

-- ═══════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════

ALTER TABLE community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_task_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_event_rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_messages ENABLE ROW LEVEL SECURITY;

-- Community Members: anyone can read, authenticated can join
CREATE POLICY "cm_read" ON community_members FOR SELECT USING (true);
CREATE POLICY "cm_insert" ON community_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "cm_delete" ON community_members FOR DELETE USING (auth.uid() = user_id);

-- Tasks: anyone can read
CREATE POLICY "ct_read" ON community_tasks FOR SELECT USING (true);

-- Task Completions: anyone can read, own user can insert (no duplicates via UNIQUE)
CREATE POLICY "ctc_read" ON community_task_completions FOR SELECT USING (true);
CREATE POLICY "ctc_insert" ON community_task_completions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Events: anyone can read
CREATE POLICY "ce_read" ON community_events FOR SELECT USING (true);

-- Event RSVPs: anyone can read, own user can insert/delete
CREATE POLICY "cer_read" ON community_event_rsvps FOR SELECT USING (true);
CREATE POLICY "cer_insert" ON community_event_rsvps FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "cer_delete" ON community_event_rsvps FOR DELETE USING (auth.uid() = user_id);

-- Messages: anyone can read, own user can insert
CREATE POLICY "cmsg_read" ON community_messages FOR SELECT USING (true);
CREATE POLICY "cmsg_insert" ON community_messages FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════
-- ENABLE REALTIME on community_messages
-- ═══════════════════════════════════════════════════════════
ALTER PUBLICATION supabase_realtime ADD TABLE community_messages;

-- ─── MISSING RLS: Heatmap insert/update for authenticated users ───
CREATE POLICY "heatmap_insert" ON route_heatmap FOR INSERT WITH CHECK (true);
CREATE POLICY "heatmap_update" ON route_heatmap FOR UPDATE USING (true);

-- ═══════════════════════════════════════════════════════════
-- SEED DATA
-- ═══════════════════════════════════════════════════════════

-- Update existing communities with descriptions
UPDATE communities SET description = 'AISSMS Institute of Information Technology — Eco Warriors community driving campus sustainability.' WHERE id = '00000000-0000-0000-0000-000000000001';
UPDATE communities SET description = 'India''s premier tech institution leading green initiatives across Delhi.' WHERE id = '00000000-0000-0000-0000-000000000002';
UPDATE communities SET description = 'Mumbai cycling enthusiasts reducing carbon footprint one ride at a time.' WHERE id = '00000000-0000-0000-0000-000000000003';
UPDATE communities SET description = 'Pune eco-warriors championing sustainable living across the city.' WHERE id = '00000000-0000-0000-0000-000000000004';

-- Add all seed users as community members
INSERT INTO community_members (community_id, user_id) VALUES
  ('00000000-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000003'),
  ('00000000-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000004'),
  ('00000000-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000006'),
  ('00000000-0000-0000-0000-000000000002', '11111111-0000-0000-0000-000000000007'),
  ('00000000-0000-0000-0000-000000000003', '11111111-0000-0000-0000-000000000002'),
  ('00000000-0000-0000-0000-000000000003', '11111111-0000-0000-0000-000000000008'),
  ('00000000-0000-0000-0000-000000000004', '11111111-0000-0000-0000-000000000005')
ON CONFLICT DO NOTHING;

-- Community Tasks
INSERT INTO community_tasks (id, community_id, title, description, points, deadline) VALUES
  ('aaaa0001-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Plastic-Free Week', 'Avoid all single-use plastics for one full week. Document daily choices.', 50, NOW() + INTERVAL '7 days'),
  ('aaaa0001-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Campus Tree Count', 'Survey and photograph all trees on campus. Submit a photo report.', 30, NOW() + INTERVAL '14 days'),
  ('aaaa0001-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Bike to College Challenge', 'Cycle to college every day this week. Log each trip.', 40, NOW() + INTERVAL '5 days'),
  ('aaaa0001-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'Energy Audit', 'Turn off lights and fans in 3 empty classrooms. Take before/after photos.', 25, NOW() + INTERVAL '3 days'),
  ('aaaa0001-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'Zero Waste Lunch', 'Bring a zero-waste lunch for 5 consecutive days.', 35, NOW() + INTERVAL '10 days')
ON CONFLICT DO NOTHING;

-- Community Events
INSERT INTO community_events (id, community_id, title, description, location, event_date) VALUES
  ('bbbb0001-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Campus Cleanup Drive', 'Join us for a thorough cleanup of the AISSMS campus grounds. Gloves and bags provided!', 'AISSMS Campus Main Ground', NOW() + INTERVAL '3 days'),
  ('bbbb0001-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Tree Planting Saturday', 'Plant 50 saplings around the campus perimeter. Saplings sponsored by Green Club.', 'AISSMS Campus Garden Area', NOW() + INTERVAL '5 days'),
  ('bbbb0001-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Sustainability Workshop', 'Learn about daily sustainability practices from experts. Free entry for all members.', 'AISSMS Seminar Hall B', NOW() + INTERVAL '10 days'),
  ('bbbb0001-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'Green Hackathon', 'Build tech solutions for environmental challenges. 24-hour hackathon with prizes!', 'AISSMS CS Lab 3', NOW() + INTERVAL '14 days')
ON CONFLICT DO NOTHING;

-- Community Messages (seed chat)
INSERT INTO community_messages (community_id, user_id, content, created_at) VALUES
  ('00000000-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000001', 'Hey everyone! Excited about the campus cleanup this weekend 🌿', NOW() - INTERVAL '2 hours'),
  ('00000000-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000003', 'Count me in! I will bring extra gloves', NOW() - INTERVAL '1 hour 45 minutes'),
  ('00000000-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000004', 'Can we also clean the area near the parking lot? It really needs attention', NOW() - INTERVAL '1 hour 30 minutes'),
  ('00000000-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000006', 'Great idea Rahul! Let us add it to the plan', NOW() - INTERVAL '1 hour'),
  ('00000000-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000001', 'Also reminder: bike-to-college challenge starts Monday! 🚲', NOW() - INTERVAL '45 minutes'),
  ('00000000-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000003', 'Already pumped my tires! Let us gooo 💪', NOW() - INTERVAL '30 minutes'),
  ('00000000-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000004', 'Has anyone completed the energy audit task yet?', NOW() - INTERVAL '15 minutes'),
  ('00000000-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000006', 'Not yet but I found 4 empty classrooms with all lights on today 😤', NOW() - INTERVAL '5 minutes')
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════
-- ADDITIONAL FEED POSTS from community members
-- These show up in the main feed alongside existing posts
-- ═══════════════════════════════════════════════════════════

INSERT INTO posts (id, user_id, community_id, action_type, action_label, before_image_url, after_image_url, co2_saved, calories_burned, distance_km, ai_verification_status, ai_confidence_score, ai_caption, caption, likes_count, comments_count, created_at, route_data) VALUES
  -- Sarah Chen — Morning Cycling
  ('feed0001-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001',
   'cycling', 'Morning Campus Ride',
   'https://images.unsplash.com/photo-1571068316344-75bc76f77890?q=80&w=800&auto=format&fit=crop', NULL,
   1.8, 165, 7.5, 'verified', 0.94,
   'Cycling to campus saves 1.8kg CO₂ compared to driving. Keep those wheels spinning! 🚲',
   'Beautiful morning ride through the campus lanes. The air feels so fresh at 7am! 🌅🚲',
   34, 5, NOW() - INTERVAL '30 minutes',
   '{"coordinates": [{"latitude": 18.5195, "longitude": 73.8553}, {"latitude": 18.5200, "longitude": 73.8548}, {"latitude": 18.5210, "longitude": 73.8540}, {"latitude": 18.5220, "longitude": 73.8530}]}'
  ),

  -- Priya Sharma — Tree Planting
  ('feed0001-0000-0000-0000-000000000002', '11111111-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001',
   'planting', 'Planted 5 Saplings 🌳',
   'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=800&auto=format&fit=crop',
   'https://images.unsplash.com/photo-1476231682828-37e571bc172f?q=80&w=800&auto=format&fit=crop',
   5.5, 90, 0, 'verified', 0.97,
   'Five saplings will absorb ~110kg of CO₂ per year once fully grown. Amazing contribution! 🌱',
   'Planted 5 neem saplings near the library today. Cannot wait to see them grow! 🌳💚',
   67, 12, NOW() - INTERVAL '2 hours',
   NULL
  ),

  -- Rahul Deshmukh — Walking to College
  ('feed0001-0000-0000-0000-000000000003', '11111111-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001',
   'walking', 'Walk to College',
   'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?q=80&w=800&auto=format&fit=crop', NULL,
   0.9, 110, 2.3, 'verified', 0.91,
   'Walking 2.3km daily saves 0.9kg CO₂ — that is 328kg per year! Small habits, big impact.',
   'Day 15 of walking to college instead of taking the auto. My legs are getting stronger! 🚶‍♂️💪',
   23, 4, NOW() - INTERVAL '4 hours',
   '{"coordinates": [{"latitude": 18.5130, "longitude": 73.8610}, {"latitude": 18.5150, "longitude": 73.8590}, {"latitude": 18.5170, "longitude": 73.8570}, {"latitude": 18.5195, "longitude": 73.8553}]}'
  ),

  -- Arjun Nair — Campus Cleanup
  ('feed0001-0000-0000-0000-000000000004', '11111111-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001',
   'cleanup', 'Canteen Area Cleanup',
   'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?q=80&w=800&auto=format&fit=crop',
   'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop',
   0.5, 75, 0, 'verified', 0.93,
   'Cleaning up the canteen area removed 3kg of waste. Every piece of litter matters! ♻️',
   'Spent my free period cleaning up around the canteen. Found so many plastic cups! Let us use reusable ones 🙏',
   41, 8, NOW() - INTERVAL '6 hours',
   NULL
  ),

  -- Alex Rivera — Long Cycling Route
  ('feed0001-0000-0000-0000-000000000005', '11111111-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003',
   'cycling', 'Evening City Ride',
   'https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=800&auto=format&fit=crop', NULL,
   3.2, 310, 14.5, 'verified', 0.95,
   'A 14.5km cycle ride saves 3.2kg CO₂. That is equivalent to planting 4 trees for a day! 🌿',
   'Epic evening ride through the city! The sunset views made every pedal worth it 🌇🚴',
   56, 9, NOW() - INTERVAL '8 hours',
   '{"coordinates": [{"latitude": 18.5300, "longitude": 73.8600}, {"latitude": 18.5350, "longitude": 73.8550}, {"latitude": 18.5400, "longitude": 73.8500}, {"latitude": 18.5450, "longitude": 73.8450}, {"latitude": 18.5500, "longitude": 73.8400}]}'
  ),

  -- Meera Patel — Recycling
  ('feed0001-0000-0000-0000-000000000006', '11111111-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000004',
   'recycling', 'Paper Recycling Drive',
   'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?q=80&w=800&auto=format&fit=crop',
   'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?q=80&w=800&auto=format&fit=crop',
   2.1, 50, 0, 'verified', 0.89,
   'Recycling 10kg of paper saves approximately 2.1kg of CO₂ and 17 trees worth of pulp! 📄',
   'Collected and sorted 10kg of paper waste from our office. Feels great to give it a second life! ♻️📦',
   29, 3, NOW() - INTERVAL '1 day',
   NULL
  ),

  -- Neha Gupta — Public Transit
  ('feed0001-0000-0000-0000-000000000007', '11111111-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000002',
   'public_transit', 'Metro Commute',
   'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=800&auto=format&fit=crop', NULL,
   1.5, 30, 8.0, 'verified', 0.88,
   'Taking the metro instead of driving saves 1.5kg CO₂ per trip. Smart commuting! 🚇',
   'Switched to metro for my daily commute. Faster, cheaper, and greener! Win-win-win 🚇✨',
   18, 2, NOW() - INTERVAL '1 day 3 hours',
   NULL
  ),

  -- Vikram Singh — Energy Saving
  ('feed0001-0000-0000-0000-000000000008', '11111111-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000003',
   'energy_saving', 'Office Energy Audit',
   'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?q=80&w=800&auto=format&fit=crop',
   'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?q=80&w=800&auto=format&fit=crop',
   3.8, 0, 0, 'verified', 0.92,
   'Switching off unused equipment saved 3.8kg CO₂ in one day. Imagine doing this every day! 💡',
   'Did an energy audit at work. Turned off 12 monitors and 8 lights that were on for no reason. Small changes matter! 💡🔌',
   45, 6, NOW() - INTERVAL '2 days',
   NULL
  ),

  -- Sarah Chen — Another Cleanup
  ('feed0001-0000-0000-0000-000000000009', '11111111-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001',
   'cleanup', 'Library Garden Cleanup',
   'https://images.unsplash.com/photo-1617953141905-b27fb1f17d88?q=80&w=800&auto=format&fit=crop',
   'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?q=80&w=800&auto=format&fit=crop',
   0.7, 95, 0, 'verified', 0.96,
   'Cleaning public gardens prevents microplastics from entering soil and groundwater. Great work! 🌺',
   'The library garden was covered in chip packets and bottles. 45 minutes later — spotless! Who is joining next time? 🌺🧹',
   52, 7, NOW() - INTERVAL '3 days',
   NULL
  ),

  -- Priya Sharma — Walking
  ('feed0001-0000-0000-0000-000000000010', '11111111-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001',
   'walking', 'Evening Nature Walk',
   'https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=800&auto=format&fit=crop', NULL,
   0.6, 140, 3.1, 'verified', 0.90,
   'An evening walk of 3.1km burns 140 calories and saves 0.6kg CO₂ vs driving. Nature therapy! 🌿',
   'Took the scenic route through the park for my evening walk. The flowers are blooming beautifully! 🌸🚶‍♀️',
   38, 5, NOW() - INTERVAL '3 days 2 hours',
   '{"coordinates": [{"latitude": 18.5160, "longitude": 73.8560}, {"latitude": 18.5175, "longitude": 73.8545}, {"latitude": 18.5190, "longitude": 73.8530}, {"latitude": 18.5205, "longitude": 73.8520}]}'
  )
ON CONFLICT (id) DO NOTHING;

-- Add some likes on the new posts
INSERT INTO likes (post_id, user_id) VALUES
  ('feed0001-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000003'),
  ('feed0001-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000004'),
  ('feed0001-0000-0000-0000-000000000002', '11111111-0000-0000-0000-000000000001'),
  ('feed0001-0000-0000-0000-000000000002', '11111111-0000-0000-0000-000000000006'),
  ('feed0001-0000-0000-0000-000000000003', '11111111-0000-0000-0000-000000000001'),
  ('feed0001-0000-0000-0000-000000000004', '11111111-0000-0000-0000-000000000003'),
  ('feed0001-0000-0000-0000-000000000004', '11111111-0000-0000-0000-000000000001'),
  ('feed0001-0000-0000-0000-000000000005', '11111111-0000-0000-0000-000000000008'),
  ('feed0001-0000-0000-0000-000000000006', '11111111-0000-0000-0000-000000000007')
ON CONFLICT DO NOTHING;

-- Add comments on new posts
INSERT INTO comments (post_id, user_id, content, created_at) VALUES
  ('feed0001-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000003', 'Love the morning ride vibes! 🌅', NOW() - INTERVAL '25 minutes'),
  ('feed0001-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000004', 'Which route did you take? I want to try!', NOW() - INTERVAL '20 minutes'),
  ('feed0001-0000-0000-0000-000000000002', '11111111-0000-0000-0000-000000000001', 'Amazing work Priya! Those neem trees will grow huge 🌳', NOW() - INTERVAL '1 hour 50 minutes'),
  ('feed0001-0000-0000-0000-000000000002', '11111111-0000-0000-0000-000000000006', 'Can I join the next planting session?', NOW() - INTERVAL '1 hour 40 minutes'),
  ('feed0001-0000-0000-0000-000000000003', '11111111-0000-0000-0000-000000000001', '15 days streak! You are an inspiration 💪', NOW() - INTERVAL '3 hours 50 minutes'),
  ('feed0001-0000-0000-0000-000000000004', '11111111-0000-0000-0000-000000000003', 'This is so needed! The canteen area was a mess', NOW() - INTERVAL '5 hours 30 minutes'),
  ('feed0001-0000-0000-0000-000000000005', '11111111-0000-0000-0000-000000000008', 'That sunset shot is incredible! 🌇', NOW() - INTERVAL '7 hours 30 minutes'),
  ('feed0001-0000-0000-0000-000000000009', '11111111-0000-0000-0000-000000000004', 'The garden looks beautiful now! Thanks Sarah', NOW() - INTERVAL '2 days 23 hours')
ON CONFLICT DO NOTHING;

-- ─── Verification ───
SELECT
  (SELECT COUNT(*) FROM community_members) AS members,
  (SELECT COUNT(*) FROM community_tasks) AS tasks,
  (SELECT COUNT(*) FROM community_events) AS events,
  (SELECT COUNT(*) FROM community_messages) AS messages,
  (SELECT COUNT(*) FROM posts WHERE id::TEXT LIKE 'feed0001%') AS new_feed_posts;
