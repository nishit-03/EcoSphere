import { View, Text, Modal, TouchableOpacity, FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import { X, Heart, MessageCircle, Trophy, Shield, Bell, CheckCheck, ChevronRight } from 'lucide-react-native';

const NOTIF_ICONS = {
    like: { icon: Heart, color: '#ef4444', bg: 'bg-red-500/15' },
    comment: { icon: MessageCircle, color: '#60a5fa', bg: 'bg-blue-500/15' },
    badge: { icon: Trophy, color: '#f59e0b', bg: 'bg-amber-500/15' },
    challenge: { icon: Bell, color: '#a78bfa', bg: 'bg-purple-500/15' },
    verification: { icon: Shield, color: '#34d399', bg: 'bg-emerald-500/15' },
};

function timeAgo(dateStr) {
    const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
}

function NotifItem({ notif, onPress }) {
    const config = NOTIF_ICONS[notif.type] || NOTIF_ICONS.like;
    const Icon = config.icon;
    return (
        <TouchableOpacity
            onPress={() => onPress(notif)}
            className={`flex-row items-center gap-3 px-5 py-3.5 ${!notif.isRead ? 'bg-slate-800/50' : ''} active:bg-slate-800/80`}
        >
            <View className={`w-10 h-10 rounded-full items-center justify-center ${config.bg}`}>
                <Icon size={18} color={config.color} />
            </View>
            <View className="flex-1">
                <Text className={`text-sm leading-5 ${notif.isRead ? 'text-slate-400' : 'text-white font-medium'}`}>
                    {notif.message}
                </Text>
                <Text className="text-slate-500 text-[11px] mt-0.5">{timeAgo(notif.createdAt)}</Text>
            </View>
            {!notif.isRead && <View className="w-2.5 h-2.5 bg-teal-500 rounded-full" />}
        </TouchableOpacity>
    );
}

export function NotificationSheet({ visible, onClose, notifications = [], loading, unreadCount, onRead, onMarkAllRead, onRefresh }) {
    return (
        <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
            <View className="flex-1 bg-black/60" onTouchEnd={onClose} />
            <View className="bg-slate-900 rounded-t-3xl border-t border-slate-700/50" style={{ maxHeight: '80%' }}>
                {/* Handle */}
                <View className="items-center pt-3 pb-1">
                    <View className="w-10 h-1 bg-slate-700 rounded-full" />
                </View>

                {/* Header */}
                <View className="flex-row items-center justify-between px-5 py-3 border-b border-slate-800">
                    <View className="flex-row items-center gap-2">
                        <Text className="text-white font-bold text-base">Notifications</Text>
                        {unreadCount > 0 && (
                            <View className="bg-teal-500 px-2 py-0.5 rounded-full">
                                <Text className="text-white text-[10px] font-bold">{unreadCount}</Text>
                            </View>
                        )}
                    </View>
                    <View className="flex-row items-center gap-3">
                        {unreadCount > 0 && (
                            <TouchableOpacity onPress={onMarkAllRead} className="flex-row items-center gap-1">
                                <CheckCheck size={16} color="#2dd4bf" />
                                <Text className="text-teal-400 text-xs font-medium">Read all</Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity onPress={onClose} className="p-1">
                            <X size={22} color="#94a3b8" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* List */}
                {loading ? (
                    <View className="items-center justify-center py-12">
                        <ActivityIndicator size="small" color="#2dd4bf" />
                    </View>
                ) : notifications.length === 0 ? (
                    <View className="items-center justify-center py-16">
                        <Text className="text-4xl mb-3">🔔</Text>
                        <Text className="text-white font-bold text-lg mb-1">All caught up!</Text>
                        <Text className="text-slate-400 text-sm">No notifications yet.</Text>
                    </View>
                ) : (
                    <FlatList
                        data={notifications}
                        keyExtractor={item => item.id}
                        renderItem={({ item }) => <NotifItem notif={item} onPress={onRead} />}
                        style={{ maxHeight: 500 }}
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl
                                refreshing={false}
                                onRefresh={onRefresh}
                                tintColor="#2dd4bf"
                                progressBackgroundColor="#1e293b"
                            />
                        }
                    />
                )}
            </View>
        </Modal>
    );
}
