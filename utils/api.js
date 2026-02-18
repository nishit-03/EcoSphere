// ─── Real Supabase API Layer ───
// Replaces the previous mock API. All calls go to Supabase.

import { supabase } from './supabase';

// ─── Helper: get current user id ───
async function getCurrentUserId() {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id;
}

// ─── Feed ───
export async function fetchFeed({ page = 1, limit = 10 } = {}) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const userId = await getCurrentUserId();

    const { data, error, count } = await supabase
        .from('posts')
        .select(`
            id, action_type, action_label, before_image_url, after_image_url,
            co2_saved, calories_burned, distance_km, caption, ai_caption,
            ai_verification_status, ai_confidence_score,
            likes_count, comments_count, share_count, created_at,
            users!posts_user_id_fkey ( id, name, profile_image_url, trust_score ),
            communities ( id, name )
        `, { count: 'exact' })
        .eq('ai_verification_status', 'verified')
        .order('created_at', { ascending: false })
        .range(from, to);

    if (error) throw error;

    // Check which posts the current user has liked
    let likedIds = new Set();
    if (userId && data?.length) {
        const postIds = data.map(p => p.id);
        const { data: likes } = await supabase
            .from('likes')
            .select('post_id')
            .eq('user_id', userId)
            .in('post_id', postIds);
        likedIds = new Set((likes || []).map(l => l.post_id));
    }

    const formatted = (data || []).map(p => ({
        id: p.id,
        actionType: p.action_type,
        actionLabel: p.action_label || formatActionLabel(p.action_type),
        beforeImage: p.before_image_url,
        afterImage: p.after_image_url,
        co2Saved: p.co2_saved || 0,
        caloriesBurned: p.calories_burned || 0,
        distanceKm: p.distance_km,
        caption: p.caption || '',
        aiCaption: p.ai_caption,
        aiVerificationStatus: p.ai_verification_status,
        aiConfidenceScore: p.ai_confidence_score,
        likesCount: p.likes_count || 0,
        commentsCount: p.comments_count || 0,
        shareCount: p.share_count || 0,
        isLiked: likedIds.has(p.id),
        timestamp: formatTimestamp(p.created_at),
        user: {
            id: p.users?.id,
            name: p.users?.name || 'EcoUser',
            avatar: p.users?.profile_image_url,
            trustScore: p.users?.trust_score || 50,
        },
        community: {
            id: p.communities?.id,
            name: p.communities?.name || 'EcoSphere',
        },
    }));

    return {
        data: formatted,
        pagination: { page, limit, total: count || 0, hasMore: to < (count || 0) - 1 },
    };
}

function formatActionLabel(type) {
    const labels = {
        walking: 'Walking', cycling: 'Cycling', cleanup: 'Beach/Area Cleanup',
        planting: 'Tree Planting', recycling: 'Recycling', energy_saving: 'Energy Saving',
        public_transit: 'Public Transit', other: 'Eco Action',
    };
    return labels[type] || 'Eco Action';
}

function formatTimestamp(iso) {
    if (!iso) return '';
    const diff = (Date.now() - new Date(iso).getTime()) / 1000;
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

// ─── Like ───
export async function toggleLike(postId) {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('Not authenticated');

    // Check if already liked
    const { data: existing } = await supabase
        .from('likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .maybeSingle();

    if (existing) {
        await supabase.from('likes').delete().eq('id', existing.id);
        return { success: true, liked: false };
    } else {
        await supabase.from('likes').insert({ post_id: postId, user_id: userId });
        return { success: true, liked: true };
    }
}

// ─── Comments ───
export async function fetchComments(postId, { page = 1, limit = 20 } = {}) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
        .from('comments')
        .select(`
            id, content, ai_moderation_flag, created_at,
            users!comments_user_id_fkey ( id, name, profile_image_url )
        `, { count: 'exact' })
        .eq('post_id', postId)
        .order('created_at', { ascending: false })
        .range(from, to);

    if (error) throw error;

    const formatted = (data || []).map(c => ({
        id: c.id,
        userId: c.users?.id,
        userName: c.users?.name || 'EcoUser',
        userAvatar: c.users?.profile_image_url || null,
        content: c.content,
        aiModerationFlag: c.ai_moderation_flag,
        createdAt: c.created_at,
        likes: 0,
    }));

    return {
        data: formatted,
        pagination: { page, limit, total: count || 0, hasMore: to < (count || 0) - 1 },
    };
}

export async function postComment(postId, content) {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('Not authenticated');

    // Simple toxicity check
    const BLOCKED = ['spam', 'scam', 'fake', 'hate', 'stupid'];
    if (BLOCKED.some(w => content.toLowerCase().includes(w))) {
        return { success: false, error: 'Your comment may contain inappropriate content.', flagged: true };
    }

    const { data, error } = await supabase
        .from('comments')
        .insert({ post_id: postId, user_id: userId, content })
        .select(`id, content, created_at, users!comments_user_id_fkey ( id, name, profile_image_url )`)
        .single();

    if (error) throw error;

    return {
        success: true,
        comment: {
            id: data.id,
            userId: data.users?.id,
            userName: data.users?.name || 'You',
            userAvatar: data.users?.profile_image_url || null,
            content: data.content,
            createdAt: data.created_at,
            aiModerationFlag: false,
            likes: 0,
        },
    };
}

export async function deleteComment(postId, commentId) {
    const userId = await getCurrentUserId();
    await supabase.from('comments').delete().eq('id', commentId).eq('user_id', userId);
    return { success: true };
}

// ─── Notifications ───
export async function fetchNotifications() {
    const userId = await getCurrentUserId();
    if (!userId) return { data: [] };

    const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

    if (error) throw error;

    return {
        data: (data || []).map(n => ({
            id: n.id,
            type: n.type,
            message: n.message,
            referenceId: n.reference_id,
            isRead: n.is_read,
            createdAt: n.created_at,
        })),
    };
}

export async function markNotificationRead(notifId) {
    await supabase.from('notifications').update({ is_read: true }).eq('id', notifId);
    return { success: true };
}

export async function markAllNotificationsRead() {
    const userId = await getCurrentUserId();
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId);
    return { success: true };
}

// ─── Share ───
export function generateShareMessage(post) {
    const stats = [];
    if (post.co2Saved > 0) stats.push(`${post.co2Saved}kg CO₂ saved`);
    if (post.distanceKm) stats.push(`${post.distanceKm}km`);
    if (post.caloriesBurned > 0) stats.push(`${post.caloriesBurned} cal`);
    return `🌱 I just completed "${post.actionLabel}" on EcoSphere!\n${stats.join(' • ')}\n\nJoin me in making a difference! 🌍\nhttps://ecosphere.app/post/${post.id}`;
}

// ─── Saved Posts ───
export async function toggleSavePost(postId) {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('Not authenticated');

    const { data: existing } = await supabase
        .from('saved_posts')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .maybeSingle();

    if (existing) {
        await supabase.from('saved_posts').delete().eq('id', existing.id);
        return { success: true, saved: false };
    } else {
        await supabase.from('saved_posts').insert({ post_id: postId, user_id: userId });
        return { success: true, saved: true };
    }
}

export async function fetchSavedPosts() {
    const userId = await getCurrentUserId();
    if (!userId) return { data: [], ids: [] };

    const { data, error } = await supabase
        .from('saved_posts')
        .select('post_id, posts ( id, action_type, action_label, before_image_url, likes_count, co2_saved )')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) throw error;

    const ids = (data || []).map(s => s.post_id);
    const posts = (data || []).map(s => s.posts).filter(Boolean);
    return { data: posts, ids };
}

// ─── Trending ───
export async function fetchTrending(communityId) {
    const { data } = await supabase
        .from('posts')
        .select('id, action_label, co2_saved, likes_count, comments_count, community_id')
        .eq('ai_verification_status', 'verified')
        .eq('community_id', communityId)
        .order('likes_count', { ascending: false })
        .limit(1)
        .maybeSingle();

    return {
        data: {
            title: data?.action_label || 'Top Eco Action',
            description: 'Trending in your community',
            impactThisWeek: `${data?.co2_saved || 0}kg CO₂`,
            topContributors: [],
            topPostId: data?.id,
        },
    };
}

// ─── Streak ───
export async function fetchStreakData() {
    const userId = await getCurrentUserId();
    if (!userId) return { data: { current: 0, goal: 7, lastActionDate: null, graceHours: 12 } };

    const { data } = await supabase
        .from('users')
        .select('streak_count')
        .eq('id', userId)
        .single();

    return {
        data: {
            current: data?.streak_count || 0,
            goal: 7,
            lastActionDate: new Date().toISOString(),
            graceHours: 12,
        },
    };
}

// ─── Map / Route Data ───
// Routes are stored in posts.route_data (JSONB). We fetch posts with GPS data.
export async function fetchRouteHistory({ period = 'all' } = {}) {
    const userId = await getCurrentUserId();

    let query = supabase
        .from('posts')
        .select('id, action_type, action_label, co2_saved, distance_km, calories_burned, route_data, created_at')
        .not('route_data', 'is', null)
        .order('created_at', { ascending: false });

    // Filter by period
    if (period !== 'all') {
        const days = { today: 1, week: 7, month: 30 }[period] || 365;
        const since = new Date(Date.now() - days * 86400000).toISOString();
        query = query.gte('created_at', since);
    }

    const { data, error } = await query.limit(100);
    if (error) throw error;

    const routes = (data || []).map(p => ({
        id: p.id,
        actionType: p.action_type,
        label: p.action_label || formatActionLabel(p.action_type),
        co2Saved: p.co2_saved || 0,
        distanceKm: p.distance_km || 0,
        calories: p.calories_burned || 0,
        routeData: p.route_data?.coordinates || [],
        period,
    }));

    return { data: routes };
}

export async function fetchHeatmapData({ period = 'all' } = {}) {
    const { data: routes } = await fetchRouteHistory({ period });

    // Build heatmap from route coordinates
    const allCoords = [];
    routes.forEach(r => {
        if (r.routeData?.length) {
            r.routeData.forEach(coord => {
                allCoords.push({ latitude: coord.latitude, longitude: coord.longitude, weight: 0.7 });
            });
        }
    });

    const totalCo2 = routes.reduce((s, r) => s + r.co2Saved, 0);
    const totalDist = routes.reduce((s, r) => s + r.distanceKm, 0);
    const totalCal = routes.reduce((s, r) => s + r.calories, 0);
    const n = routes.length || 1;

    return {
        data: {
            points: allCoords,
            stats: {
                totalCo2Saved: totalCo2.toFixed(1),
                totalDistanceKm: totalDist.toFixed(1),
                totalSessions: routes.length,
                totalCalories: totalCal,
                totalHours: (n * 0.35).toFixed(1),
                avgSpeed: (totalDist / (n * 0.35)).toFixed(1),
                avgDistPerSession: (totalDist / n).toFixed(1),
                fuelSavedL: (totalDist * 0.07).toFixed(1),
                longestRouteKm: routes.length ? Math.max(...routes.map(r => r.distanceKm)).toFixed(1) : '0',
                mostUsedRoute: 'Your Route',
                mostActiveDay: 'Today',
                equivalentTrees: Math.max(Math.round(totalCo2 / 0.8), 1),
                weeklyTrend: [0, 0, 0, 0, 0, 0, 0],
            },
        },
    };
}
