import { View, Text, Modal, TouchableOpacity, FlatList, TextInput, KeyboardAvoidingView, Platform, Animated, Easing } from 'react-native';
import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Send, Trash2, AlertTriangle, Heart } from 'lucide-react-native';
import { Avatar } from './Avatar';
import { CURRENT_USER } from '../utils/mockData';
import { impactAsync } from '../utils/haptics';

function timeAgo(dateStr) {
    const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return 'Yesterday';
    return `${days}d ago`;
}

// ─── Skeleton Loader for Comments ───
function CommentSkeleton() {
    const opacity = useRef(new Animated.Value(0.3)).current;
    useEffect(() => {
        const anim = Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, { toValue: 0.7, duration: 800, useNativeDriver: true }),
                Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
            ])
        );
        anim.start();
        return () => anim.stop();
    }, []);

    return (
        <View className="px-4 py-3 gap-3">
            {[1, 2, 3, 4].map(i => (
                <Animated.View key={i} style={{ opacity }} className="flex-row gap-3">
                    <View className="w-6 h-6 rounded-full bg-slate-700" />
                    <View className="flex-1 gap-1.5">
                        <View className="w-24 h-3 bg-slate-700 rounded-full" />
                        <View className="w-full h-3 bg-slate-700/60 rounded-full" />
                        <View className="w-2/3 h-3 bg-slate-700/40 rounded-full" />
                    </View>
                </Animated.View>
            ))}
        </View>
    );
}

// ─── Comment Item with like animation ───
function CommentItem({ comment, onDelete, isLast }) {
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(comment.likes || 0);
    const heartScale = useRef(new Animated.Value(1)).current;
    const isOwn = comment.userId === CURRENT_USER.id;

    const handleLike = useCallback(() => {
        impactAsync();
        setLiked(prev => {
            const next = !prev;
            setLikeCount(c => next ? c + 1 : c - 1);
            // Micro-animation: heart bounce
            Animated.sequence([
                Animated.timing(heartScale, { toValue: 1.4, duration: 120, easing: Easing.out(Easing.quad), useNativeDriver: true }),
                Animated.spring(heartScale, { toValue: 1, friction: 4, tension: 100, useNativeDriver: true }),
            ]).start();
            return next;
        });
    }, []);

    return (
        <View>
            <View className="flex-row px-4 py-3 gap-3">
                <Avatar source={comment.userAvatar ? { uri: comment.userAvatar } : undefined} size="xs" fallback={comment.userName?.[0]} />
                <View className="flex-1">
                    <View className="flex-row items-center gap-2">
                        <Text className="text-white font-bold text-[13px]">{comment.userName}</Text>
                        <Text className="text-slate-600 text-[11px]">{timeAgo(comment.createdAt)}</Text>
                    </View>
                    <Text className="text-slate-300 text-[13px] leading-5 mt-0.5">{comment.content}</Text>
                    {comment.aiModerationFlag && (
                        <View className="flex-row items-center gap-1 mt-1">
                            <AlertTriangle size={10} color="#f59e0b" />
                            <Text className="text-amber-400 text-[10px]">Flagged for review</Text>
                        </View>
                    )}
                </View>
                <View className="items-center justify-center gap-1">
                    <TouchableOpacity onPress={handleLike} activeOpacity={0.6}>
                        <Animated.View style={{ transform: [{ scale: heartScale }] }}>
                            <Heart size={14} color={liked ? '#ef4444' : '#475569'} fill={liked ? '#ef4444' : 'none'} />
                        </Animated.View>
                    </TouchableOpacity>
                    <Text className={`text-[10px] font-medium ${liked ? 'text-red-400' : 'text-slate-600'}`}>{likeCount}</Text>
                </View>
                {isOwn && (
                    <TouchableOpacity onPress={() => onDelete(comment.id)} className="p-1 self-center">
                        <Trash2 size={14} color="#64748b" />
                    </TouchableOpacity>
                )}
            </View>
            {/* Subtle divider */}
            {!isLast && <View className="mx-4 ml-13 h-px bg-slate-800/60" style={{ marginLeft: 42 }} />}
        </View>
    );
}

export function CommentSheet({ visible, onClose, post, comments = [], loading, sending, error, onSend, onDelete }) {
    const [text, setText] = useState('');
    const [inputFocused, setInputFocused] = useState(false);
    const inputRef = useRef(null);
    const listRef = useRef(null);
    const bgOpacity = useRef(new Animated.Value(0)).current;

    // Background fade in
    useEffect(() => {
        if (visible) {
            setText('');
            Animated.timing(bgOpacity, { toValue: 1, duration: 300, useNativeDriver: true }).start();
        } else {
            bgOpacity.setValue(0);
        }
    }, [visible]);

    // Auto-scroll to bottom when new comment arrives
    useEffect(() => {
        if (comments.length > 0 && listRef.current) {
            setTimeout(() => {
                listRef.current?.scrollToEnd?.({ animated: true });
            }, 200);
        }
    }, [comments.length]);

    const handleSend = async () => {
        const content = text.trim();
        if (!content || sending) return;
        const ok = await onSend(content);
        if (ok) {
            setText('');
            setTimeout(() => listRef.current?.scrollToEnd?.({ animated: true }), 300);
        }
    };

    const commentCount = comments.length || post?.commentsCount || 0;

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            {/* Blurred background */}
            <Animated.View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', opacity: bgOpacity }}>
                <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
            </Animated.View>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                className="bg-slate-900 rounded-t-3xl border-t border-slate-700/50"
                style={{ maxHeight: '75%' }}
            >
                {/* Handle bar */}
                <View className="items-center pt-3 pb-1">
                    <View className="w-10 h-1 bg-slate-700 rounded-full" />
                </View>

                {/* Header */}
                <View className="flex-row items-center justify-between px-5 py-3 border-b border-slate-800">
                    <Text className="text-white font-bold text-base">
                        Comments{commentCount > 0 ? ` (${commentCount})` : ''}
                    </Text>
                    <TouchableOpacity onPress={onClose} className="p-1">
                        <X size={22} color="#94a3b8" />
                    </TouchableOpacity>
                </View>

                {/* Post preview */}
                {post && (
                    <View className="flex-row items-center gap-3 px-5 py-3 bg-slate-800/50 border-b border-slate-800">
                        <Avatar source={{ uri: post.user?.avatar }} size="xs" fallback={post.user?.name?.[0]} />
                        <View className="flex-1">
                            <Text className="text-white text-xs font-bold">{post.user?.name}</Text>
                            <Text className="text-slate-400 text-[11px]" numberOfLines={1}>{post.caption}</Text>
                        </View>
                    </View>
                )}

                {/* Comment list */}
                {loading ? (
                    <CommentSkeleton />
                ) : comments.length === 0 ? (
                    <View className="items-center justify-center py-12">
                        <Text className="text-3xl mb-2">💬</Text>
                        <Text className="text-slate-400 text-sm">No comments yet. Be the first!</Text>
                    </View>
                ) : (
                    <FlatList
                        ref={listRef}
                        data={comments}
                        keyExtractor={item => item.id}
                        renderItem={({ item, index }) => (
                            <CommentItem
                                comment={item}
                                onDelete={(cid) => onDelete(post.id, cid)}
                                isLast={index === comments.length - 1}
                            />
                        )}
                        style={{ maxHeight: 340 }}
                        showsVerticalScrollIndicator={false}
                        onContentSizeChange={() => {
                            listRef.current?.scrollToEnd?.({ animated: false });
                        }}
                    />
                )}

                {/* Error banner */}
                {error && (
                    <View className="flex-row items-center gap-2 px-5 py-2 bg-amber-500/10 border-t border-amber-500/20">
                        <AlertTriangle size={14} color="#f59e0b" />
                        <Text className="text-amber-400 text-xs flex-1">{error}</Text>
                    </View>
                )}

                {/* Input bar with glow effect */}
                <View className="flex-row items-end gap-2 px-4 py-3 border-t border-slate-800 bg-slate-900">
                    <Avatar size="xs" fallback={CURRENT_USER.name[0]} />
                    <View className={`flex-1 rounded-2xl border ${inputFocused ? 'border-teal-500/50 shadow-lg shadow-teal-500/10' : 'border-slate-700/50'}`}
                        style={inputFocused ? { shadowColor: '#2dd4bf', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.15, shadowRadius: 8 } : {}}>
                        <TextInput
                            ref={inputRef}
                            className="bg-slate-800 rounded-2xl px-4 py-2.5 text-white text-sm"
                            placeholder="Add a comment..."
                            placeholderTextColor="#64748b"
                            value={text}
                            onChangeText={setText}
                            multiline={true}
                            maxLength={500}
                            style={{ maxHeight: 80 }}
                            returnKeyType="default"
                            onFocus={() => setInputFocused(true)}
                            onBlur={() => setInputFocused(false)}
                            editable={!sending}
                        />
                    </View>
                    <TouchableOpacity
                        onPress={handleSend}
                        disabled={!text.trim() || sending}
                        className={`w-9 h-9 rounded-full items-center justify-center mb-0.5 ${text.trim() ? 'bg-teal-500' : 'bg-slate-700'}`}
                    >
                        {sending ? (
                            <Text className="text-white text-xs">⏳</Text>
                        ) : (
                            <Send size={16} color="white" />
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}
