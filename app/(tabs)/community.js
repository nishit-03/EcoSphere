import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Avatar } from '../../components/Avatar';
import { Trophy, Users, ArrowRight, Clock, Target, ChevronRight } from 'lucide-react-native';

const CHALLENGES = [
    { id: '1', title: 'Plastic-Free July', participants: '12.4k', timeLeft: '5 days', image: 'https://images.unsplash.com/photo-1526951521990-620dc14c214b?q=80&w=1000&auto=format&fit=crop', goal: 'Avoid single-use plastics' },
    { id: '2', title: 'Bike to Work Week', participants: '8.2k', timeLeft: '2 days', image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?q=80&w=1000&auto=format&fit=crop', goal: 'Ride 20km total' },
    { id: '3', title: 'Tree Planting Sprint', participants: '5.1k', timeLeft: '12 days', image: 'https://images.unsplash.com/photo-1542601906990-24d4c16419d7?q=80&w=1000&auto=format&fit=crop', goal: 'Plant 1,000 trees' },
];

const COMMUNITIES = [
    { id: '1', name: 'University of Green Tech', members: '1,204' },
    { id: '2', name: 'Downtown Cyclists', members: '856' },
    { id: '3', name: 'Ocean Guardians', members: '5,430' },
];

export default function Community() {
    return (
        <SafeAreaView className="flex-1 bg-gray-900" edges={['top']}>
            <View className="px-6 py-4 flex-row items-center justify-between bg-slate-900/80 border-b border-slate-800">
                <View>
                    <Text className="text-xl font-bold text-teal-400 tracking-tight">Community</Text>
                    <Text className="text-xs text-slate-500 font-medium">Connect & Compete</Text>
                </View>
                <TouchableOpacity className="border border-slate-700 rounded-full p-1">
                    <Avatar size="sm" fallback="ME" />
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100, paddingTop: 20 }}>
                <View className="px-4">

                    {/* Leaderboard */}
                    <Card className="mb-8 p-0 border-0 bg-slate-800 overflow-hidden">
                        <View className="p-4 flex-row justify-between items-center border-b border-slate-700/50">
                            <View className="flex-row items-center gap-2">
                                <Trophy color="#fbbf24" size={20} fill="#fbbf24" />
                                <Text className="text-white font-bold text-lg">Weekly Leaders</Text>
                            </View>
                            <TouchableOpacity>
                                <ArrowRight color="#64748b" size={20} />
                            </TouchableOpacity>
                        </View>

                        <View className="flex-row items-end justify-center pb-6 pt-4 px-4 gap-6">
                            {/* 2nd Place */}
                            <View className="items-center">
                                <Avatar size="sm" fallback="2" className="mb-2 border-2 border-slate-500 bg-slate-700" />
                                <Text className="text-slate-300 font-bold text-xs mb-0.5">@alex</Text>
                                <View className="bg-slate-700 px-2 py-0.5 rounded-full">
                                    <Text className="text-slate-400 text-[10px] font-bold">1250</Text>
                                </View>
                            </View>

                            {/* 1st Place */}
                            <View className="items-center relative -top-2">
                                <View className="absolute -top-6">
                                    <Text className="text-xl">👑</Text>
                                </View>
                                <Avatar size="default" fallback="1" className="mb-2 border-4 border-yellow-500 bg-yellow-900/30 w-16 h-16" />
                                <Text className="text-white font-bold text-sm mb-0.5">@sarah</Text>
                                <View className="bg-yellow-500 px-3 py-1 rounded-full">
                                    <Text className="text-yellow-950 text-xs font-black">1420 pts</Text>
                                </View>
                            </View>

                            {/* 3rd Place */}
                            <View className="items-center">
                                <Avatar size="sm" fallback="3" className="mb-2 border-2 border-slate-500 bg-slate-700" />
                                <Text className="text-slate-300 font-bold text-xs mb-0.5">@mike</Text>
                                <View className="bg-slate-700 px-2 py-0.5 rounded-full">
                                    <Text className="text-slate-400 text-[10px] font-bold">980</Text>
                                </View>
                            </View>
                        </View>
                    </Card>

                    {/* Active Challenges */}
                    <View className="flex-row items-center justify-between mb-4 px-2">
                        <Text className="text-lg font-bold text-white">Active Challenges</Text>
                        <TouchableOpacity>
                            <Text className="text-teal-400 font-medium text-sm">See All</Text>
                        </TouchableOpacity>
                    </View>

                    <View className="gap-4 mb-8">
                        {CHALLENGES.map(challenge => (
                            <Card key={challenge.id} className="p-0 border-0 bg-slate-800 overflow-hidden flex-row h-32">
                                <Image source={{ uri: challenge.image }} className="w-28 h-full" resizeMode="cover" />
                                <View className="flex-1 p-3 justify-between">
                                    <View>
                                        <Text className="text-base font-bold text-white leading-tight mb-1">{challenge.title}</Text>
                                        <View className="flex-row items-center gap-1 mb-2">
                                            <Target size={12} color="#64748b" />
                                            <Text className="text-xs text-slate-400">{challenge.goal}</Text>
                                        </View>
                                    </View>

                                    <View className="flex-row justify-between items-end">
                                        <View>
                                            <View className="flex-row items-center gap-1 mb-1">
                                                <Users size={12} color="#64748b" />
                                                <Text className="text-xs text-slate-400 font-medium">{challenge.participants}</Text>
                                            </View>
                                            <View className="flex-row items-center gap-1">
                                                <Clock size={12} color="#fbbf24" />
                                                <Text className="text-xs text-yellow-500 font-bold">{challenge.timeLeft}</Text>
                                            </View>
                                        </View>
                                        <Button title="Join" size="sm" className="px-4 h-8" />
                                    </View>
                                </View>
                            </Card>
                        ))}
                    </View>

                    {/* Your Communities */}
                    <View className="flex-row items-center justify-between mb-4 px-2">
                        <Text className="text-lg font-bold text-white">Your Communities</Text>
                        <TouchableOpacity>
                            <Text className="text-teal-400 font-medium text-sm">Discover</Text>
                        </TouchableOpacity>
                    </View>

                    <View className="gap-3">
                        {COMMUNITIES.map(group => (
                            <TouchableOpacity key={group.id} className="flex-row items-center p-4 bg-slate-800 rounded-2xl border border-slate-700/50 active:bg-slate-700">
                                <View className="w-12 h-12 rounded-xl bg-teal-500/10 items-center justify-center mr-4 border border-teal-500/20">
                                    <Users size={24} color="#2dd4bf" />
                                </View>
                                <View className="flex-1">
                                    <Text className="font-bold text-white text-base">{group.name}</Text>
                                    <Text className="text-slate-500 text-xs font-medium">{group.members} members</Text>
                                </View>
                                <ChevronRight size={20} color="#475569" />
                            </TouchableOpacity>
                        ))}

                        <TouchableOpacity className="flex-row items-center p-4 bg-slate-800/30 rounded-2xl border border-dashed border-slate-700 justify-center mt-2">
                            <Text className="text-slate-500 font-medium">Find more communities</Text>
                        </TouchableOpacity>
                    </View>

                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
