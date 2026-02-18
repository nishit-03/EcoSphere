import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Footprints, Recycle, Trash2, Train, Sparkles } from 'lucide-react-native';

const ACTIONS = [
    {
        id: 'walking',
        title: 'Walking',
        icon: Footprints,
        color: '#4ade80',
        bg: 'bg-green-500/10',
        desc: 'Track your walk with live GPS',
        photoMode: 'optional',
        hasTracking: true,
    },
    {
        id: 'recycling',
        title: 'Recycling',
        icon: Recycle,
        color: '#60a5fa',
        bg: 'bg-blue-500/10',
        desc: 'Log recycled materials',
        photoMode: 'single',
        hasTracking: false,
    },
    {
        id: 'cleanup',
        title: 'Cleanups',
        icon: Trash2,
        color: '#f87171',
        bg: 'bg-red-500/10',
        desc: 'Before & after photos required',
        photoMode: 'before_after',
        hasTracking: false,
    },
    {
        id: 'public_transit',
        title: 'Public Transit',
        icon: Train,
        color: '#fbbf24',
        bg: 'bg-yellow-500/10',
        desc: 'Log your green commute',
        photoMode: 'optional',
        hasTracking: false,
    },
    {
        id: 'custom',
        title: 'Custom Action',
        icon: Sparkles,
        color: '#a78bfa',
        bg: 'bg-purple-500/10',
        desc: 'Log any eco-friendly action',
        photoMode: 'optional',
        hasTracking: false,
    },
];

export default function LogIndex() {
    const router = useRouter();

    const handleSelect = (item) => {
        if (item.hasTracking) {
            // Walking → Tracking screen
            router.push({
                pathname: '/(tabs)/log/tracking',
                params: { action: item.id },
            });
        } else {
            // Others → Camera (with photoMode)
            router.push({
                pathname: '/(tabs)/log/camera',
                params: { action: item.id, photoMode: item.photoMode },
            });
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-900 p-6">
            <Text className="text-2xl font-bold text-white mb-1">Log Action</Text>
            <Text className="text-slate-400 mb-6">Choose an activity to track & verify.</Text>

            <FlatList
                data={ACTIONS}
                keyExtractor={item => item.id}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        className="flex-row items-center p-4 mb-3 bg-slate-800 border border-slate-700/50 rounded-2xl active:bg-slate-700"
                        onPress={() => handleSelect(item)}
                    >
                        <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${item.bg}`}>
                            <item.icon size={24} color={item.color} />
                        </View>
                        <View className="flex-1">
                            <Text className="text-lg font-semibold text-white">{item.title}</Text>
                            <Text className="text-sm text-slate-400">{item.desc}</Text>
                        </View>
                    </TouchableOpacity>
                )}
            />
        </SafeAreaView>
    );
}
