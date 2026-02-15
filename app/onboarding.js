import { View, Text, FlatList, TouchableOpacity, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { useState, useRef } from 'react';
import { Button } from '../components/Button';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowRight } from 'lucide-react-native';

const SLIDES = [
    {
        id: '1',
        title: "Track Your Impact",
        description: "Log your daily eco-friendly actions and see the clear difference you make.",
        icon: "🌍"
    },
    {
        id: '2',
        title: "Join the Community",
        description: "Connect with like-minded people, share progress, and participate in challenges.",
        icon: "🤝"
    },
    {
        id: '3',
        title: "Earn Rewards",
        description: "Get verified, earn badges, and celebrate your green milestones with us.",
        icon: "🏆"
    }
];

export default function Onboarding() {
    const { width } = useWindowDimensions();
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef(null);
    const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 }).current;

    const handleNext = () => {
        if (currentIndex < SLIDES.length - 1) {
            flatListRef.current?.scrollToIndex({
                index: currentIndex + 1,
                animated: true
            });
            setCurrentIndex(currentIndex + 1);
        } else {
            router.replace('/(tabs)/home');
        }
    };

    const handleSkip = () => {
        router.replace('/(tabs)/home');
    };

    const onViewableItemsChanged = useRef(({ viewableItems }) => {
        if (viewableItems.length > 0) {
            setCurrentIndex(viewableItems[0].index);
        }
    }).current;

    const renderItem = ({ item }) => (
        <View style={{ width, paddingHorizontal: 24 }} className="items-center justify-center h-full">
            <View className="w-full aspect-square bg-slate-800 rounded-[40px] mb-10 items-center justify-center overflow-hidden border border-slate-700/50">
                <Text className="text-8xl">{item.icon}</Text>
            </View>

            <View>
                <Text className="text-3xl font-bold text-white text-center mb-4 leading-tight">
                    {item.title}
                </Text>
                <Text className="text-lg text-slate-400 text-center leading-relaxed h-24">
                    {item.description}
                </Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-900">
            <TouchableOpacity onPress={handleSkip} className="absolute top-12 right-6 z-10 px-4 py-2">
                <Text className="text-slate-500 font-medium">Skip</Text>
            </TouchableOpacity>

            <View className="flex-1 justify-center pt-10">
                <FlatList
                    ref={flatListRef}
                    data={SLIDES}
                    keyExtractor={item => item.id}
                    horizontal
                    pagingEnabled
                    snapToAlignment="center"
                    snapToInterval={width}
                    decelerationRate="fast"
                    showsHorizontalScrollIndicator={false}
                    onViewableItemsChanged={onViewableItemsChanged}
                    viewabilityConfig={viewabilityConfig}
                    getItemLayout={(data, index) => ({
                        length: width,
                        offset: width * index,
                        index,
                    })}
                    renderItem={renderItem}
                    className="flex-grow-0"
                    contentContainerStyle={{ alignItems: 'center' }}
                />
            </View>

            {/* Footer */}
            <View className="px-6 pb-12 w-full">
                {/* Pagination Dots */}
                <View className="flex-row justify-center gap-2 mb-8">
                    {SLIDES.map((_, index) => (
                        <View
                            key={index}
                            className={`h-2 rounded-full transition-all ${index === currentIndex
                                ? 'w-8 bg-teal-500'
                                : 'w-2 bg-slate-700'
                                }`}
                        />
                    ))}
                </View>

                {/* Action Button */}
                <Button
                    title={currentIndex === SLIDES.length - 1 ? "Get Started" : "Next"}
                    onPress={handleNext}
                    size="lg"
                    className="w-full shadow-lg shadow-teal-500/20"
                    icon={currentIndex === SLIDES.length - 1 ? null : <ArrowRight color="white" size={20} />}
                />
            </View>
        </SafeAreaView>
    );
}
