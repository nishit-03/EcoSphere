import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar } from '../../components/Avatar';
import { Settings, Share2, Award, Flame, Shield, ChevronRight, LogOut } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabase';

const BADGES = [
    { id: '1', name: 'Early Adopter', icon: '🚀', locked: false },
    { id: '2', name: 'Tree Hugger', icon: '🌳', locked: false },
    { id: '3', name: 'Cyclist Pro', icon: '🚲', locked: true },
    { id: '4', name: 'Ocean Savior', icon: '🌊', locked: true },
];

export default function Profile() {
    const [profile, setProfile] = useState(null);
    const [stats, setStats] = useState({ actions: 0, co2: 0, streak: 0, trustScore: 50 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data } = await supabase
                .from('users')
                .select('name, email, profile_image_url, trust_score, streak_count, total_points')
                .eq('id', user.id)
                .single();

            // Count posts and total CO2
            const { data: postStats } = await supabase
                .from('posts')
                .select('co2_saved')
                .eq('user_id', user.id)
                .eq('ai_verification_status', 'verified');

            const totalCo2 = (postStats || []).reduce((s, p) => s + (p.co2_saved || 0), 0);

            setProfile(data || { name: user.email?.split('@')[0] || 'EcoUser', email: user.email });
            setStats({
                actions: postStats?.length || 0,
                co2: totalCo2.toFixed(1),
                streak: data?.streak_count || 0,
                trustScore: data?.trust_score || 50,
            });
        } catch (e) {
            console.warn('Profile load error:', e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Sign Out', style: 'destructive',
                onPress: async () => {
                    await supabase.auth.signOut();
                    // Root layout listener will redirect to login
                },
            },
        ]);
    };

    const displayStats = [
        { label: 'Actions', value: String(stats.actions) },
        { label: 'CO₂ Saved', value: `${stats.co2}kg` },
        { label: 'Day Streak', value: String(stats.streak), hasFlame: true },
    ];

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-gray-900 items-center justify-center">
                <ActivityIndicator color="#2dd4bf" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-900" edges={['top']}>
            <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
                {/* Header */}
                <View className="bg-slate-800/50 pb-6 pt-2 px-6 border-b border-slate-700/50">
                    <View className="flex-row justify-between items-center mb-6">
                        <TouchableOpacity>
                            <Share2 size={24} color="#64748b" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleLogout}>
                            <LogOut size={24} color="#64748b" />
                        </TouchableOpacity>
                    </View>

                    <View className="items-center mb-6">
                        <View className="border-4 border-teal-500 rounded-full p-1 mb-3">
                            <Avatar size="xl" fallback={(profile?.name || 'E')[0].toUpperCase()} />
                        </View>
                        <Text className="text-2xl font-bold text-white">{profile?.name || 'EcoUser'}</Text>
                        <Text className="text-teal-400 font-medium">Eco-Warrior</Text>
                    </View>

                    {/* Stats Row */}
                    <View className="flex-row justify-between bg-slate-700/50 p-4 rounded-2xl border border-slate-600/30">
                        {displayStats.map((stat) => (
                            <View key={stat.label} className="items-center flex-1">
                                <View className="flex-row items-center">
                                    {stat.hasFlame && <Flame size={18} color="#f97316" fill="#f97316" />}
                                    <Text className="text-2xl font-black text-white">{stat.value}</Text>
                                </View>
                                <Text className="text-xs text-slate-400 uppercase font-medium tracking-wider">{stat.label}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Content */}
                <View className="p-6">
                    <TouchableOpacity className="flex-row items-center justify-between bg-slate-800 p-4 rounded-2xl mb-6 border border-slate-700/50 active:bg-slate-700">
                        <View className="flex-row items-center">
                            <View className="w-12 h-12 rounded-xl bg-teal-500/10 items-center justify-center mr-4 border border-teal-500/20">
                                <Shield size={24} color="#2dd4bf" />
                            </View>
                            <View>
                                <Text className="font-bold text-white text-base">Trust Score</Text>
                                <Text className="text-slate-400 text-xs">Your verified actions build trust</Text>
                            </View>
                        </View>
                        <View className="flex-row items-center gap-2">
                            <Text className="text-2xl font-black text-teal-400">{Math.round(stats.trustScore)}</Text>
                            <ChevronRight size={18} color="#475569" />
                        </View>
                    </TouchableOpacity>

                    <View className="flex-row items-center justify-between mb-4">
                        <Text className="text-lg font-bold text-white">Badges</Text>
                        <Text className="text-teal-400 font-medium text-sm">View All</Text>
                    </View>

                    <View className="flex-row flex-wrap gap-3">
                        {BADGES.map(badge => (
                            <View key={badge.id} className={`w-[48%] aspect-square rounded-2xl items-center justify-center mb-2 ${badge.locked ? 'bg-slate-800/50 opacity-40 border border-slate-700/30' : 'bg-slate-800 border border-slate-600/50'}`}>
                                <Text className="text-4xl mb-2">{badge.icon}</Text>
                                <Text className="font-bold text-slate-300">{badge.name}</Text>
                                {badge.locked && <View className="absolute inset-0 bg-slate-900/50 rounded-2xl items-center justify-center"><Text>🔒</Text></View>}
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
