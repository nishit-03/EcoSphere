import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar } from '../../components/Avatar';
import { Badge } from '../../components/Badge';
import { Settings, Share2, Award, Flame, Shield, ChevronRight } from 'lucide-react-native';

const BADGES = [
    { id: '1', name: 'Early Adopter', icon: '🚀', locked: false },
    { id: '2', name: 'Tree Hugger', icon: '🌳', locked: false },
    { id: '3', name: 'Cyclist Pro', icon: '🚲', locked: true },
    { id: '4', name: 'Ocean Savior', icon: '🌊', locked: true },
];

const STATS = [
    { label: 'Actions', value: '128' },
    { label: 'CO2 Saved', value: '42kg' },
    { label: 'Day Streak', value: '12', hasFlame: true },
];

export default function Profile() {
    return (
        <SafeAreaView className="flex-1 bg-gray-900" edges={['top']}>
            <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
                {/* Header */}
                <View className="bg-slate-800/50 pb-6 pt-2 px-6 border-b border-slate-700/50">
                    <View className="flex-row justify-between items-center mb-6">
                        <TouchableOpacity>
                            <Share2 size={24} color="#64748b" />
                        </TouchableOpacity>
                        <TouchableOpacity>
                            <Settings size={24} color="#64748b" />
                        </TouchableOpacity>
                    </View>

                    <View className="items-center mb-6">
                        <View className="border-4 border-teal-500 rounded-full p-1 mb-3">
                            <Avatar size="xl" fallback="ME" />
                        </View>
                        <Text className="text-2xl font-bold text-white">Jessica Doe</Text>
                        <Text className="text-teal-400 font-medium">Eco-Warrior Level 5</Text>
                    </View>

                    {/* Stats Row - Strava-inspired prominent stats */}
                    <View className="flex-row justify-between bg-slate-700/50 p-4 rounded-2xl border border-slate-600/30">
                        {STATS.map((stat, index) => (
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
                    {/* Your Progress - Strava style */}
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
                            <Text className="text-2xl font-black text-teal-400">98</Text>
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
