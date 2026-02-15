// ─── Global State Store (Zustand) ───
import { create } from 'zustand';
import * as api from './api';
import { FEED_POSTS } from './mockData';
import { impactAsync, notificationAsync } from './haptics';

export const useStore = create((set, get) => ({
    // ─── Feed State ───
    posts: [],
    feedLoading: true,
    feedRefreshing: false,
    feedError: null,
    feedPage: 1,
    feedHasMore: true,

    loadFeed: async () => {
        set({ feedLoading: true, feedError: null });
        try {
            const res = await api.fetchFeed({ page: 1, limit: 10 });
            set({
                posts: res.data.map(p => ({ ...p })),
                feedLoading: false,
                feedPage: 1,
                feedHasMore: res.pagination.hasMore,
            });
        } catch (e) {
            set({ feedError: 'Failed to load feed. Pull down to retry.', feedLoading: false });
        }
    },

    refreshFeed: async () => {
        set({ feedRefreshing: true, feedError: null });
        try {
            const res = await api.fetchFeed({ page: 1, limit: 10 });
            set({
                posts: res.data.map(p => ({ ...p })),
                feedRefreshing: false,
                feedPage: 1,
                feedHasMore: res.pagination.hasMore,
            });
        } catch (e) {
            set({ feedRefreshing: false, feedError: 'Network error. Please try again.' });
        }
    },

    loadMorePosts: async () => {
        const { feedPage, feedHasMore, posts } = get();
        if (!feedHasMore) return;
        try {
            const res = await api.fetchFeed({ page: feedPage + 1, limit: 10 });
            set({
                posts: [...posts, ...res.data.map(p => ({ ...p }))],
                feedPage: feedPage + 1,
                feedHasMore: res.pagination.hasMore,
            });
        } catch (e) { /* silently fail pagination */ }
    },

    // ─── Like ───
    toggleLike: async (postId) => {
        impactAsync();
        // Optimistic update
        set(state => ({
            posts: state.posts.map(p => {
                if (p.id === postId) {
                    return {
                        ...p,
                        isLiked: !p.isLiked,
                        likesCount: p.isLiked ? p.likesCount - 1 : p.likesCount + 1,
                    };
                }
                return p;
            }),
        }));
        // Fire and forget (revert on error in production)
        try {
            await api.toggleLike(postId);
        } catch (e) {
            // Revert on failure
            set(state => ({
                posts: state.posts.map(p => {
                    if (p.id === postId) {
                        return {
                            ...p,
                            isLiked: !p.isLiked,
                            likesCount: p.isLiked ? p.likesCount - 1 : p.likesCount + 1,
                        };
                    }
                    return p;
                }),
            }));
        }
    },

    // ─── Comments ───
    comments: {},          // { [postId]: Comment[] }
    commentsLoading: {},   // { [postId]: boolean }
    commentSending: false,
    commentError: null,

    loadComments: async (postId) => {
        set(state => ({ commentsLoading: { ...state.commentsLoading, [postId]: true } }));
        try {
            const res = await api.fetchComments(postId, { page: 1, limit: 20 });
            set(state => ({
                comments: { ...state.comments, [postId]: res.data },
                commentsLoading: { ...state.commentsLoading, [postId]: false },
            }));
        } catch (e) {
            set(state => ({ commentsLoading: { ...state.commentsLoading, [postId]: false } }));
        }
    },

    addComment: async (postId, content) => {
        set({ commentSending: true, commentError: null });
        try {
            const res = await api.postComment(postId, content);
            if (!res.success) {
                set({ commentSending: false, commentError: res.error });
                return false;
            }
            // Optimistic: add to local state + increment count
            set(state => ({
                commentSending: false,
                comments: {
                    ...state.comments,
                    [postId]: [res.comment, ...(state.comments[postId] || [])],
                },
                posts: state.posts.map(p =>
                    p.id === postId ? { ...p, commentsCount: p.commentsCount + 1 } : p
                ),
            }));
            return true;
        } catch (e) {
            set({ commentSending: false, commentError: 'Failed to post comment.' });
            return false;
        }
    },

    removeComment: async (postId, commentId) => {
        // Optimistic remove
        set(state => ({
            comments: {
                ...state.comments,
                [postId]: (state.comments[postId] || []).filter(c => c.id !== commentId),
            },
            posts: state.posts.map(p =>
                p.id === postId ? { ...p, commentsCount: Math.max(0, p.commentsCount - 1) } : p
            ),
        }));
        await api.deleteComment(postId, commentId);
    },

    // ─── Notifications ───
    notifications: [],
    notificationsLoading: false,
    unreadCount: 0,

    loadNotifications: async () => {
        set({ notificationsLoading: true });
        try {
            const res = await api.fetchNotifications();
            const unread = res.data.filter(n => !n.isRead).length;
            set({ notifications: res.data, notificationsLoading: false, unreadCount: unread });
        } catch (e) {
            set({ notificationsLoading: false });
        }
    },

    markRead: async (notifId) => {
        set(state => ({
            notifications: state.notifications.map(n =>
                n.id === notifId ? { ...n, isRead: true } : n
            ),
            unreadCount: Math.max(0, state.unreadCount - 1),
        }));
        await api.markNotificationRead(notifId);
    },

    markAllRead: async () => {
        set(state => ({
            notifications: state.notifications.map(n => ({ ...n, isRead: true })),
            unreadCount: 0,
        }));
        await api.markAllNotificationsRead();
    },

    // ─── Share tracking ───
    incrementShareCount: (postId) => {
        set(state => ({
            posts: state.posts.map(p =>
                p.id === postId ? { ...p, shareCount: (p.shareCount || 0) + 1 } : p
            ),
        }));
    },

    // ─── Saved Posts (Bookmarks) ───
    savedPostIds: new Set(),

    toggleSavePost: async (postId) => {
        impactAsync();
        const { savedPostIds } = get();
        const wasSaved = savedPostIds.has(postId);
        // Optimistic toggle
        const next = new Set(savedPostIds);
        if (wasSaved) next.delete(postId); else next.add(postId);
        set({ savedPostIds: next });
        try {
            await api.toggleSavePost(postId);
        } catch (e) {
            // Revert
            const revert = new Set(get().savedPostIds);
            if (wasSaved) revert.add(postId); else revert.delete(postId);
            set({ savedPostIds: revert });
        }
    },

    loadSavedPosts: async () => {
        try {
            const res = await api.fetchSavedPosts();
            set({ savedPostIds: new Set(res.ids) });
        } catch (e) { /* silent */ }
    },

    isPostSaved: (postId) => get().savedPostIds.has(postId),

    // ─── Trending ───
    trendingData: null,
    trendingLoading: false,

    loadTrending: async (communityId) => {
        set({ trendingLoading: true });
        try {
            const res = await api.fetchTrending(communityId);
            set({ trendingData: res.data, trendingLoading: false });
        } catch (e) {
            set({ trendingLoading: false });
        }
    },

    // ─── Streak ───
    streakData: null,

    loadStreak: async () => {
        try {
            const res = await api.fetchStreakData();
            set({ streakData: res.data });
        } catch (e) { /* silent */ }
    },

    // ─── Map / Impact ───
    mapRoutes: [],
    heatmapData: null,
    mapStats: null,
    mapViewMode: 'routes', // 'routes' | 'heatmap'
    mapPeriod: 'all',      // 'today' | 'week' | 'month' | 'all'
    mapLoading: false,


    loadMapData: async (period) => {
        const p = period || get().mapPeriod;
        set({ mapLoading: true });
        try {
            const [routeRes, heatRes] = await Promise.all([
                api.fetchRouteHistory({ period: p }),
                api.fetchHeatmapData({ period: p }),
            ]);
            set({
                mapRoutes: routeRes.data,
                heatmapData: heatRes.data.points,
                mapStats: heatRes.data.stats,
                mapLoading: false,
            });
        } catch (e) {
            set({ mapLoading: false });
        }
    },



    setMapViewMode: (mode) => set({ mapViewMode: mode }),
    setMapPeriod: (period) => { set({ mapPeriod: period }); get().loadMapData(period); },
}));
