import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { Play, Square, MapPin, Clock, Route } from 'lucide-react-native';
import Animated, {
    useSharedValue, useAnimatedStyle, withTiming, withRepeat,
    withSequence, Easing, FadeIn, SlideInUp,
} from 'react-native-reanimated';
import { RouteTracker } from '../../../utils/routeTracker';
import { impactAsync } from '../../../utils/haptics';

function formatDuration(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    const h = Math.floor(m / 60);
    if (h > 0) return `${h}:${String(m % 60).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${m}:${String(s).padStart(2, '0')}`;
}

export default function TrackingScreen() {
    const router = useRouter();
    const trackerRef = useRef(null);
    const timerRef = useRef(null);

    const [phase, setPhase] = useState('ready'); // ready | tracking | done
    const [distance, setDistance] = useState(0);
    const [duration, setDuration] = useState(0);
    const [coords, setCoords] = useState([]);
    const [error, setError] = useState(null);

    // Pulsing dot animation
    const pulse = useSharedValue(1);
    const pulseStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pulse.value }],
        opacity: 2 - pulse.value,
    }));

    useEffect(() => {
        if (phase === 'tracking') {
            pulse.value = withRepeat(
                withSequence(
                    withTiming(1.8, { duration: 1000, easing: Easing.ease }),
                    withTiming(1, { duration: 1000, easing: Easing.ease })
                ),
                -1
            );
        }
    }, [phase]);

    // Timer
    useEffect(() => {
        if (phase === 'tracking') {
            timerRef.current = setInterval(() => {
                setDuration(prev => prev + 1);
            }, 1000);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [phase]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (trackerRef.current) trackerRef.current.destroy();
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    const handleStart = useCallback(async () => {
        try {
            setError(null);
            impactAsync();
            const tracker = new RouteTracker(({ coordinates, distanceKm }) => {
                setCoords(coordinates);
                setDistance(distanceKm);
            });
            trackerRef.current = tracker;
            await tracker.start();
            setPhase('tracking');
        } catch (e) {
            setError(e.message);
        }
    }, []);

    const handleStop = useCallback(() => {
        impactAsync();
        if (timerRef.current) clearInterval(timerRef.current);

        const result = trackerRef.current?.stop();
        if (!result) return;

        trackerRef.current = null;
        setPhase('done');

        // Navigate to verify with route data
        const routeData = {
            coordinates: result.coordinates.map(c => ({
                latitude: c.lat,
                longitude: c.lng,
                timestamp: c.timestamp,
            })),
        };

        router.push({
            pathname: '/(tabs)/log/verify',
            params: {
                action: 'walking',
                routeData: JSON.stringify(routeData),
                autoDistance: String(result.distanceKm),
                duration: String(result.durationSec),
            },
        });
    }, [router]);

    return (
        <SafeAreaView className="flex-1 bg-gray-900">
            <View className="flex-1 items-center justify-center px-6">
                {/* Distance Display */}
                <Animated.View entering={FadeIn.duration(600)} className="items-center mb-8">
                    <Text className="text-slate-500 text-sm font-medium uppercase tracking-wider mb-2">
                        {phase === 'ready' ? 'Ready to Walk' : 'Distance'}
                    </Text>
                    <Text className="text-white font-black text-6xl tracking-tight">
                        {distance.toFixed(2)}
                    </Text>
                    <Text className="text-teal-400 text-lg font-bold">km</Text>
                </Animated.View>

                {/* Duration + Coordinates */}
                {phase === 'tracking' && (
                    <Animated.View entering={SlideInUp.duration(400)} className="flex-row gap-8 mb-12">
                        <View className="items-center">
                            <Clock size={16} color="#64748b" />
                            <Text className="text-white font-bold text-lg mt-1">{formatDuration(duration)}</Text>
                            <Text className="text-slate-500 text-xs">Duration</Text>
                        </View>
                        <View className="items-center">
                            <MapPin size={16} color="#64748b" />
                            <Text className="text-white font-bold text-lg mt-1">{coords.length}</Text>
                            <Text className="text-slate-500 text-xs">Points</Text>
                        </View>
                    </Animated.View>
                )}

                {/* Action Button */}
                {phase === 'ready' && (
                    <Animated.View entering={FadeIn.delay(200)}>
                        <TouchableOpacity
                            className="w-40 h-40 rounded-full bg-teal-500 items-center justify-center shadow-lg active:bg-teal-600"
                            onPress={handleStart}
                        >
                            <Play size={48} color="#fff" fill="#fff" />
                            <Text className="text-white font-bold text-lg mt-2">Start Walk</Text>
                        </TouchableOpacity>
                    </Animated.View>
                )}

                {phase === 'tracking' && (
                    <View className="items-center">
                        {/* Pulse indicator */}
                        <View className="items-center justify-center" style={{ width: 160, height: 160 }}>
                            <Animated.View
                                style={[{ width: 160, height: 160, borderRadius: 80, backgroundColor: '#ef444440', position: 'absolute' }, pulseStyle]}
                            />
                            <TouchableOpacity
                                className="w-36 h-36 rounded-full bg-red-500 items-center justify-center active:bg-red-600"
                                onPress={handleStop}
                            >
                                <Square size={40} color="#fff" fill="#fff" />
                                <Text className="text-white font-bold text-base mt-2">End Walk</Text>
                            </TouchableOpacity>
                        </View>

                        <Animated.View entering={FadeIn.delay(500)} className="flex-row items-center gap-1 mt-6">
                            <Route size={14} color="#2dd4bf" />
                            <Text className="text-teal-400 text-xs font-medium">Tracking your route…</Text>
                        </Animated.View>
                    </View>
                )}

                {/* Error */}
                {error && (
                    <View className="mt-6 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
                        <Text className="text-red-400 text-sm text-center">{error}</Text>
                    </View>
                )}
            </View>

            {/* Back button */}
            <View className="px-6 pb-8">
                <TouchableOpacity
                    className="py-3 items-center"
                    onPress={() => {
                        if (trackerRef.current) trackerRef.current.destroy();
                        router.back();
                    }}
                >
                    <Text className="text-slate-500 font-medium">Cancel</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
