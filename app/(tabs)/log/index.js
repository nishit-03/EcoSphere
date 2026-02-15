import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Leaf, Trash2, Bike, Wind } from 'lucide-react-native';

const ACTIONS = [
    { id: 'cleanup', title: 'Cleanup Drive', icon: Trash2, color: '#f87171', bg: 'bg-red-500/10', desc: 'Pick up litter in your area' },
    { id: 'transport', title: 'Green Transport', icon: Bike, color: '#60a5fa', bg: 'bg-blue-500/10', desc: 'Cycle, walk, or public transit' },
    { id: 'plant', title: 'Plant a Sapling', icon: Leaf, color: '#4ade80', bg: 'bg-green-500/10', desc: 'Plant trees or maintain a garden' },
    { id: 'energy', title: 'Save Energy', icon: Wind, color: '#fbbf24', bg: 'bg-yellow-500/10', desc: 'Switch off unused appliances' },
];

export default function LogIndex() {
    const router = useRouter();

    const handleSelect = (item) => {
        router.push({ pathname: '/(tabs)/log/camera', params: { action: item.id } });
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-900 p-6">
            <Text className="text-2xl font-bold text-white mb-2">Log Action</Text>
            <Text className="text-slate-400 mb-6">Choose an activity to track & verify.</Text>

            <FlatList
                data={ACTIONS}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        className="flex-row items-center p-4 mb-4 bg-slate-800 border border-slate-700/50 rounded-2xl active:bg-slate-700"
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
