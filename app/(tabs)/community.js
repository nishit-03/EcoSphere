import { View, Text, ScrollView, TouchableOpacity, TextInput, FlatList, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Card } from '../../components/Card';
import { Avatar } from '../../components/Avatar';
import {
    Trophy, Users, Clock, Target, ChevronRight, CheckCircle,
    Calendar, MapPin, MessageCircle, Send, Sparkles, Award
} from 'lucide-react-native';
import {
    fetchUserCommunity, fetchCommunityDetails, fetchLeaderboard,
    fetchCommunityTasks, completeTask, fetchCommunityEvents, rsvpEvent,
    fetchCommunityMessages, sendCommunityMessage, subscribeToCommunityChat
} from '../../utils/api';
import { impactAsync } from '../../utils/haptics';

// ─── Time helpers ───
function timeAgo(iso) {
    if (!iso) return '';
    const diff = (Date.now() - new Date(iso).getTime()) / 1000;
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

function formatDate(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function timeLeft(iso) {
    if (!iso) return '';
    const diff = (new Date(iso).getTime() - Date.now()) / 1000;
    if (diff <= 0) return 'Expired';
    if (diff < 3600) return `${Math.floor(diff / 60)}m left`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h left`;
    return `${Math.floor(diff / 86400)}d left`;
}

// ─── Section Header ───
function SectionHeader({ icon: Icon, iconColor, title, badge }) {
    return (
        <View className="flex-row items-center justify-between mb-4 px-1">
            <View className="flex-row items-center gap-2">
                <Icon size={18} color={iconColor} />
                <Text className="text-white font-bold text-lg">{title}</Text>
            </View>
            {badge && (
                <View className="bg-teal-500/20 px-2.5 py-0.5 rounded-full">
                    <Text className="text-teal-400 text-xs font-bold">{badge}</Text>
                </View>
            )}
        </View>
    );
}

// ─── Leaderboard Section ───
function LeaderboardSection({ data, loading }) {
    if (loading) return <ActivityIndicator color="#2dd4bf" style={{ marginVertical: 20 }} />;
    if (!data?.length) return null;

    // Podium: top 3
    const top3 = data.slice(0, 3);
    const rest = data.slice(3);

    const podiumOrder = top3.length >= 3 ? [top3[1], top3[0], top3[2]] : top3;
    const podiumSizes = top3.length >= 3 ? ['sm', 'default', 'sm'] : top3.map(() => 'sm');
    const podiumColors = ['#94a3b8', '#fbbf24', '#cd7f32'];
    const podiumBorders = ['border-slate-500', 'border-yellow-500', 'border-orange-700'];

    return (
        <View className="mb-8">
            <SectionHeader icon={Trophy} iconColor="#fbbf24" title="Leaderboard" badge={`${data.length} members`} />
            <Card className="p-0 border-0 bg-slate-800 overflow-hidden">
                {/* Podium */}
                <View className="flex-row items-end justify-center pb-5 pt-4 px-4 gap-6">
                    {podiumOrder.map((user, i) => {
                        const isCenter = i === 1 && top3.length >= 3;
                        const avatarSize = isCenter ? 'default' : 'sm';
                        const borderColor = isCenter ? 'border-yellow-500' : i === 0 ? 'border-slate-500' : 'border-orange-700';
                        return (
                            <View key={user.userId} className="items-center" style={isCenter ? { position: 'relative', top: -8 } : {}}>
                                {isCenter && <View className="absolute" style={{ top: -24 }}><Text className="text-xl">👑</Text></View>}
                                <Avatar size={avatarSize} fallback={(user.name || 'E')[0]} className={`mb-2 border-2 ${borderColor}`} />
                                <Text className={`font-bold text-xs mb-0.5 ${isCenter ? 'text-white' : 'text-slate-300'}`} numberOfLines={1}>
                                    {user.name}
                                </Text>
                                <View className={`px-2 py-0.5 rounded-full ${isCenter ? 'bg-yellow-500' : 'bg-slate-700'}`}>
                                    <Text className={`text-[10px] font-bold ${isCenter ? 'text-yellow-950' : 'text-slate-400'}`}>
                                        {user.totalCo2}kg CO₂
                                    </Text>
                                </View>
                            </View>
                        );
                    })}
                </View>

                {/* Remaining ranks */}
                {rest.length > 0 && (
                    <View className="border-t border-slate-700/50">
                        {rest.map(user => (
                            <View key={user.userId} className="flex-row items-center px-4 py-3 border-b border-slate-700/30">
                                <Text className="text-slate-500 font-bold text-sm w-8">{user.rank}</Text>
                                <Avatar size="xs" fallback={(user.name || 'E')[0]} />
                                <Text className="text-white font-medium text-sm flex-1 ml-3" numberOfLines={1}>{user.name}</Text>
                                <Text className="text-teal-400 font-bold text-xs">{user.totalCo2}kg</Text>
                            </View>
                        ))}
                    </View>
                )}
            </Card>
        </View>
    );
}

// ─── Tasks Section ───
function TasksSection({ data, loading, onComplete }) {
    if (loading) return <ActivityIndicator color="#2dd4bf" style={{ marginVertical: 20 }} />;
    if (!data?.length) return null;

    return (
        <View className="mb-8">
            <SectionHeader icon={Target} iconColor="#f97316" title="Tasks" badge={`${data.filter(t => !t.isCompleted).length} active`} />
            <View className="gap-3">
                {data.map(task => (
                    <Card key={task.id} className="p-4 border-0 bg-slate-800">
                        <View className="flex-row items-start justify-between">
                            <View className="flex-1 mr-3">
                                <Text className="text-white font-bold text-base mb-1">{task.title}</Text>
                                <Text className="text-slate-400 text-xs mb-2" numberOfLines={2}>{task.description}</Text>
                                <View className="flex-row items-center gap-3">
                                    <View className="flex-row items-center gap-1">
                                        <Sparkles size={12} color="#fbbf24" />
                                        <Text className="text-yellow-500 text-xs font-bold">{task.points} pts</Text>
                                    </View>
                                    <View className="flex-row items-center gap-1">
                                        <Clock size={12} color={timeLeft(task.deadline) === 'Expired' ? '#ef4444' : '#64748b'} />
                                        <Text className={`text-xs font-medium ${timeLeft(task.deadline) === 'Expired' ? 'text-red-400' : 'text-slate-500'}`}>
                                            {timeLeft(task.deadline)}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                            {task.isCompleted ? (
                                <View className="bg-teal-500/20 rounded-xl px-3 py-2 items-center">
                                    <CheckCircle size={20} color="#2dd4bf" />
                                    <Text className="text-teal-400 text-[10px] font-bold mt-0.5">Done</Text>
                                </View>
                            ) : (
                                <TouchableOpacity
                                    className="bg-teal-500 rounded-xl px-4 py-2.5 active:bg-teal-600"
                                    onPress={() => onComplete(task.id)}
                                >
                                    <Text className="text-white font-bold text-xs">Complete</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </Card>
                ))}
            </View>
        </View>
    );
}

// ─── Events Section ───
function EventsSection({ data, loading, onRsvp }) {
    if (loading) return <ActivityIndicator color="#2dd4bf" style={{ marginVertical: 20 }} />;
    if (!data?.length) return null;

    return (
        <View className="mb-8">
            <SectionHeader icon={Calendar} iconColor="#ec4899" title="Events" badge={`${data.length} upcoming`} />
            <View className="gap-3">
                {data.map(event => (
                    <Card key={event.id} className="p-4 border-0 bg-slate-800">
                        <Text className="text-white font-bold text-base mb-1">{event.title}</Text>
                        <Text className="text-slate-400 text-xs mb-3" numberOfLines={2}>{event.description}</Text>
                        <View className="flex-row items-center justify-between">
                            <View>
                                <View className="flex-row items-center gap-1 mb-1">
                                    <MapPin size={12} color="#64748b" />
                                    <Text className="text-slate-500 text-xs font-medium" numberOfLines={1}>{event.location}</Text>
                                </View>
                                <View className="flex-row items-center gap-1">
                                    <Calendar size={12} color="#64748b" />
                                    <Text className="text-slate-500 text-xs font-medium">{formatDate(event.eventDate)}</Text>
                                </View>
                            </View>
                            <TouchableOpacity
                                className={`rounded-xl px-4 py-2.5 ${event.isRsvpd ? 'bg-teal-500/20 border border-teal-500/30' : 'bg-teal-500'}`}
                                onPress={() => onRsvp(event.id)}
                            >
                                <Text className={`font-bold text-xs ${event.isRsvpd ? 'text-teal-400' : 'text-white'}`}>
                                    {event.isRsvpd ? 'RSVP\'d ✓' : 'RSVP'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </Card>
                ))}
            </View>
        </View>
    );
}

// ─── Chat Message ───
function ChatMessage({ message, isOwn }) {
    return (
        <View className={`flex-row gap-2 mb-3 ${isOwn ? 'flex-row-reverse' : ''}`}>
            {!isOwn && <Avatar size="xs" fallback={(message.userName || 'E')[0]} />}
            <View className={`max-w-[75%] ${isOwn ? 'bg-teal-600/30 border border-teal-500/20' : 'bg-slate-700/80'} rounded-2xl px-3 py-2`}>
                {!isOwn && <Text className="text-teal-400 text-[10px] font-bold mb-0.5">{message.userName}</Text>}
                <Text className="text-white text-sm">{message.content}</Text>
                <Text className="text-slate-500 text-[9px] mt-0.5">{timeAgo(message.createdAt)}</Text>
            </View>
        </View>
    );
}

// ─── Chat Section ───
function ChatSection({ communityId, currentUserId }) {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [text, setText] = useState('');
    const [sending, setSending] = useState(false);
    const flatListRef = useRef(null);

    // Load initial messages
    useEffect(() => {
        if (!communityId) return;
        setLoading(true);
        fetchCommunityMessages(communityId)
            .then(msgs => {
                setMessages(msgs);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [communityId]);

    // Subscribe to realtime
    useEffect(() => {
        if (!communityId) return;
        const unsubscribe = subscribeToCommunityChat(communityId, (newMsg) => {
            setMessages(prev => {
                // Avoid duplicates
                if (prev.find(m => m.id === newMsg.id)) return prev;
                return [...prev, newMsg];
            });
            setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
        });
        return () => unsubscribe();
    }, [communityId]);

    const handleSend = useCallback(async () => {
        if (!text.trim() || sending) return;
        impactAsync();
        setSending(true);
        try {
            const msg = await sendCommunityMessage(communityId, text.trim());
            setMessages(prev => {
                if (prev.find(m => m.id === msg.id)) return prev;
                return [...prev, msg];
            });
            setText('');
            setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
        } catch (e) {
            console.warn('Send error:', e.message);
        } finally {
            setSending(false);
        }
    }, [communityId, text, sending]);

    return (
        <View className="mb-8">
            <SectionHeader icon={MessageCircle} iconColor="#60a5fa" title="Community Chat" badge="Live" />
            <Card className="p-0 border-0 bg-slate-800 overflow-hidden" style={{ height: 340 }}>
                {loading ? (
                    <View className="flex-1 items-center justify-center p-4">
                        <ActivityIndicator color="#2dd4bf" />
                    </View>
                ) : (
                    <FlatList
                        ref={flatListRef}
                        data={messages}
                        keyExtractor={item => item.id}
                        renderItem={({ item }) => (
                            <ChatMessage message={item} isOwn={item.userId === currentUserId} />
                        )}
                        contentContainerStyle={{ padding: 12, flexGrow: 1, justifyContent: messages.length === 0 ? 'center' : 'flex-end' }}
                        ListEmptyComponent={
                            <Text className="text-slate-500 text-center text-sm">No messages yet. Say hello! 👋</Text>
                        }
                        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
                        showsVerticalScrollIndicator={false}
                    />
                )}
                {/* Input */}
                <View className="flex-row items-end gap-2 px-3 py-2.5 border-t border-slate-700/50 bg-slate-900/80">
                    <TextInput
                        className="flex-1 bg-slate-800 rounded-2xl px-4 py-2.5 text-white text-sm border border-slate-700/50"
                        placeholder="Type a message..."
                        placeholderTextColor="#475569"
                        value={text}
                        onChangeText={setText}
                        multiline
                        maxLength={500}
                    />
                    <TouchableOpacity
                        className={`w-10 h-10 rounded-full items-center justify-center ${text.trim() ? 'bg-teal-500' : 'bg-slate-700'}`}
                        onPress={handleSend}
                        disabled={!text.trim() || sending}
                    >
                        {sending ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Send size={16} color={text.trim() ? '#fff' : '#64748b'} />
                        )}
                    </TouchableOpacity>
                </View>
            </Card>
        </View>
    );
}

// ═════════════════════════════════════════════════
// MAIN COMMUNITY SCREEN
// ═════════════════════════════════════════════════
export default function Community() {
    const [communityId, setCommunityId] = useState(null);
    const [details, setDetails] = useState(null);
    const [leaderboard, setLeaderboard] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [events, setEvents] = useState([]);
    const [currentUserId, setCurrentUserId] = useState(null);

    const [loading, setLoading] = useState(true);
    const [leaderboardLoading, setLeaderboardLoading] = useState(true);
    const [tasksLoading, setTasksLoading] = useState(true);
    const [eventsLoading, setEventsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadCommunity();
    }, []);

    const loadCommunity = async () => {
        try {
            setLoading(true);
            setError(null);

            // Get current user's community
            const { supabase } = require('../../utils/supabase');
            const { data: { user } } = await supabase.auth.getUser();
            setCurrentUserId(user?.id || null);

            let cId = await fetchUserCommunity();
            if (!cId) {
                // Default to first community
                const { data: comms } = await supabase.from('communities').select('id').limit(1).single();
                cId = comms?.id;
            }
            if (!cId) {
                setError('No community found');
                setLoading(false);
                return;
            }

            setCommunityId(cId);

            // Load details
            const detail = await fetchCommunityDetails(cId);
            setDetails(detail);
            setLoading(false);

            // Load sections in parallel
            setLeaderboardLoading(true);
            setTasksLoading(true);
            setEventsLoading(true);

            fetchLeaderboard(cId).then(lb => { setLeaderboard(lb); setLeaderboardLoading(false); }).catch(() => setLeaderboardLoading(false));
            fetchCommunityTasks(cId).then(t => { setTasks(t); setTasksLoading(false); }).catch(() => setTasksLoading(false));
            fetchCommunityEvents(cId).then(e => { setEvents(e); setEventsLoading(false); }).catch(() => setEventsLoading(false));

        } catch (e) {
            console.warn('Community load error:', e.message);
            setError('Failed to load community');
            setLoading(false);
        }
    };

    const handleCompleteTask = useCallback(async (taskId) => {
        impactAsync();
        const result = await completeTask(taskId);
        if (result.success) {
            setTasks(prev => prev.map(t => t.id === taskId ? { ...t, isCompleted: true } : t));
        }
    }, []);

    const handleRsvp = useCallback(async (eventId) => {
        impactAsync();
        const result = await rsvpEvent(eventId);
        if (result.success) {
            setEvents(prev => prev.map(e => e.id === eventId ? { ...e, isRsvpd: result.rsvpd } : e));
        }
    }, []);

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-gray-900 items-center justify-center" edges={['top']}>
                <ActivityIndicator size="large" color="#2dd4bf" />
                <Text className="text-slate-500 text-sm mt-3">Loading community...</Text>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView className="flex-1 bg-gray-900 items-center justify-center" edges={['top']}>
                <Text className="text-slate-400 text-base mb-3">{error}</Text>
                <TouchableOpacity className="bg-teal-500 px-6 py-3 rounded-xl" onPress={loadCommunity}>
                    <Text className="text-white font-bold">Retry</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-900" edges={['top']}>
            {/* Header */}
            <View className="px-6 py-4 flex-row items-center justify-between bg-slate-900/80 border-b border-slate-800">
                <View>
                    <Text className="text-xl font-bold text-teal-400 tracking-tight">{details?.name || 'Community'}</Text>
                    <Text className="text-xs text-slate-500 font-medium">
                        {details?.memberCount || 0} members · {details?.type || 'community'}
                    </Text>
                </View>
                <TouchableOpacity className="border border-slate-700 rounded-full p-1">
                    <Avatar size="sm" fallback="ME" />
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100, paddingTop: 20 }} keyboardShouldPersistTaps="handled">
                    <View className="px-4">
                        {/* Description */}
                        {details?.description ? (
                            <View className="mb-6 px-1">
                                <Text className="text-slate-400 text-sm leading-5">{details.description}</Text>
                            </View>
                        ) : null}

                        {/* Leaderboard */}
                        <LeaderboardSection data={leaderboard} loading={leaderboardLoading} />

                        {/* Tasks */}
                        <TasksSection data={tasks} loading={tasksLoading} onComplete={handleCompleteTask} />

                        {/* Events */}
                        <EventsSection data={events} loading={eventsLoading} onRsvp={handleRsvp} />

                        {/* Chat */}
                        <ChatSection communityId={communityId} currentUserId={currentUserId} />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
