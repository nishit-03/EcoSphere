-- ============================================================
-- EcoSphere — Seed Data
-- Run this in Supabase SQL Editor AFTER running supabase_setup.sql
-- ============================================================

-- ─── COMMUNITIES ────────────────────────────────────────────
INSERT INTO communities (id, name, type, total_impact) VALUES
  ('00000000-0000-0000-0000-000000000001', 'AISSMS IOIT', 'college', 2400.0),
  ('00000000-0000-0000-0000-000000000002', 'IIT Delhi Green Club', 'college', 5100.0),
  ('00000000-0000-0000-0000-000000000003', 'Mumbai Cyclists', 'city', 8700.0),
  ('00000000-0000-0000-0000-000000000004', 'Pune EcoWarriors', 'city', 3200.0)
ON CONFLICT DO NOTHING;

-- ─── USERS ──────────────────────────────────────────────────
-- Drop the FK to auth.users so we can insert dummy seed users.
-- Real users created via signup are still linked via the trigger.
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_id_fkey;

INSERT INTO public.users (id, name, email, profile_image_url, community_id, trust_score, total_points, streak_count) VALUES
  ('11111111-0000-0000-0000-000000000001', 'Sarah Chen',     'sarah@example.com',  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop', '00000000-0000-0000-0000-000000000001', 96.0, 1820, 15),
  ('11111111-0000-0000-0000-000000000002', 'Alex Rivera',    'alex@example.com',   'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop', '00000000-0000-0000-0000-000000000003', 91.0, 1340, 10),
  ('11111111-0000-0000-0000-000000000003', 'Priya Sharma',   'priya@example.com',  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop', '00000000-0000-0000-0000-000000000001', 98.0, 2100, 21),
  ('11111111-0000-0000-0000-000000000004', 'Rahul Deshmukh', 'rahul@example.com',  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop', '00000000-0000-0000-0000-000000000001', 87.0,  980,  7),
  ('11111111-0000-0000-0000-000000000005', 'Meera Patel',    'meera@example.com',  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop', '00000000-0000-0000-0000-000000000004', 93.0, 1560, 18),
  ('11111111-0000-0000-0000-000000000006', 'Arjun Nair',     'arjun@example.com',  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop', '00000000-0000-0000-0000-000000000001', 85.0,  760,  5),
  ('11111111-0000-0000-0000-000000000007', 'Neha Gupta',     'neha@example.com',   'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop', '00000000-0000-0000-0000-000000000002', 90.0, 1200, 12),
  ('11111111-0000-0000-0000-000000000008', 'Vikram Singh',   'vikram@example.com', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop', '00000000-0000-0000-0000-000000000003', 88.0, 1050,  9)
ON CONFLICT (id) DO NOTHING;


-- ─── POSTS ──────────────────────────────────────────────────
INSERT INTO posts (
  id, user_id, community_id, action_type, action_label,
  before_image_url, after_image_url,
  co2_saved, calories_burned, distance_km,
  ai_verification_status, ai_confidence_score, ai_caption, caption,
  likes_count, comments_count, share_count,
  route_data, created_at
) VALUES

-- Post 1: Beach Cleanup by Sarah
(
  'aaaaaaaa-0000-0000-0000-000000000001',
  '11111111-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'cleanup', 'Beach Cleanup',
  'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?q=80&w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1000&auto=format&fit=crop',
  1.2, 180, NULL,
  'verified', 0.96,
  'Removing 5kg of plastic prevents ~12,000 microplastics from entering the ocean. Incredible impact! 🌊',
  'Found this mess during my morning run. 30 minutes later, the beach is breathing again! 🌊✨ #EcoSphere',
  124, 7, 14,
  '{"coordinates": [{"latitude": 18.5195, "longitude": 73.8553}]}',
  NOW() - INTERVAL '2 hours'
),

-- Post 2: Bike Commute by Alex
(
  'aaaaaaaa-0000-0000-0000-000000000002',
  '11111111-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000003',
  'cycling', 'Bike Commute',
  'https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=1000&auto=format&fit=crop',
  NULL,
  2.4, 240, 10.2,
  'verified', 0.92,
  'Cycling 10km saves CO₂ equivalent to charging 400 smartphones. Every pedal counts! 🚲',
  'Ditched the car for the bike today. The morning breeze is unbeatable! 🚲💨',
  89, 6, 8,
  '{"coordinates": [{"latitude": 18.5204, "longitude": 73.8567}, {"latitude": 18.5240, "longitude": 73.8510}, {"latitude": 18.5280, "longitude": 73.8460}, {"latitude": 18.5330, "longitude": 73.8410}, {"latitude": 18.5372, "longitude": 73.8388}]}',
  NOW() - INTERVAL '5 hours'
),

-- Post 3: Tree Planting by Priya
(
  'aaaaaaaa-0000-0000-0000-000000000003',
  '11111111-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000001',
  'planting', 'Campus Tree Planting',
  'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1476231682828-37e571bc172f?q=80&w=1000&auto=format&fit=crop',
  4.8, 120, NULL,
  'verified', 0.98,
  'One tree absorbs ~22kg of CO₂ yearly. Planting 3 saplings = removing a car from the road for a day! 🌱',
  'Planted 3 saplings on campus today with the green club! Small steps, big roots 🌱🌳',
  203, 8, 22,
  '{"coordinates": [{"latitude": 18.5162, "longitude": 73.8560}]}',
  NOW() - INTERVAL '8 hours'
),

-- Post 4: Walking by Rahul
(
  'aaaaaaaa-0000-0000-0000-000000000004',
  '11111111-0000-0000-0000-000000000004',
  '00000000-0000-0000-0000-000000000001',
  'walking', 'Walk to College',
  'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?q=80&w=1000&auto=format&fit=crop',
  NULL,
  0.8, 95, 2.1,
  'verified', 0.89,
  'Walking 2km daily for a year saves over 580kg of CO₂. A simple habit with massive impact!',
  'Skipped the rickshaw, walked the scenic route instead. Fresh air is free therapy! 🚶‍♂️🌤',
  45, 5, 3,
  '{"coordinates": [{"latitude": 18.5130, "longitude": 73.8610}, {"latitude": 18.5160, "longitude": 73.8580}, {"latitude": 18.5190, "longitude": 73.8550}, {"latitude": 18.5213, "longitude": 73.8535}]}',
  NOW() - INTERVAL '1 day'
),

-- Post 5: Recycling by Meera
(
  'aaaaaaaa-0000-0000-0000-000000000005',
  '11111111-0000-0000-0000-000000000005',
  '00000000-0000-0000-0000-000000000004',
  'recycling', 'Neighbourhood Recycling Drive',
  'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?q=80&w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1604187351574-c75ca79f5807?q=80&w=1000&auto=format&fit=crop',
  2.1, 60, NULL,
  'verified', 0.94,
  'Recycling 10kg of paper saves 17 trees and 26,000 litres of water. Amazing community effort! ♻️',
  'Organized a recycling drive in our colony today. 15 families participated! ♻️💚',
  167, 11, 19,
  '{"coordinates": [{"latitude": 18.5100, "longitude": 73.8500}]}',
  NOW() - INTERVAL '1 day 4 hours'
),

-- Post 6: Long Cycling by Alex
(
  'aaaaaaaa-0000-0000-0000-000000000006',
  '11111111-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000003',
  'cycling', 'Weekend Long Ride',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=1000&auto=format&fit=crop',
  NULL,
  3.8, 380, 16.5,
  'verified', 0.95,
  'A 16km weekend ride offsets the CO₂ of 3 short car trips. Keep rolling! 🚴',
  'Saturday morning 16km loop around the city. Nothing beats this feeling 🚴‍♂️🌅',
  78, 4, 6,
  '{"coordinates": [{"latitude": 18.5204, "longitude": 73.8567}, {"latitude": 18.5260, "longitude": 73.8490}, {"latitude": 18.5340, "longitude": 73.8410}, {"latitude": 18.5420, "longitude": 73.8310}, {"latitude": 18.5450, "longitude": 73.8260}]}',
  NOW() - INTERVAL '2 days'
),

-- Post 7: Energy Saving by Neha
(
  'aaaaaaaa-0000-0000-0000-000000000007',
  '11111111-0000-0000-0000-000000000007',
  '00000000-0000-0000-0000-000000000002',
  'energy_saving', 'Solar Panel Installation',
  'https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1497440001374-f26997328c1b?q=80&w=1000&auto=format&fit=crop',
  5.5, 0, NULL,
  'verified', 0.97,
  'A 1kW solar panel saves ~1.5 tons of CO₂ per year. This is a game-changer for the planet! ☀️',
  'Finally installed solar panels on our rooftop! First step to energy independence ☀️🏠',
  312, 15, 34,
  '{"coordinates": [{"latitude": 28.6139, "longitude": 77.2090}]}',
  NOW() - INTERVAL '3 days'
),

-- Post 8: Public Transit by Vikram
(
  'aaaaaaaa-0000-0000-0000-000000000008',
  '11111111-0000-0000-0000-000000000008',
  '00000000-0000-0000-0000-000000000003',
  'public_transit', 'Metro Commute',
  'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=1000&auto=format&fit=crop',
  NULL,
  1.8, 0, 22.0,
  'verified', 0.91,
  'Taking the metro instead of a car for 22km saves 4.2kg CO₂ per trip. Public transit is a superpower! 🚇',
  'Switched to metro for my daily commute. Faster, cheaper, and greener! 🚇🌿',
  56, 3, 5,
  '{"coordinates": [{"latitude": 19.0760, "longitude": 72.8777}, {"latitude": 19.0900, "longitude": 72.8600}]}',
  NOW() - INTERVAL '3 days 6 hours'
),

-- Post 9: Park Cleanup by Arjun
(
  'aaaaaaaa-0000-0000-0000-000000000009',
  '11111111-0000-0000-0000-000000000006',
  '00000000-0000-0000-0000-000000000001',
  'cleanup', 'Campus Park Cleanup',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=1000&auto=format&fit=crop',
  0.9, 140, NULL,
  'verified', 0.93,
  'Clean green spaces improve air quality and mental health for thousands. Community heroes! 🌳',
  'Spent Sunday morning cleaning up the campus park. It looks amazing now! 🌳✨',
  88, 6, 7,
  '{"coordinates": [{"latitude": 18.5190, "longitude": 73.8560}, {"latitude": 18.5200, "longitude": 73.8548}, {"latitude": 18.5210, "longitude": 73.8555}, {"latitude": 18.5190, "longitude": 73.8560}]}',
  NOW() - INTERVAL '4 days'
),

-- Post 10: Morning Walk by Meera
(
  'aaaaaaaa-0000-0000-0000-000000000010',
  '11111111-0000-0000-0000-000000000005',
  '00000000-0000-0000-0000-000000000004',
  'walking', 'Morning Nature Walk',
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=1000&auto=format&fit=crop',
  NULL,
  0.5, 110, 2.8,
  'verified', 0.88,
  'A 2.8km walk saves 0.5kg CO₂ and burns 110 calories. Double win for you and the planet! 🌿',
  'Early morning walk through the nature trail. Starting the day right 🌅🌿',
  34, 2, 2,
  '{"coordinates": [{"latitude": 18.5150, "longitude": 73.8520}, {"latitude": 18.5170, "longitude": 73.8500}, {"latitude": 18.5190, "longitude": 73.8480}]}',
  NOW() - INTERVAL '5 days'
),

-- Post 11: Tree Planting by Neha
(
  'aaaaaaaa-0000-0000-0000-000000000011',
  '11111111-0000-0000-0000-000000000007',
  '00000000-0000-0000-0000-000000000002',
  'planting', 'Rooftop Garden',
  'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?q=80&w=1000&auto=format&fit=crop',
  2.2, 90, NULL,
  'verified', 0.95,
  'A rooftop garden of 10 plants absorbs ~2kg CO₂ monthly and reduces urban heat by 3°C! 🌱',
  'Built a rooftop herb garden this weekend! Growing our own food = less carbon footprint 🌱🍅',
  145, 9, 16,
  '{"coordinates": [{"latitude": 28.6200, "longitude": 77.2100}]}',
  NOW() - INTERVAL '6 days'
),

-- Post 12: Cycling by Rahul
(
  'aaaaaaaa-0000-0000-0000-000000000012',
  '11111111-0000-0000-0000-000000000004',
  '00000000-0000-0000-0000-000000000001',
  'cycling', 'Evening Cycling',
  'https://images.unsplash.com/photo-1571068316344-75bc76f77890?q=80&w=1000&auto=format&fit=crop',
  NULL,
  1.0, 110, 4.5,
  'verified', 0.90,
  'Evening cycling is 40% more efficient for CO₂ reduction than morning rides due to traffic patterns. 🌙',
  'Evening ride along Shivaji Nagar. The city looks beautiful at dusk 🌆🚲',
  52, 3, 4,
  '{"coordinates": [{"latitude": 18.5204, "longitude": 73.8567}, {"latitude": 18.5222, "longitude": 73.8600}, {"latitude": 18.5240, "longitude": 73.8633}, {"latitude": 18.5258, "longitude": 73.8666}, {"latitude": 18.5270, "longitude": 73.8688}]}',
  NOW() - INTERVAL '7 days'
)

ON CONFLICT (id) DO NOTHING;

-- ─── COMMENTS ───────────────────────────────────────────────
INSERT INTO comments (id, post_id, user_id, content, created_at) VALUES
  -- Comments on Post 1 (Beach Cleanup)
  ('cccccccc-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000002', 'Amazing work Sarah! The beach looks incredible now 🏖️', NOW() - INTERVAL '1 hour 50 min'),
  ('cccccccc-0000-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000003', 'This inspires me to organize one on our campus!', NOW() - INTERVAL '1 hour 40 min'),
  ('cccccccc-0000-0000-0000-000000000003', 'aaaaaaaa-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000004', 'How many bags did you fill? We usually get 3-4 in our area.', NOW() - INTERVAL '1 hour'),
  ('cccccccc-0000-0000-0000-000000000004', 'aaaaaaaa-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000005', 'Small actions really add up 👏', NOW() - INTERVAL '30 min'),
  ('cccccccc-0000-0000-0000-000000000005', 'aaaaaaaa-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000006', 'That cleanup made a huge difference! Sharing this with my friends', NOW() - INTERVAL '20 min'),
  ('cccccccc-0000-0000-0000-000000000006', 'aaaaaaaa-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000007', 'Proud of this community 🔥', NOW() - INTERVAL '10 min'),
  ('cccccccc-0000-0000-0000-000000000007', 'aaaaaaaa-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000008', 'Was this at Juhu beach? I want to join next weekend!', NOW() - INTERVAL '5 min'),

  -- Comments on Post 2 (Bike Commute)
  ('cccccccc-0000-0000-0000-000000000010', 'aaaaaaaa-0000-0000-0000-000000000002', '11111111-0000-0000-0000-000000000001', 'Keep it up Alex! Cycling is the best 🚲', NOW() - INTERVAL '4 hours 50 min'),
  ('cccccccc-0000-0000-0000-000000000011', 'aaaaaaaa-0000-0000-0000-000000000002', '11111111-0000-0000-0000-000000000003', 'Love seeing more people choose cycling! 🌍', NOW() - INTERVAL '4 hours'),
  ('cccccccc-0000-0000-0000-000000000012', 'aaaaaaaa-0000-0000-0000-000000000002', '11111111-0000-0000-0000-000000000005', 'How long was this route? Thinking of trying it!', NOW() - INTERVAL '3 hours'),
  ('cccccccc-0000-0000-0000-000000000013', 'aaaaaaaa-0000-0000-0000-000000000002', '11111111-0000-0000-0000-000000000004', '10km is solid! My legs give up at 5 😂', NOW() - INTERVAL '2 hours'),
  ('cccccccc-0000-0000-0000-000000000014', 'aaaaaaaa-0000-0000-0000-000000000002', '11111111-0000-0000-0000-000000000007', 'The morning rides are unbeatable in Mumbai', NOW() - INTERVAL '1 hour'),
  ('cccccccc-0000-0000-0000-000000000015', 'aaaaaaaa-0000-0000-0000-000000000002', '11111111-0000-0000-0000-000000000006', 'We should start a cycling group! Who''s in? 🙋‍♂️', NOW() - INTERVAL '30 min'),

  -- Comments on Post 3 (Tree Planting)
  ('cccccccc-0000-0000-0000-000000000020', 'aaaaaaaa-0000-0000-0000-000000000003', '11111111-0000-0000-0000-000000000002', 'Which species did you plant? Would love to join next time!', NOW() - INTERVAL '7 hours 50 min'),
  ('cccccccc-0000-0000-0000-000000000021', 'aaaaaaaa-0000-0000-0000-000000000003', '11111111-0000-0000-0000-000000000001', 'Beautiful! 🌳 Every tree counts.', NOW() - INTERVAL '7 hours'),
  ('cccccccc-0000-0000-0000-000000000022', 'aaaaaaaa-0000-0000-0000-000000000003', '11111111-0000-0000-0000-000000000008', 'Our campus needs more green. This is so inspiring 🌱', NOW() - INTERVAL '6 hours'),
  ('cccccccc-0000-0000-0000-000000000023', 'aaaaaaaa-0000-0000-0000-000000000003', '11111111-0000-0000-0000-000000000006', 'I planted neem and gulmohar last month. They''re growing well!', NOW() - INTERVAL '5 hours'),
  ('cccccccc-0000-0000-0000-000000000024', 'aaaaaaaa-0000-0000-0000-000000000003', '11111111-0000-0000-0000-000000000005', 'The before-after difference is insane 😍', NOW() - INTERVAL '4 hours'),
  ('cccccccc-0000-0000-0000-000000000025', 'aaaaaaaa-0000-0000-0000-000000000003', '11111111-0000-0000-0000-000000000004', 'Green club supremacy! 💚', NOW() - INTERVAL '3 hours'),
  ('cccccccc-0000-0000-0000-000000000026', 'aaaaaaaa-0000-0000-0000-000000000003', '11111111-0000-0000-0000-000000000007', 'Can we organize this in the hostel area too?', NOW() - INTERVAL '2 hours'),
  ('cccccccc-0000-0000-0000-000000000027', 'aaaaaaaa-0000-0000-0000-000000000003', '11111111-0000-0000-0000-000000000002', 'Already shared this with my environmental science class!', NOW() - INTERVAL '1 hour'),

  -- Comments on Post 5 (Recycling)
  ('cccccccc-0000-0000-0000-000000000030', 'aaaaaaaa-0000-0000-0000-000000000005', '11111111-0000-0000-0000-000000000001', 'This is what community action looks like! 💪', NOW() - INTERVAL '23 hours'),
  ('cccccccc-0000-0000-0000-000000000031', 'aaaaaaaa-0000-0000-0000-000000000005', '11111111-0000-0000-0000-000000000003', 'We need more drives like this in Pune!', NOW() - INTERVAL '22 hours'),
  ('cccccccc-0000-0000-0000-000000000032', 'aaaaaaaa-0000-0000-0000-000000000005', '11111111-0000-0000-0000-000000000006', 'How do I join the next one?', NOW() - INTERVAL '20 hours'),

  -- Comments on Post 7 (Solar)
  ('cccccccc-0000-0000-0000-000000000040', 'aaaaaaaa-0000-0000-0000-000000000007', '11111111-0000-0000-0000-000000000001', 'This is the future! 🌞 How much did it cost?', NOW() - INTERVAL '2 days 20 hours'),
  ('cccccccc-0000-0000-0000-000000000041', 'aaaaaaaa-0000-0000-0000-000000000007', '11111111-0000-0000-0000-000000000002', 'Incredible investment. Pays back in 5 years and saves the planet!', NOW() - INTERVAL '2 days 18 hours'),
  ('cccccccc-0000-0000-0000-000000000042', 'aaaaaaaa-0000-0000-0000-000000000007', '11111111-0000-0000-0000-000000000004', 'My family is planning this too. Which brand did you go with?', NOW() - INTERVAL '2 days 15 hours')

ON CONFLICT (id) DO NOTHING;

-- ─── LIKES ──────────────────────────────────────────────────
INSERT INTO likes (post_id, user_id) VALUES
  -- Likes on Post 1
  ('aaaaaaaa-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000002'),
  ('aaaaaaaa-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000003'),
  ('aaaaaaaa-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000004'),
  ('aaaaaaaa-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000005'),
  ('aaaaaaaa-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000006'),
  -- Likes on Post 2
  ('aaaaaaaa-0000-0000-0000-000000000002', '11111111-0000-0000-0000-000000000001'),
  ('aaaaaaaa-0000-0000-0000-000000000002', '11111111-0000-0000-0000-000000000003'),
  ('aaaaaaaa-0000-0000-0000-000000000002', '11111111-0000-0000-0000-000000000005'),
  -- Likes on Post 3
  ('aaaaaaaa-0000-0000-0000-000000000003', '11111111-0000-0000-0000-000000000001'),
  ('aaaaaaaa-0000-0000-0000-000000000003', '11111111-0000-0000-0000-000000000002'),
  ('aaaaaaaa-0000-0000-0000-000000000003', '11111111-0000-0000-0000-000000000004'),
  ('aaaaaaaa-0000-0000-0000-000000000003', '11111111-0000-0000-0000-000000000006'),
  ('aaaaaaaa-0000-0000-0000-000000000003', '11111111-0000-0000-0000-000000000008'),
  -- Likes on Post 5
  ('aaaaaaaa-0000-0000-0000-000000000005', '11111111-0000-0000-0000-000000000001'),
  ('aaaaaaaa-0000-0000-0000-000000000005', '11111111-0000-0000-0000-000000000002'),
  ('aaaaaaaa-0000-0000-0000-000000000005', '11111111-0000-0000-0000-000000000003'),
  -- Likes on Post 7
  ('aaaaaaaa-0000-0000-0000-000000000007', '11111111-0000-0000-0000-000000000001'),
  ('aaaaaaaa-0000-0000-0000-000000000007', '11111111-0000-0000-0000-000000000002'),
  ('aaaaaaaa-0000-0000-0000-000000000007', '11111111-0000-0000-0000-000000000004'),
  ('aaaaaaaa-0000-0000-0000-000000000007', '11111111-0000-0000-0000-000000000005'),
  ('aaaaaaaa-0000-0000-0000-000000000007', '11111111-0000-0000-0000-000000000006'),
  ('aaaaaaaa-0000-0000-0000-000000000007', '11111111-0000-0000-0000-000000000008')
ON CONFLICT DO NOTHING;

-- ─── ROUTE HEATMAP ──────────────────────────────────────────
INSERT INTO route_heatmap (lat, lng, activity_type, intensity_score) VALUES
  (18.5204, 73.8567, 'cycling',  0.95),
  (18.5210, 73.8555, 'cycling',  0.90),
  (18.5218, 73.8540, 'cycling',  0.88),
  (18.5225, 73.8528, 'cycling',  0.85),
  (18.5235, 73.8515, 'cycling',  0.82),
  (18.5248, 73.8500, 'cycling',  0.75),
  (18.5260, 73.8485, 'cycling',  0.72),
  (18.5275, 73.8470, 'cycling',  0.68),
  (18.5290, 73.8455, 'cycling',  0.65),
  (18.5305, 73.8440, 'cycling',  0.60),
  (18.5320, 73.8425, 'cycling',  0.55),
  (18.5340, 73.8410, 'cycling',  0.50),
  (18.5358, 73.8395, 'cycling',  0.45),
  (18.5372, 73.8388, 'cycling',  0.40),
  (18.5130, 73.8610, 'walking',  0.55),
  (18.5155, 73.8585, 'walking',  0.62),
  (18.5180, 73.8560, 'walking',  0.68),
  (18.5192, 73.8550, 'walking',  0.72),
  (18.5186, 73.8530, 'walking',  0.40),
  (18.5168, 73.8494, 'walking',  0.35),
  (18.5148, 73.8458, 'walking',  0.30),
  (18.5222, 73.8600, 'cycling',  0.38),
  (18.5240, 73.8633, 'cycling',  0.32),
  (18.5258, 73.8666, 'cycling',  0.28),
  (18.5200, 73.8548, 'cleanup',  0.50),
  (18.5162, 73.8560, 'planting', 0.60)
ON CONFLICT DO NOTHING;

-- ─── VERIFY ─────────────────────────────────────────────────
SELECT
  (SELECT COUNT(*) FROM communities) AS communities,
  (SELECT COUNT(*) FROM users)       AS users,
  (SELECT COUNT(*) FROM posts)       AS posts,
  (SELECT COUNT(*) FROM comments)    AS comments,
  (SELECT COUNT(*) FROM likes)       AS likes,
  (SELECT COUNT(*) FROM route_heatmap) AS heatmap_points;
