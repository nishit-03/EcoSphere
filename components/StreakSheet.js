import { View, Text, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { X, Flame, Target, Calendar, Award, ChevronRight, Zap } from 'lucide-react-native';
import Svg, { Circle } from 'react-native-svg';

const MILESTONES = [
    { days: 7, label: '1 Week Warrior', emoji: '🔥', reward: '+50 pts', reached: true },
    { days: 14, label: 'Two-Week Titan', emoji: '⚡', reward: '+120 pts', reached: false },
    { days: 30, label: 'Monthly Legend', emoji: '🏆', reward: '+300 pts', reached: false },
    { days: 60, label: 'Eco Champion', emoji: '🌟', reward: '+600 pts', reached: false },
    { days: 100, label: 'Century Hero', emoji: '💎', reward: '+1000 pts', reached: false },
];

function BigStreakRing({ current, goal, size = 140 }) {
    const strokeWidth = 8;
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
                <Flame size={28} color="#f97316" fill="#f97316" />
                <Text className="text-white font-black text-3xl mt-1">{current}</Text>
                <Text className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">day streak</Text>
            </View>
        </View>
    );
}

export function StreakSheet({ visible, onClose, streak }) {
    if (!streak) return null;
    const { current, goal, lastActionDate, graceHours } = streak;
    const nextMilestone = MILESTONES.find(m => m.days > current);

    return (
        <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
            <View className="flex-1 bg-black/60" onTouchEnd={onClose} />
            <View className="bg-slate-900 rounded-t-3xl border-t border-slate-700/50" style={{ maxHeight: '82%' }}>
                {/* Handle */}
                <View className="items-center pt-3 pb-1">
                    <View className="w-10 h-1 bg-slate-700 rounded-full" />
                </View>

                {/* Header */}
                <View className="flex-row items-center justify-between px-5 py-3 border-b border-slate-800">
                    <Text className="text-white font-bold text-base">Your Streak</Text>
                    <TouchableOpacity onPress={onClose} className="p-1">
                        <X size={22} color="#94a3b8" />
                    </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                    {/* Big ring */}
                    <View className="items-center pt-6 pb-4">
                        <BigStreakRing current={current} goal={goal} />
                    </View>

                    {/* Motivational copy */}
                    <View className="items-center px-5 mb-6">
                        {current >= 7 ? (
                            <Text className="text-teal-400 text-center text-sm font-medium leading-relaxed">
                                🔥 Incredible! You've been consistent for {current} days.{'\n'}Top 5% of EcoSphere users!
                            </Text>
                        ) : current >= 3 ? (
                            <Text className="text-amber-400 text-center text-sm font-medium leading-relaxed">
                                ⚡ Great momentum! {goal - current} more days to hit your goal.{'\n'}Keep going, you're building a habit!
                            </Text>
                        ) : (
                            <Text className="text-slate-400 text-center text-sm font-medium leading-relaxed">
                                🌱 Every day counts! Log a verified action daily{'\n'}to build your streak.
                            </Text>
                        )}
                    </View>

                    {/* Stats grid */}
                    <View className="flex-row mx-5 gap-3 mb-6">
                        <View className="flex-1 bg-slate-800/80 rounded-2xl p-4 items-center border border-slate-700/40">
                            <Target size={20} color="#2dd4bf" />
                            <Text className="text-white font-black text-xl mt-2">{goal}</Text>
                            <Text className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Day Goal</Text>
                        </View>
                        <View className="flex-1 bg-slate-800/80 rounded-2xl p-4 items-center border border-slate-700/40">
                            <Calendar size={20} color="#60a5fa" />
                            <Text className="text-white font-black text-xl mt-2">{lastActionDate}</Text>
                            <Text className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Last Action</Text>
                        </View>
                        <View className="flex-1 bg-slate-800/80 rounded-2xl p-4 items-center border border-slate-700/40">
                            <Zap size={20} color="#f97316" />
                            <Text className="text-white font-black text-xl mt-2">{graceHours}h</Text>
                            <Text className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Grace</Text>
                        </View>
                    </View>

                    {/* How streaks work */}
                    <View className="mx-5 mb-6 bg-slate-800/50 rounded-2xl p-4 border border-slate-700/30">
                        <Text className="text-white font-bold text-sm mb-2">How Streaks Work</Text>
                        <Text className="text-slate-400 text-xs leading-5">
                            • Complete an AI-verified action each day{'\n'}
                            • Streak resets if you miss a full day{'\n'}
                            • {graceHours}-hour grace period after midnight{'\n'}
                            • Longer streaks = bigger rewards!
                        </Text>
                    </View>

                    {/* Next milestone */}
                    {nextMilestone && (
                        <View className="mx-5 mb-4 bg-amber-500/10 rounded-2xl p-4 flex-row items-center border border-amber-500/20">
                            <Text className="text-2xl mr-3">{nextMilestone.emoji}</Text>
                            <View className="flex-1">
                                <Text className="text-white font-bold text-sm">{nextMilestone.label}</Text>
                                <Text className="text-slate-400 text-xs">{nextMilestone.days - current} days to go • {nextMilestone.reward}</Text>
                            </View>
                            <ChevronRight size={18} color="#f59e0b" />
                        </View>
                    )}

                    {/* Milestones */}
                    <Text className="text-white font-bold text-sm mx-5 mb-3">Milestones</Text>
                    {MILESTONES.map(m => (
                        <View key={m.days} className={`mx-5 mb-2 flex-row items-center gap-3 p-3 rounded-xl ${current >= m.days ? 'bg-teal-500/10 border border-teal-500/20' : 'bg-slate-800/40 border border-slate-700/20'}`}>
                            <Text className="text-xl">{m.emoji}</Text>
                            <View className="flex-1">
                                <Text className={`font-bold text-sm ${current >= m.days ? 'text-teal-400' : 'text-slate-400'}`}>{m.label}</Text>
                                <Text className="text-slate-500 text-xs">{m.days} days • {m.reward}</Text>
                            </View>
                            {current >= m.days && (
                                <View className="bg-teal-500/20 px-2 py-0.5 rounded-full">
                                    <Text className="text-teal-400 text-[10px] font-bold">COMPLETE</Text>
                                </View>
                            )}
                        </View>
                    ))}
                </ScrollView>
            </View>
        </Modal>
    );
}
