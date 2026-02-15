import { View, Text, FlatList, Image, TouchableOpacity, ScrollView, Share, AppState } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useCallback, useEffect, useRef, memo } from 'react';
import { useRouter } from 'expo-router';
import Svg, { Circle } from 'react-native-svg';
import {
    Heart, MessageCircle, Share2, MoreHorizontal,
    ShieldCheck, Flame, MapPin, Zap, TreePine,
    Bell, Bookmark, TrendingUp, ChevronRight, WifiOff
} from 'lucide-react-native';
import { Avatar } from '../../components/Avatar';
import { Badge } from '../../components/Badge';
import { CommentSheet } from '../../components/CommentSheet';
import { NotificationSheet } from '../../components/NotificationSheet';
import { StreakSheet } from '../../components/StreakSheet';
import { SkeletonFeed } from '../../components/SkeletonPost';
import { LeafRefreshIndicator } from '../../components/LeafRefresh';
import { useStore } from '../../utils/store';
import { generateShareMessage } from '../../utils/api';
import { CURRENT_USER } from '../../utils/mockData';
import { impactAsync } from '../../utils/haptics';

// ─── Streak Ring (Duolingo-inspired) ───
function StreakRing({ current, goal, size = 48 }) {
    const strokeWidth = 3.5;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = Math.min(current / goal, 1);
    const strokeDashoffset = circumference * (1 - progress);

    return (
        <View className="items-center justify-center" style={{ width: size, height: size }}>
            <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
                <Circle cx={size / 2} cy={size / 2} r={radius} stroke="#334155" strokeWidth={strokeWidth} fill="none" />
                <Circle cx={size / 2} cy={size / 2} r={radius} stroke="#f97316" strokeWidth={strokeWidth} fill="none"
                    strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" />
            </Svg>
            <View className="absolute items-center">
                <Flame size={14} color="#f97316" fill="#f97316" />
                <Text className="text-white font-black text-[10px]">{current}</Text>
            </View>
        </View>
    );
}

// ─── Feed Header ───
function FeedHeader({ unreadCount, onNotifPress, onStreakPress, onAvatarPress, streakData }) {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    const streak = streakData || CURRENT_USER;

    return (
        <View className="px-5 pt-3 pb-4">
            <View className="flex-row items-center justify-between mb-5">
                <TouchableOpacity className="flex-row items-center gap-3" onPress={onAvatarPress} activeOpacity={0.7}>
                    <Avatar size="sm" fallback={CURRENT_USER.name[0]} className="border-2 border-teal-500" />
                    <View>
                        <Text className="text-slate-400 text-xs font-medium">{greeting} 👋</Text>
                        <Text className="text-white font-bold text-lg leading-tight">{CURRENT_USER.name}</Text>
                    </View>
                </TouchableOpacity>
                <View className="flex-row items-center gap-4">
                    <TouchableOpacity onPress={onStreakPress} activeOpacity={0.7}>
                        <StreakRing current={streak.current || streak.streakCount} goal={streak.goal || streak.streakGoal} />
                    </TouchableOpacity>
                    <TouchableOpacity className="relative" onPress={onNotifPress}>
                        <Bell size={22} color="#94a3b8" />
                        {unreadCount > 0 && (
                            <View className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-red-500 rounded-full items-center justify-center px-1 border-2 border-gray-900">
                                <Text className="text-white text-[9px] font-bold">{unreadCount > 9 ? '9+' : unreadCount}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
            {/* Today's impact card */}
            <View className="bg-slate-800/80 rounded-2xl p-4 flex-row items-center justify-between border border-slate-700/40">
                <View className="flex-row items-center gap-3">
                    <View className="w-10 h-10 rounded-xl bg-teal-500/15 items-center justify-center border border-teal-500/20">
                        <Zap size={20} color="#2dd4bf" />
                    </View>
                    <View>
                        <Text className="text-slate-400 text-xs font-medium">Today's Impact</Text>
                        <Text className="text-white font-black text-xl">{CURRENT_USER.todayCo2Saved}kg<Text className="text-sm font-medium text-teal-400"> CO₂</Text></Text>
                    </View>
                </View>
                <View className="items-end">
                    <Text className="text-slate-500 text-[10px] font-medium uppercase tracking-wider">Trust</Text>
                    <Text className="text-teal-400 font-black text-lg">{CURRENT_USER.trustScore}</Text>
                </View>
            </View>
        </View>
    );
}

// ─── Trending Section (Dynamic) ───
function TrendingSection({ trending, onPress }) {
    if (!trending) return null;
    return (
        <View className="px-5 mb-4">
            <View className="flex-row items-center gap-2 mb-3">
                <TrendingUp size={16} color="#f97316" />
                <Text className="text-white font-bold text-sm">Trending in Your Community</Text>
                <Badge variant="orange">🔥</Badge>
            </View>
            <TouchableOpacity
                className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/40 flex-row items-center active:bg-slate-700/80"
                onPress={onPress}
                activeOpacity={0.7}
            >
                <View className="flex-1">
                    <Text className="text-white font-bold text-base mb-1">{trending.title}</Text>
                    <Text className="text-slate-400 text-xs mb-3">{trending.description}</Text>
                    <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center">
                            <View className="flex-row" style={{ marginRight: 8 }}>
                                {trending.topContributors?.slice(0, 4).map((c, i) => (
                                    <View key={c.id} style={{ marginLeft: i > 0 ? -10 : 0, zIndex: 4 - i }}>
                                        <Image source={{ uri: c.avatar }} className="w-7 h-7 rounded-full border-2 border-gray-900" />
                                    </View>
                                ))}
                            </View>
                            <Text className="text-slate-500 text-xs">+47 joined</Text>
                        </View>
                        <Badge variant="success">{trending.impactThisWeek}</Badge>
                    </View>
                </View>
                <ChevronRight size={20} color="#475569" className="ml-2" />
            </TouchableOpacity>
        </View>
    );
}

// ─── Impact Pill ───
function ImpactPill({ icon: Icon, value, label, color, bgClass }) {
    return (
        <View className={`flex-row items-center gap-1.5 px-3 py-1.5 rounded-full ${bgClass} border border-slate-600/20`}>
            <Icon size={13} color={color} />
            <Text className="text-white font-bold text-xs">{value}</Text>
            <Text className="text-slate-500 text-[10px] font-medium">{label}</Text>
        </View>
    );
}

// ─── Post Card (memoized for 60fps scroll) ───
const PostCard = memo(function PostCard({ post, onLike, onComment, onShare, isSaved, onToggleSave }) {
    return (
        <View className="mb-3 mx-4 bg-slate-800/90 rounded-2xl overflow-hidden border border-slate-700/40">
            {/* Header */}
            <View className="flex-row items-center justify-between px-4 pt-4 pb-2">
                <View className="flex-row items-center flex-1">
                    <Avatar source={{ uri: post.user.avatar }} size="sm" className="mr-3 border-2 border-slate-600" />
                    <View className="flex-1">
                        <View className="flex-row items-center gap-2">
                            <Text className="font-bold text-white text-[15px]">{post.user.name}</Text>
                            {post.aiVerificationStatus === 'verified' && (
                                <View className="flex-row items-center gap-0.5 bg-emerald-500/15 px-1.5 py-0.5 rounded-full border border-emerald-500/20">
                                    <ShieldCheck size={10} color="#34d399" />
                                    <Text className="text-emerald-400 text-[9px] font-bold">VERIFIED</Text>
                                </View>
                            )}
                        </View>
                        <View className="flex-row items-center gap-2 mt-0.5">
                            <Text className="text-xs text-slate-500">{post.community.name}</Text>
                            <Text className="text-slate-700">•</Text>
                            <Text className="text-xs text-slate-500">{post.timestamp}</Text>
                        </View>
                    </View>
                </View>
                <TouchableOpacity className="p-1">
                    <MoreHorizontal size={20} color="#475569" />
                </TouchableOpacity>
            </View>

            {/* Activity label */}
            <View className="px-4 pb-2">
                <Text className="text-lg font-bold text-white">{post.actionLabel}</Text>
            </View>

            {/* Images */}
            <View className="mx-4 mb-3">
                <View className="flex-row gap-1 h-56 rounded-xl overflow-hidden bg-slate-700">
                    {post.afterImage ? (
                        <>
                            <View className="flex-1 relative">
                                <Image source={{ uri: post.beforeImage }} className="w-full h-full" resizeMode="cover" />
                                <View className="absolute bottom-2 left-2 bg-black/70 px-2.5 py-1 rounded-lg">
                                    <Text className="text-white text-[10px] font-bold uppercase tracking-wider">Before</Text>
                                </View>
                            </View>
                            <View className="flex-1 relative">
                                <Image source={{ uri: post.afterImage }} className="w-full h-full" resizeMode="cover" />
                                <View className="absolute bottom-2 left-2 bg-teal-500/90 px-2.5 py-1 rounded-lg">
                                    <Text className="text-white text-[10px] font-bold uppercase tracking-wider">After</Text>
                                </View>
                            </View>
                        </>
                    ) : (
                        <Image source={{ uri: post.beforeImage }} className="w-full h-full" resizeMode="cover" />
                    )}
                </View>
            </View>

            {/* Impact pills */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3"
                contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
                {post.co2Saved > 0 && <ImpactPill icon={Zap} value={`${post.co2Saved}kg`} label="CO₂" color="#2dd4bf" bgClass="bg-teal-500/10" />}
                {post.distanceKm && <ImpactPill icon={MapPin} value={`${post.distanceKm}km`} label="Distance" color="#60a5fa" bgClass="bg-blue-500/10" />}
                {post.caloriesBurned > 0 && <ImpactPill icon={Flame} value={`${post.caloriesBurned}`} label="Cal" color="#f97316" bgClass="bg-orange-500/10" />}
                {post.aiConfidenceScore && <ImpactPill icon={ShieldCheck} value={`${Math.round(post.aiConfidenceScore * 100)}%`} label="AI Trust" color="#34d399" bgClass="bg-emerald-500/10" />}
            </ScrollView>

            {/* Caption */}
            <View className="px-4 mb-2">
                <Text className="text-slate-200 leading-snug text-[14px]">{post.caption}</Text>
            </View>

            {/* AI Insight */}
            {post.aiCaption && (
                <View className="mx-4 mb-3 bg-slate-700/40 p-3 rounded-xl flex-row items-start border border-slate-600/20">
                    <Text className="mr-2 text-sm mt-0.5">🧠</Text>
                    <View className="flex-1">
                        <Text className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider mb-1">AI Insight</Text>
                        <Text className="text-xs text-slate-400 font-medium leading-5">{post.aiCaption}</Text>
                    </View>
                </View>
            )}

            {/* Footer */}
            <View className="flex-row items-center justify-between px-4 py-3 border-t border-slate-700/30">
                <View className="flex-row gap-5">
                    <TouchableOpacity className="flex-row items-center gap-1.5" onPress={() => onLike(post.id)} activeOpacity={0.7}>
                        <Heart size={21} color={post.isLiked ? '#ef4444' : '#64748b'} fill={post.isLiked ? '#ef4444' : 'none'} />
                        <Text className={`font-semibold text-sm ${post.isLiked ? 'text-red-400' : 'text-slate-400'}`}>{post.likesCount}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="flex-row items-center gap-1.5" onPress={() => onComment(post)}>
                        <MessageCircle size={21} color="#64748b" />
                        <Text className="text-slate-400 font-semibold text-sm">{post.commentsCount}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => onShare(post)}>
                        <Share2 size={20} color="#64748b" />
                    </TouchableOpacity>
                </View>
                <TouchableOpacity onPress={() => onToggleSave(post.id)}>
                    <Bookmark size={20} color={isSaved ? '#2dd4bf' : '#64748b'} fill={isSaved ? '#2dd4bf' : 'none'} />
                </TouchableOpacity>
            </View>
        </View>
    );
});

// ─── Error State ───
function ErrorBanner({ message, onRetry }) {
    return (
        <TouchableOpacity onPress={onRetry} className="mx-4 mb-3 bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex-row items-center gap-3">
            <WifiOff size={20} color="#ef4444" />
            <View className="flex-1">
                <Text className="text-red-400 font-medium text-sm">{message}</Text>
                <Text className="text-slate-500 text-xs mt-0.5">Tap to retry</Text>
            </View>
        </TouchableOpacity>
    );
}

// ─── Empty State ───
function EmptyState() {
    return (
        <View className="items-center justify-center px-8 py-16">
            <Text className="text-6xl mb-4">🌱</Text>
            <Text className="text-white font-bold text-xl text-center mb-2">Your feed is empty</Text>
            <Text className="text-slate-400 text-center text-sm mb-6 leading-relaxed">
                Log your first eco-friendly action and inspire your community!
            </Text>
            <TouchableOpacity className="bg-teal-500 px-8 py-3.5 rounded-full shadow-lg shadow-teal-500/20">
                <Text className="text-white font-bold text-base">Log Your First Action</Text>
            </TouchableOpacity>
        </View>
    );
}

// ═══════════════════════════════════════
// MAIN HOME SCREEN
// ═══════════════════════════════════════
export default function Home() {
    const router = useRouter();

    // ─── Store selectors ───
    const posts = useStore(s => s.posts);
    const feedLoading = useStore(s => s.feedLoading);
    const feedError = useStore(s => s.feedError);
    const loadFeed = useStore(s => s.loadFeed);
    const loadMorePosts = useStore(s => s.loadMorePosts);
    const toggleLike = useStore(s => s.toggleLike);
    const comments = useStore(s => s.comments);
    const commentsLoading = useStore(s => s.commentsLoading);
    const commentSending = useStore(s => s.commentSending);
    const commentError = useStore(s => s.commentError);
    const loadComments = useStore(s => s.loadComments);
    const addComment = useStore(s => s.addComment);
    const removeComment = useStore(s => s.removeComment);
    const notifications = useStore(s => s.notifications);
    const notificationsLoading = useStore(s => s.notificationsLoading);
    const unreadCount = useStore(s => s.unreadCount);
    const loadNotifications = useStore(s => s.loadNotifications);
    const markRead = useStore(s => s.markRead);
    const markAllRead = useStore(s => s.markAllRead);
    const incrementShareCount = useStore(s => s.incrementShareCount);
    const savedPostIds = useStore(s => s.savedPostIds);
    const toggleSavePost = useStore(s => s.toggleSavePost);
    const loadSavedPosts = useStore(s => s.loadSavedPosts);
    const trendingData = useStore(s => s.trendingData);
    const loadTrending = useStore(s => s.loadTrending);
    const streakData = useStore(s => s.streakData);
    const loadStreak = useStore(s => s.loadStreak);

    // ─── Local UI state ───
    const [commentPost, setCommentPost] = useState(null);
    const [notifVisible, setNotifVisible] = useState(false);
    const [streakVisible, setStreakVisible] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const appState = useRef(AppState.currentState);

    // ─── Load everything on mount ───
    useEffect(() => {
        loadFeed();
        loadNotifications();
        loadSavedPosts();
        loadTrending(CURRENT_USER.communityId);
        loadStreak();
    }, []);

    // ─── Auto-refresh when app returns to foreground ───
    useEffect(() => {
        const sub = AppState.addEventListener('change', nextState => {
            if (appState.current.match(/inactive|background/) && nextState === 'active') {
                loadFeed();
                loadNotifications();
                loadTrending(CURRENT_USER.communityId);
                loadStreak();
            }
            appState.current = nextState;
        });
        return () => sub?.remove();
    }, []);

    // ─── Custom pull-to-refresh (NO native RefreshControl) ───
    const handleScroll = useCallback((e) => {
        const y = e.nativeEvent.contentOffset.y;
        // Detect pull past threshold while at top of list
        if (y < -80 && !isRefreshing) {
            console.log('[Home] Pull threshold reached, y =', y);
            setIsRefreshing(true);
        }
    }, [isRefreshing]);

    const handleRefreshComplete = useCallback(() => {
        console.log('[Home] Refresh animation complete, reloading data...');
        // 3s animation finished — now reload data
        loadFeed();
        loadNotifications();
        loadTrending(CURRENT_USER.communityId);
        loadStreak();
        setIsRefreshing(false);
        console.log('[Home] Data reload triggered, isRefreshing = false');
    }, [loadFeed, loadNotifications, loadTrending, loadStreak]);

    // ─── Avatar → Profile tab ───
    const handleAvatarPress = useCallback(() => {
        router.push('/(tabs)/profile');
    }, [router]);

    // ─── Streak modal ───
    const handleStreakPress = useCallback(() => {
        setStreakVisible(true);
    }, []);

    // ─── Comments ───
    const handleOpenComments = useCallback((post) => {
        setCommentPost(post);
        loadComments(post.id);
    }, [loadComments]);

    const handleSendComment = useCallback(async (content) => {
        if (!commentPost) return false;
        return await addComment(commentPost.id, content);
    }, [commentPost, addComment]);

    // ─── Share ───
    const handleShare = useCallback(async (post) => {
        try {
            const message = generateShareMessage(post);
            await Share.share({ message, title: `EcoSphere — ${post.actionLabel}` });
            incrementShareCount(post.id);
        } catch (e) {
            // User cancelled
        }
    }, [incrementShareCount]);

    // ─── Notifications ───
    const handleNotifPress = useCallback(() => {
        setNotifVisible(true);
        loadNotifications();
    }, [loadNotifications]);

    const handleNotifRead = useCallback((notif) => {
        markRead(notif.id);
    }, [markRead]);

    // ─── Trending press ───
    const handleTrendingPress = useCallback(() => {
        // In real app: navigate to trending/community detail
        impactAsync();
    }, []);

    // ─── List components ───
    const ListHeader = useCallback(() => (
        <>
            <FeedHeader
                unreadCount={unreadCount}
                onNotifPress={handleNotifPress}
                onStreakPress={handleStreakPress}
                onAvatarPress={handleAvatarPress}
                streakData={streakData}
            />
            <TrendingSection trending={trendingData} onPress={handleTrendingPress} />
            {feedError && <ErrorBanner message={feedError} onRetry={loadFeed} />}
            <View className="flex-row items-center gap-2 px-5 mb-3">
                <TreePine size={14} color="#64748b" />
                <Text className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Your Feed</Text>
            </View>
        </>
    ), [unreadCount, handleNotifPress, handleStreakPress, handleAvatarPress, streakData, trendingData, feedError, loadFeed, handleTrendingPress]);

    // ─── Render post ───
    const renderPost = useCallback(({ item }) => (
        <PostCard
            post={item}
            onLike={toggleLike}
            onComment={handleOpenComments}
            onShare={handleShare}
            isSaved={savedPostIds.has(item.id)}
            onToggleSave={toggleSavePost}
        />
    ), [toggleLike, handleOpenComments, handleShare, savedPostIds, toggleSavePost]);

    const keyExtractor = useCallback(item => item.id, []);

    if (feedLoading) {
        return (
            <SafeAreaView className="flex-1 bg-gray-900" edges={['top']}>
                <FeedHeader unreadCount={0} onNotifPress={() => { }} onStreakPress={() => { }} onAvatarPress={() => { }} streakData={null} />
                <SkeletonFeed />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-900" edges={['top']}>
            <FlatList
                data={posts}
                keyExtractor={keyExtractor}
                renderItem={renderPost}
                ListHeaderComponent={ListHeader}
                ListEmptyComponent={EmptyState}
                contentContainerStyle={{ paddingBottom: 100, paddingTop: 4 }}
                showsVerticalScrollIndicator={false}
                onEndReached={loadMorePosts}
                onEndReachedThreshold={0.5}
                removeClippedSubviews={true}
                maxToRenderPerBatch={5}
                windowSize={7}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                bounces={true}
                alwaysBounceVertical={true}
                overScrollMode="always"
            />

            {/* Leaf refresh overlay — OUTSIDE FlatList, absolute positioned */}
            <LeafRefreshIndicator active={isRefreshing} onComplete={handleRefreshComplete} />

            {/* Comment Sheet */}
            <CommentSheet
                visible={!!commentPost}
                onClose={() => setCommentPost(null)}
                post={commentPost}
                comments={commentPost ? (comments[commentPost.id] || []) : []}
                loading={commentPost ? !!commentsLoading[commentPost.id] : false}
                sending={commentSending}
                error={commentError}
                onSend={handleSendComment}
                onDelete={removeComment}
            />

            {/* Notification Sheet */}
            <NotificationSheet
                visible={notifVisible}
                onClose={() => setNotifVisible(false)}
                notifications={notifications}
                loading={notificationsLoading}
                unreadCount={unreadCount}
                onRead={handleNotifRead}
                onMarkAllRead={markAllRead}
                onRefresh={loadNotifications}
            />

            {/* Streak Sheet */}
            <StreakSheet
                visible={streakVisible}
                onClose={() => setStreakVisible(false)}
                streak={streakData || {
                    current: CURRENT_USER.streakCount,
                    goal: CURRENT_USER.streakGoal,
                    lastActionDate: CURRENT_USER.lastActionDate,
                    graceHours: CURRENT_USER.graceHours,
                }}
            />
        </SafeAreaView>
    );
}
