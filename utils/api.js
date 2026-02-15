// ─── Mock API Layer ───
// Simulates backend calls with delays. Replace with real fetch() when backend is ready.

import { FEED_POSTS, CURRENT_USER, TRENDING } from './mockData';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Simulate network latency (300-800ms)
const networkDelay = () => delay(300 + Math.random() * 500);

// ─── Mock Comments DB ───
const A = {
    alex: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop',
    sarah: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop',
    priya: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
    rahul: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
    meera: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
    arjun: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop',
    neha: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop',
    vikram: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop',
};
const MOCK_COMMENTS = {
    p1: [
        { id: 'cm1', userId: 'u3', userName: 'Alex Rivera', userAvatar: A.alex, content: 'Amazing work Sarah! The beach looks incredible now 🏖️', likes: 12, createdAt: new Date(Date.now() - 120000).toISOString(), aiModerationFlag: false },
        { id: 'cm2', userId: 'u6', userName: 'Priya Sharma', userAvatar: A.priya, content: 'This inspires me to organize one on our campus!', likes: 8, createdAt: new Date(Date.now() - 900000).toISOString(), aiModerationFlag: false },
        { id: 'cm3', userId: 'u7', userName: 'Rahul Deshmukh', userAvatar: A.rahul, content: 'How many bags did you fill? We usually get 3-4 in our area.', likes: 3, createdAt: new Date(Date.now() - 3600000).toISOString(), aiModerationFlag: false },
        { id: 'cm4', userId: 'u10', userName: 'Meera Patel', userAvatar: A.meera, content: 'Small actions really add up 👏', likes: 15, createdAt: new Date(Date.now() - 5400000).toISOString(), aiModerationFlag: false },
        { id: 'cm5', userId: 'u11', userName: 'Arjun Nair', userAvatar: A.arjun, content: 'That cleanup made a huge difference! Sharing this with my friends', likes: 6, createdAt: new Date(Date.now() - 7200000).toISOString(), aiModerationFlag: false },
        { id: 'cm6', userId: 'u12', userName: 'Neha Gupta', userAvatar: A.neha, content: 'Proud of this community 🔥', likes: 21, createdAt: new Date(Date.now() - 14400000).toISOString(), aiModerationFlag: false },
        { id: 'cm7', userId: 'u13', userName: 'Vikram Singh', userAvatar: A.vikram, content: 'Was this at Juhu beach? I want to join next weekend!', likes: 4, createdAt: new Date(Date.now() - 86400000).toISOString(), aiModerationFlag: false },
    ],
    p2: [
        { id: 'cm10', userId: 'u2', userName: 'Sarah Chen', userAvatar: A.sarah, content: 'Keep it up Alex! Cycling is the best 🚲', likes: 9, createdAt: new Date(Date.now() - 120000).toISOString(), aiModerationFlag: false },
        { id: 'cm11', userId: 'u6', userName: 'Priya Sharma', userAvatar: A.priya, content: 'Love seeing more people choose cycling! 🌍', likes: 14, createdAt: new Date(Date.now() - 600000).toISOString(), aiModerationFlag: false },
        { id: 'cm12', userId: 'u10', userName: 'Meera Patel', userAvatar: A.meera, content: 'How long was this route? Thinking of trying it!', likes: 2, createdAt: new Date(Date.now() - 3600000).toISOString(), aiModerationFlag: false },
        { id: 'cm13', userId: 'u7', userName: 'Rahul Deshmukh', userAvatar: A.rahul, content: '10km is solid! My legs give up at 5 😂', likes: 18, createdAt: new Date(Date.now() - 7200000).toISOString(), aiModerationFlag: false },
        { id: 'cm14', userId: 'u12', userName: 'Neha Gupta', userAvatar: A.neha, content: 'The morning rides are unbeatable in Mumbai', likes: 7, createdAt: new Date(Date.now() - 28800000).toISOString(), aiModerationFlag: false },
        { id: 'cm15', userId: 'u11', userName: 'Arjun Nair', userAvatar: A.arjun, content: "We should start a cycling group! Who's in? 🙋‍♂️", likes: 23, createdAt: new Date(Date.now() - 43200000).toISOString(), aiModerationFlag: false },
    ],
    p3: [
        { id: 'cm20', userId: 'u3', userName: 'Alex Rivera', userAvatar: A.alex, content: 'Which species did you plant? Would love to join next time!', likes: 5, createdAt: new Date(Date.now() - 300000).toISOString(), aiModerationFlag: false },
        { id: 'cm21', userId: 'u2', userName: 'Sarah Chen', userAvatar: A.sarah, content: 'Beautiful! 🌳 Every tree counts.', likes: 11, createdAt: new Date(Date.now() - 1800000).toISOString(), aiModerationFlag: false },
        { id: 'cm22', userId: 'u13', userName: 'Vikram Singh', userAvatar: A.vikram, content: 'Our campus needs more green. This is so inspiring 🌱', likes: 16, createdAt: new Date(Date.now() - 5400000).toISOString(), aiModerationFlag: false },
        { id: 'cm23', userId: 'u11', userName: 'Arjun Nair', userAvatar: A.arjun, content: "I planted neem and gulmohar last month. They're growing well!", likes: 8, createdAt: new Date(Date.now() - 10800000).toISOString(), aiModerationFlag: false },
        { id: 'cm24', userId: 'u10', userName: 'Meera Patel', userAvatar: A.meera, content: 'The before-after difference is insane 😍', likes: 19, createdAt: new Date(Date.now() - 21600000).toISOString(), aiModerationFlag: false },
        { id: 'cm25', userId: 'u7', userName: 'Rahul Deshmukh', userAvatar: A.rahul, content: 'Green club supremacy! 💚', likes: 13, createdAt: new Date(Date.now() - 43200000).toISOString(), aiModerationFlag: false },
        { id: 'cm26', userId: 'u12', userName: 'Neha Gupta', userAvatar: A.neha, content: 'Can we organize this in the hostel area too?', likes: 4, createdAt: new Date(Date.now() - 64800000).toISOString(), aiModerationFlag: false },
        { id: 'cm27', userId: 'u6', userName: 'Priya Sharma', userAvatar: A.priya, content: 'Already shared this with my environmental science class!', likes: 10, createdAt: new Date(Date.now() - 86400000).toISOString(), aiModerationFlag: false },
    ],
    p4: [
        { id: 'cm30', userId: 'u2', userName: 'Sarah Chen', userAvatar: A.sarah, content: 'Walking is underrated! Great for mental health too 🧘', likes: 7, createdAt: new Date(Date.now() - 900000).toISOString(), aiModerationFlag: false },
        { id: 'cm31', userId: 'u10', userName: 'Meera Patel', userAvatar: A.meera, content: 'The scenic route through campus is my favourite 🌿', likes: 5, createdAt: new Date(Date.now() - 3600000).toISOString(), aiModerationFlag: false },
        { id: 'cm32', userId: 'u3', userName: 'Alex Rivera', userAvatar: A.alex, content: 'Started walking last week. Already feel the difference!', likes: 11, createdAt: new Date(Date.now() - 7200000).toISOString(), aiModerationFlag: false },
        { id: 'cm33', userId: 'u12', userName: 'Neha Gupta', userAvatar: A.neha, content: 'Ditching the rickshaw saves money AND the planet 🙌', likes: 17, createdAt: new Date(Date.now() - 14400000).toISOString(), aiModerationFlag: false },
        { id: 'cm34', userId: 'u13', userName: 'Vikram Singh', userAvatar: A.vikram, content: "Fresh air is free therapy — couldn't agree more!", likes: 9, createdAt: new Date(Date.now() - 28800000).toISOString(), aiModerationFlag: false },
    ],
};

let commentCounter = 100;

// ─── Mock Notifications DB ───
const MOCK_NOTIFICATIONS = [
    { id: 'n1', type: 'like', message: 'Sarah Chen liked your post', referenceId: 'p1', isRead: false, createdAt: new Date(Date.now() - 600000).toISOString() },
    { id: 'n2', type: 'comment', message: 'Alex Rivera commented on your post', referenceId: 'p2', isRead: false, createdAt: new Date(Date.now() - 1800000).toISOString() },
    { id: 'n3', type: 'badge', message: '🏆 You earned "Tree Hugger" badge!', referenceId: null, isRead: false, createdAt: new Date(Date.now() - 3600000).toISOString() },
    { id: 'n4', type: 'challenge', message: 'Campus Cleanup Sprint starts tomorrow!', referenceId: null, isRead: true, createdAt: new Date(Date.now() - 86400000).toISOString() },
    { id: 'n5', type: 'verification', message: '✅ Your Beach Cleanup action was AI verified!', referenceId: 'p1', isRead: true, createdAt: new Date(Date.now() - 172800000).toISOString() },
];

// ─── Toxicity Filter (Simple) ───
const BLOCKED_WORDS = ['spam', 'scam', 'fake', 'hate', 'stupid'];
function checkToxicity(text) {
    const lower = text.toLowerCase();
    return BLOCKED_WORDS.some(w => lower.includes(w));
}

// ─── API Functions ───

export async function fetchFeed({ page = 1, limit = 10 } = {}) {
    await networkDelay();
    const start = (page - 1) * limit;
    const data = FEED_POSTS.slice(start, start + limit);
    return {
        data,
        pagination: { page, limit, total: FEED_POSTS.length, hasMore: start + limit < FEED_POSTS.length },
    };
}

export async function toggleLike(postId, userId = CURRENT_USER.id) {
    await delay(200); // Fast for optimistic UI
    return { success: true };
}

export async function fetchComments(postId, { page = 1, limit = 10 } = {}) {
    await networkDelay();
    const all = MOCK_COMMENTS[postId] || [];
    const start = (page - 1) * limit;
    return {
        data: all.slice(start, start + limit),
        pagination: { page, limit, total: all.length, hasMore: start + limit < all.length },
    };
}

export async function postComment(postId, content) {
    await networkDelay();
    const isToxic = checkToxicity(content);
    if (isToxic) {
        return { success: false, error: 'Your comment may contain inappropriate content. Please revise.', flagged: true };
    }
    commentCounter++;
    const newComment = {
        id: `cm_new_${commentCounter}`,
        userId: CURRENT_USER.id,
        userName: CURRENT_USER.name,
        userAvatar: null,
        content,
        createdAt: new Date().toISOString(),
        aiModerationFlag: false,
    };
    if (!MOCK_COMMENTS[postId]) MOCK_COMMENTS[postId] = [];
    MOCK_COMMENTS[postId].unshift(newComment);
    return { success: true, comment: newComment };
}

export async function deleteComment(postId, commentId) {
    await delay(300);
    if (MOCK_COMMENTS[postId]) {
        MOCK_COMMENTS[postId] = MOCK_COMMENTS[postId].filter(c => c.id !== commentId);
    }
    return { success: true };
}

export async function fetchNotifications() {
    await networkDelay();
    return { data: [...MOCK_NOTIFICATIONS] };
}

export async function markNotificationRead(notifId) {
    await delay(100);
    const n = MOCK_NOTIFICATIONS.find(x => x.id === notifId);
    if (n) n.isRead = true;
    return { success: true };
}

export async function markAllNotificationsRead() {
    await delay(200);
    MOCK_NOTIFICATIONS.forEach(n => { n.isRead = true; });
    return { success: true };
}

export function generateShareMessage(post) {
    const stats = [];
    if (post.co2Saved > 0) stats.push(`${post.co2Saved}kg CO₂ saved`);
    if (post.distanceKm) stats.push(`${post.distanceKm}km`);
    if (post.caloriesBurned > 0) stats.push(`${post.caloriesBurned} cal`);
    return `🌱 I just completed "${post.actionLabel}" on EcoSphere!\n${stats.join(' • ')}\n\nJoin me in making a difference! 🌍\nhttps://ecosphere.app/post/${post.id}`;
}

// ─── Saved Posts ───
const MOCK_SAVED = new Set(); // Set of post IDs

export async function toggleSavePost(postId) {
    await delay(200);
    if (MOCK_SAVED.has(postId)) {
        MOCK_SAVED.delete(postId);
        return { success: true, saved: false };
    } else {
        MOCK_SAVED.add(postId);
        return { success: true, saved: true };
    }
}

export async function fetchSavedPosts() {
    await networkDelay();
    const saved = FEED_POSTS.filter(p => MOCK_SAVED.has(p.id));
    return { data: saved, ids: [...MOCK_SAVED] };
}

// ─── Trending ───
export async function fetchTrending(communityId) {
    await networkDelay();
    // Simulate: rank by impact + engagement + recency
    const communityPosts = FEED_POSTS.filter(p => p.community.id === communityId);
    const ranked = communityPosts.sort((a, b) => {
        const scoreA = (a.co2Saved * 10) + (a.likesCount + a.commentsCount * 2);
        const scoreB = (b.co2Saved * 10) + (b.likesCount + b.commentsCount * 2);
        return scoreB - scoreA;
    });
    const top = ranked[0];
    if (!top) return { data: TRENDING };
    return {
        data: {
            ...TRENDING,
            title: top.actionLabel,
            description: `${communityPosts.length} posts from your community`,
            impactThisWeek: `${communityPosts.reduce((s, p) => s + p.co2Saved, 0).toFixed(1)}kg CO₂`,
            topPostId: top.id,
        },
    };
}

// ─── Streak ───
export async function fetchStreakData() {
    await delay(200);
    return {
        data: {
            current: CURRENT_USER.streakCount,
            goal: CURRENT_USER.streakGoal,
            lastActionDate: CURRENT_USER.lastActionDate,
            graceHours: CURRENT_USER.graceHours,
        },
    };
}

// ─── Map / Route Data ───
// 44 realistic routes around AISSMS campus, Pune — tagged by period
function route(id, type, label, co2, dist, cal, coords, period) {
    return { id, actionType: type, label, co2Saved: co2, distanceKm: dist, calories: cal, routeData: coords, period };
}

// Road segments (densely interpolated, snapped to Pune roads)
const TILAK_TO_FC = [
    { latitude: 18.5204, longitude: 73.8567 }, { latitude: 18.5208, longitude: 73.8559 }, { latitude: 18.5212, longitude: 73.8552 },
    { latitude: 18.5216, longitude: 73.8546 }, { latitude: 18.5220, longitude: 73.8541 }, { latitude: 18.5225, longitude: 73.8535 },
    { latitude: 18.5229, longitude: 73.8528 }, { latitude: 18.5234, longitude: 73.8522 }, { latitude: 18.5239, longitude: 73.8516 },
    { latitude: 18.5244, longitude: 73.8510 }, { latitude: 18.5249, longitude: 73.8504 }, { latitude: 18.5254, longitude: 73.8497 },
    { latitude: 18.5259, longitude: 73.8491 }, { latitude: 18.5264, longitude: 73.8485 }, { latitude: 18.5270, longitude: 73.8478 },
    { latitude: 18.5275, longitude: 73.8472 }, { latitude: 18.5281, longitude: 73.8465 }, { latitude: 18.5286, longitude: 73.8459 },
    { latitude: 18.5292, longitude: 73.8452 }, { latitude: 18.5297, longitude: 73.8446 }, { latitude: 18.5303, longitude: 73.8440 },
    { latitude: 18.5309, longitude: 73.8434 }, { latitude: 18.5315, longitude: 73.8428 }, { latitude: 18.5321, longitude: 73.8422 },
    { latitude: 18.5328, longitude: 73.8416 }, { latitude: 18.5335, longitude: 73.8410 }, { latitude: 18.5342, longitude: 73.8405 },
    { latitude: 18.5350, longitude: 73.8399 }, { latitude: 18.5358, longitude: 73.8394 }, { latitude: 18.5365, longitude: 73.8390 },
    { latitude: 18.5372, longitude: 73.8388 },
];
const FC_TO_TILAK = [...TILAK_TO_FC].reverse();
const STATION_WALK = [
    { latitude: 18.5130, longitude: 73.8610 }, { latitude: 18.5134, longitude: 73.8606 }, { latitude: 18.5138, longitude: 73.8602 },
    { latitude: 18.5142, longitude: 73.8598 }, { latitude: 18.5146, longitude: 73.8594 }, { latitude: 18.5150, longitude: 73.8590 },
    { latitude: 18.5154, longitude: 73.8586 }, { latitude: 18.5158, longitude: 73.8581 }, { latitude: 18.5162, longitude: 73.8577 },
    { latitude: 18.5166, longitude: 73.8573 }, { latitude: 18.5170, longitude: 73.8569 }, { latitude: 18.5174, longitude: 73.8565 },
    { latitude: 18.5178, longitude: 73.8561 }, { latitude: 18.5182, longitude: 73.8557 }, { latitude: 18.5186, longitude: 73.8553 },
    { latitude: 18.5190, longitude: 73.8549 }, { latitude: 18.5194, longitude: 73.8545 }, { latitude: 18.5198, longitude: 73.8542 },
    { latitude: 18.5203, longitude: 73.8539 }, { latitude: 18.5208, longitude: 73.8537 }, { latitude: 18.5213, longitude: 73.8535 },
];
const WALK_RETURN = [...STATION_WALK].reverse();
const KARVE = [
    { latitude: 18.5204, longitude: 73.8567 }, { latitude: 18.5198, longitude: 73.8555 }, { latitude: 18.5192, longitude: 73.8543 },
    { latitude: 18.5186, longitude: 73.8530 }, { latitude: 18.5180, longitude: 73.8518 }, { latitude: 18.5174, longitude: 73.8506 },
    { latitude: 18.5168, longitude: 73.8494 }, { latitude: 18.5162, longitude: 73.8482 }, { latitude: 18.5155, longitude: 73.8470 },
    { latitude: 18.5148, longitude: 73.8458 }, { latitude: 18.5142, longitude: 73.8446 }, { latitude: 18.5136, longitude: 73.8434 },
    { latitude: 18.5130, longitude: 73.8422 }, { latitude: 18.5124, longitude: 73.8410 }, { latitude: 18.5118, longitude: 73.8398 },
];
const SB = [
    { latitude: 18.5204, longitude: 73.8567 }, { latitude: 18.5210, longitude: 73.8578 }, { latitude: 18.5216, longitude: 73.8589 },
    { latitude: 18.5222, longitude: 73.8600 }, { latitude: 18.5228, longitude: 73.8611 }, { latitude: 18.5234, longitude: 73.8622 },
    { latitude: 18.5240, longitude: 73.8633 }, { latitude: 18.5246, longitude: 73.8644 }, { latitude: 18.5252, longitude: 73.8655 },
    { latitude: 18.5258, longitude: 73.8666 }, { latitude: 18.5264, longitude: 73.8677 }, { latitude: 18.5270, longitude: 73.8688 },
];
const PARK = [
    { latitude: 18.5190, longitude: 73.8560 }, { latitude: 18.5195, longitude: 73.8555 }, { latitude: 18.5200, longitude: 73.8548 },
    { latitude: 18.5205, longitude: 73.8542 }, { latitude: 18.5210, longitude: 73.8548 }, { latitude: 18.5212, longitude: 73.8555 },
    { latitude: 18.5208, longitude: 73.8562 }, { latitude: 18.5202, longitude: 73.8566 }, { latitude: 18.5196, longitude: 73.8564 },
    { latitude: 18.5190, longitude: 73.8560 },
];
const LONG_RIDE = [
    ...TILAK_TO_FC,
    { latitude: 18.5378, longitude: 73.8382 }, { latitude: 18.5385, longitude: 73.8370 }, { latitude: 18.5392, longitude: 73.8358 },
    { latitude: 18.5400, longitude: 73.8345 }, { latitude: 18.5408, longitude: 73.8332 }, { latitude: 18.5415, longitude: 73.8320 },
    { latitude: 18.5422, longitude: 73.8308 }, { latitude: 18.5430, longitude: 73.8296 }, { latitude: 18.5438, longitude: 73.8284 },
    { latitude: 18.5445, longitude: 73.8272 }, { latitude: 18.5452, longitude: 73.8260 },
];

function jitter(c, s) { const d = (s % 7) * 0.00008; return c.map(p => ({ latitude: p.latitude + d, longitude: p.longitude - d * 0.5 })); }

const MAP_ROUTES = [
    // TODAY (8)
    route('t1', 'cycling', 'Morning commute', 2.4, 10.2, 240, TILAK_TO_FC, 'today'),
    route('t2', 'walking', 'Walk to campus', 0.4, 2.1, 95, STATION_WALK, 'today'),
    route('t3', 'cycling', 'Evening return', 2.2, 9.8, 220, FC_TO_TILAK, 'today'),
    route('t4', 'walking', 'Park walk', 0.2, 0.8, 45, PARK, 'today'),
    route('t5', 'cycling', 'Quick errand', 0.8, 3.2, 80, KARVE, 'today'),
    route('t6', 'walking', 'Evening stroll', 0.3, 1.5, 70, WALK_RETURN, 'today'),
    route('t7', 'cycling', 'SB Rd ride', 1.0, 4.5, 110, SB, 'today'),
    route('t8', 'walking', 'Short loop', 0.1, 0.6, 30, jitter(PARK, 1), 'today'),
    // WEEK (+12 = 20)
    route('w1', 'cycling', 'Mon commute', 2.4, 10.2, 240, jitter(TILAK_TO_FC, 2), 'week'),
    route('w2', 'cycling', 'Mon return', 2.2, 9.8, 220, jitter(FC_TO_TILAK, 2), 'week'),
    route('w3', 'walking', 'Tue walk', 0.4, 2.1, 95, jitter(STATION_WALK, 3), 'week'),
    route('w4', 'cycling', 'Tue ride', 2.4, 10.2, 240, jitter(TILAK_TO_FC, 3), 'week'),
    route('w5', 'cycling', 'Wed commute', 2.4, 10.2, 240, jitter(TILAK_TO_FC, 4), 'week'),
    route('w6', 'walking', 'Wed walk', 0.3, 1.5, 70, jitter(WALK_RETURN, 4), 'week'),
    route('w7', 'cycling', 'Thu ride', 2.4, 10.2, 240, jitter(TILAK_TO_FC, 5), 'week'),
    route('w8', 'cycling', 'Thu return', 2.2, 9.8, 220, jitter(FC_TO_TILAK, 5), 'week'),
    route('w9', 'walking', 'Fri walk', 0.4, 2.1, 95, jitter(STATION_WALK, 6), 'week'),
    route('w10', 'cycling', 'Fri SB ride', 1.0, 4.5, 110, jitter(SB, 6), 'week'),
    route('w11', 'cycling', 'Sat Karve ride', 0.8, 3.2, 80, jitter(KARVE, 7), 'week'),
    route('w12', 'walking', 'Sun park', 0.2, 0.8, 45, jitter(PARK, 8), 'week'),
    // MONTH (+16 = 36)
    route('m1', 'cycling', 'Wk2 commute', 2.4, 10.2, 240, jitter(TILAK_TO_FC, 9), 'month'),
    route('m2', 'cycling', 'Wk2 return', 2.2, 9.8, 220, jitter(FC_TO_TILAK, 9), 'month'),
    route('m3', 'walking', 'Wk2 walk', 0.4, 2.1, 95, jitter(STATION_WALK, 10), 'month'),
    route('m4', 'cycling', 'Wk2 Wed', 2.4, 10.2, 240, jitter(TILAK_TO_FC, 11), 'month'),
    route('m5', 'cycling', 'Wk2 Thu', 2.4, 10.2, 240, jitter(TILAK_TO_FC, 12), 'month'),
    route('m6', 'walking', 'Wk2 Fri walk', 0.4, 2.1, 95, jitter(STATION_WALK, 13), 'month'),
    route('m7', 'cycling', 'Weekend long', 3.8, 16.5, 380, LONG_RIDE, 'month'),
    route('m8', 'cycling', 'Wk3 commute', 2.4, 10.2, 240, jitter(TILAK_TO_FC, 14), 'month'),
    route('m9', 'cycling', 'Wk3 Tue', 2.4, 10.2, 240, jitter(TILAK_TO_FC, 15), 'month'),
    route('m10', 'walking', 'Wk3 walk', 0.4, 2.1, 95, jitter(STATION_WALK, 16), 'month'),
    route('m11', 'cycling', 'Wk3 Thu', 2.4, 10.2, 240, jitter(TILAK_TO_FC, 17), 'month'),
    route('m12', 'cycling', 'Wk3 return', 2.2, 9.8, 220, jitter(FC_TO_TILAK, 17), 'month'),
    route('m13', 'cycling', 'Wk4 commute', 2.4, 10.2, 240, jitter(TILAK_TO_FC, 18), 'month'),
    route('m14', 'walking', 'Wk4 walk', 0.4, 2.1, 95, jitter(STATION_WALK, 19), 'month'),
    route('m15', 'cycling', 'Wk4 Karve', 0.8, 3.2, 80, jitter(KARVE, 20), 'month'),
    route('m16', 'cycling', 'Wk4 SB', 1.0, 4.5, 110, jitter(SB, 21), 'month'),
    // ALL (+8 = 44)
    route('a1', 'cycling', 'Old commute 1', 2.4, 10.2, 240, jitter(TILAK_TO_FC, 22), 'all'),
    route('a2', 'cycling', 'Old commute 2', 2.4, 10.2, 240, jitter(TILAK_TO_FC, 23), 'all'),
    route('a3', 'cycling', 'Old weekend', 3.8, 16.5, 380, jitter(LONG_RIDE, 24), 'all'),
    route('a4', 'walking', 'Old walk', 0.4, 2.1, 95, jitter(STATION_WALK, 25), 'all'),
    route('a5', 'cycling', 'Old Karve', 0.8, 3.2, 80, jitter(KARVE, 26), 'all'),
    route('a6', 'cycling', 'Old SB', 1.0, 4.5, 110, jitter(SB, 27), 'all'),
    route('a7', 'walking', 'Old park', 0.2, 0.8, 45, jitter(PARK, 28), 'all'),
    route('a8', 'cycling', 'Old long', 3.8, 16.5, 380, jitter(LONG_RIDE, 29), 'all'),
];

const PERIOD_CASCADE = { today: ['today'], week: ['today', 'week'], month: ['today', 'week', 'month'], all: ['today', 'week', 'month', 'all'] };

export async function fetchRouteHistory({ period = 'all' } = {}) {
    await networkDelay();
    const allowed = PERIOD_CASCADE[period] || PERIOD_CASCADE.all;
    return { data: MAP_ROUTES.filter(r => allowed.includes(r.period)) };
}

// ─── Heatmap ───
const MOCK_HEATMAP = [
    { latitude: 18.5204, longitude: 73.8567, weight: 0.95 }, { latitude: 18.5210, longitude: 73.8555, weight: 0.90 },
    { latitude: 18.5218, longitude: 73.8540, weight: 0.88 }, { latitude: 18.5225, longitude: 73.8528, weight: 0.85 },
    { latitude: 18.5235, longitude: 73.8515, weight: 0.82 },
    { latitude: 18.5248, longitude: 73.8500, weight: 0.75 }, { latitude: 18.5260, longitude: 73.8485, weight: 0.72 },
    { latitude: 18.5275, longitude: 73.8470, weight: 0.68 }, { latitude: 18.5290, longitude: 73.8455, weight: 0.65 },
    { latitude: 18.5305, longitude: 73.8440, weight: 0.60 },
    { latitude: 18.5320, longitude: 73.8425, weight: 0.55 }, { latitude: 18.5340, longitude: 73.8410, weight: 0.50 },
    { latitude: 18.5358, longitude: 73.8395, weight: 0.45 }, { latitude: 18.5372, longitude: 73.8388, weight: 0.40 },
    { latitude: 18.5130, longitude: 73.8610, weight: 0.55 }, { latitude: 18.5155, longitude: 73.8585, weight: 0.62 },
    { latitude: 18.5180, longitude: 73.8560, weight: 0.68 }, { latitude: 18.5192, longitude: 73.8550, weight: 0.72 },
    { latitude: 18.5186, longitude: 73.8530, weight: 0.40 }, { latitude: 18.5168, longitude: 73.8494, weight: 0.35 },
    { latitude: 18.5148, longitude: 73.8458, weight: 0.30 }, { latitude: 18.5130, longitude: 73.8422, weight: 0.25 },
    { latitude: 18.5222, longitude: 73.8600, weight: 0.38 }, { latitude: 18.5240, longitude: 73.8633, weight: 0.32 },
    { latitude: 18.5258, longitude: 73.8666, weight: 0.28 },
    { latitude: 18.5200, longitude: 73.8548, weight: 0.50 }, { latitude: 18.5195, longitude: 73.8555, weight: 0.48 },
    { latitude: 18.5100, longitude: 73.8630, weight: 0.12 }, { latitude: 18.5400, longitude: 73.8345, weight: 0.15 },
];

export async function fetchHeatmapData({ period = 'all' } = {}) {
    await delay(120);
    const pm = { today: 0.25, week: 0.55, month: 0.8, all: 1.0 }[period] || 1.0;
    const points = MOCK_HEATMAP.map(p => ({ ...p, weight: Math.min(p.weight * pm, 1) })).filter(p => p.weight > 0.06);

    const allowed = PERIOD_CASCADE[period] || PERIOD_CASCADE.all;
    const filtered = MAP_ROUTES.filter(r => allowed.includes(r.period));
    const totalCo2 = filtered.reduce((s, r) => s + r.co2Saved, 0);
    const totalDist = filtered.reduce((s, r) => s + r.distanceKm, 0);
    const totalCal = filtered.reduce((s, r) => s + r.calories, 0);
    const n = filtered.length || 1;
    const longest = filtered.length ? Math.max(...filtered.map(r => r.distanceKm)) : 0;

    return {
        data: {
            points,
            stats: {
                totalCo2Saved: totalCo2.toFixed(1),
                totalDistanceKm: totalDist.toFixed(1),
                totalSessions: filtered.length,
                totalCalories: totalCal,
                totalHours: (n * 0.35).toFixed(1),
                avgSpeed: (totalDist / (n * 0.35)).toFixed(1),
                avgDistPerSession: (totalDist / n).toFixed(1),
                fuelSavedL: (totalDist * 0.07).toFixed(1),
                longestRouteKm: longest.toFixed(1),
                mostUsedRoute: 'Tilak Rd \u2192 FC Rd',
                mostActiveDay: 'Thursday',
                equivalentTrees: Math.max(Math.round(totalCo2 / 0.8), 1),
                weeklyTrend: [1.2, 0.8, 1.5, 2.1, 0.6, 1.8, 2.4].map(v => +(v * pm).toFixed(1)),
            },
        },
    };
}

