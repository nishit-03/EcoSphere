// Mock data — DEPRECATED
// All data now fetched from Supabase.
// This file is kept only as a fallback during transition.

export const CURRENT_USER = {
    id: null,
    name: 'EcoUser',
    email: '',
    profileImage: null,
    communityId: null,
    communityName: 'EcoSphere',
    trustScore: 50,
    totalPoints: 0,
    streakCount: 0,
    streakGoal: 7,
    todayCo2Saved: 0,
    lastActionDate: 'Today',
    graceHours: 6,
};

export const COMMUNITIES = [];
export const TRENDING = { title: '', description: '', topContributors: [], impactThisWeek: '0kg CO₂' };
export const FEED_POSTS = [];
