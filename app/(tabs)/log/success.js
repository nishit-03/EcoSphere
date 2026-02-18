import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useEffect, useCallback, useMemo } from 'react';
import Animated, {
    useSharedValue, useAnimatedStyle, withTiming, withDelay,
    withSpring, Easing, FadeIn, SlideInUp,
} from 'react-native-reanimated';
import { Leaf, ArrowRight, Award } from 'lucide-react-native';
import { impactAsync } from '../../../utils/haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Confetti Piece ───
// All random values are computed OUTSIDE the worklet via useMemo
function ConfettiPiece({ color, delay, startX, drift, size, isRound }) {
    const y = useSharedValue(-50);
    const x = useSharedValue(0);
    const rotate = useSharedValue(0);
    const opacity = useSharedValue(1);

    useEffect(() => {
        y.value = withDelay(delay, withTiming(800, { duration: 3000, easing: Easing.out(Easing.quad) }));
        x.value = withDelay(delay, withTiming(drift, { duration: 2500, easing: Easing.inOut(Easing.sin) }));
        rotate.value = withDelay(delay, withTiming(360, { duration: 2500 }));
        opacity.value = withDelay(delay + 1800, withTiming(0, { duration: 700 }));
    }, []);

    const animStyle = useAnimatedStyle(() => ({
        transform: [
            { translateY: y.value },
            { translateX: x.value },
            { rotate: `${rotate.value}deg` },
        ],
        opacity: opacity.value,
    }));

    return (
        <Animated.View
            style={[
                {
                    position: 'absolute',
                    top: -20,
                    left: SCREEN_WIDTH / 2 + startX,
                    width: size,
                    height: size,
                    borderRadius: isRound ? 100 : 2,
                    backgroundColor: color,
                },
                animStyle,
            ]}
        />
    );
}

// ─── Confetti Burst ───
const CONFETTI_COLORS = ['#2dd4bf', '#4ade80', '#fbbf24', '#f97316', '#60a5fa', '#ec4899', '#a78bfa'];

function ConfettiBurst() {
    // Pre-compute all random values in JS thread, not in worklets
    const pieces = useMemo(() =>
        Array.from({ length: 30 }, (_, i) => ({
            id: i,
            color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
            delay: Math.random() * 400,
            startX: (Math.random() - 0.5) * SCREEN_WIDTH * 0.9,
            drift: (Math.random() - 0.5) * 80,
            size: 10 + Math.random() * 6,
            isRound: Math.random() > 0.5,
        })), []);

    return (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} pointerEvents="none">
            {pieces.map(p => (
                <ConfettiPiece
                    key={p.id}
                    color={p.color}
                    delay={p.delay}
                    startX={p.startX}
                    drift={p.drift}
                    size={p.size}
                    isRound={p.isRound}
                />
            ))}
        </View>
    );
}

// ─── Animated CO₂ Text ───
function AnimatedCo2({ target }) {
    const scale = useSharedValue(0.3);
    const opacity = useSharedValue(0);

    useEffect(() => {
        scale.value = withDelay(500, withSpring(1, { damping: 8, stiffness: 120 }));
        opacity.value = withDelay(400, withTiming(1, { duration: 400 }));
    }, []);

    const animStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
    }));

    return (
        <Animated.View style={animStyle}>
            <Text style={{ color: '#2dd4bf', fontWeight: '900', fontSize: 48, textAlign: 'center' }}>{target}kg</Text>
        </Animated.View>
    );
}

export default function SuccessScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const co2 = parseFloat(params.co2) || 0;
    const actionLabel = params.action || 'Eco Action';

    // Badge animation
    const badgeScale = useSharedValue(0);
    const badgeOpacity = useSharedValue(0);
    const showBadge = co2 >= 2.0;

    useEffect(() => {
        impactAsync();
        if (showBadge) {
            badgeScale.value = withDelay(2000, withSpring(1, { damping: 6, stiffness: 100 }));
            badgeOpacity.value = withDelay(1800, withTiming(1, { duration: 400 }));
        }
    }, []);

    const badgeStyle = useAnimatedStyle(() => ({
        transform: [{ scale: badgeScale.value }],
        opacity: badgeOpacity.value,
    }));

    const handleDone = useCallback(() => {
        router.dismissAll();
        router.push('/(tabs)/home');
    }, [router]);

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#111827' }}>
            <ConfettiBurst />

            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
                {/* Leaf Icon */}
                <Animated.View
                    entering={FadeIn.delay(200).duration(500)}
                    style={{
                        width: 96, height: 96, borderRadius: 48,
                        backgroundColor: 'rgba(45,212,191,0.2)',
                        alignItems: 'center', justifyContent: 'center',
                        marginBottom: 32, borderWidth: 2, borderColor: 'rgba(45,212,191,0.3)',
                    }}
                >
                    <Leaf size={48} color="#2dd4bf" />
                </Animated.View>

                {/* Title */}
                <Animated.Text
                    entering={SlideInUp.delay(300).duration(500)}
                    style={{ fontSize: 28, fontWeight: '900', color: '#fff', marginBottom: 8, textAlign: 'center' }}
                >
                    Action Verified! 🌍
                </Animated.Text>

                <Animated.Text
                    entering={FadeIn.delay(500).duration(500)}
                    style={{ color: '#94a3b8', textAlign: 'center', fontSize: 14, marginBottom: 32 }}
                >
                    Your {actionLabel.toLowerCase()} has been posted to the feed.
                </Animated.Text>

                {/* CO₂ Counter */}
                <Animated.View
                    entering={FadeIn.delay(400)}
                    style={{
                        backgroundColor: 'rgba(30,41,59,0.8)',
                        borderWidth: 1, borderColor: 'rgba(51,65,85,0.4)',
                        borderRadius: 24, paddingHorizontal: 40, paddingVertical: 32,
                        alignItems: 'center', marginBottom: 24,
                    }}
                >
                    <Text style={{ color: '#64748b', fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 12, textTransform: 'uppercase' }}>
                        CO₂ Saved
                    </Text>
                    <AnimatedCo2 target={co2} />
                    <Text style={{ color: '#64748b', fontSize: 12, marginTop: 8 }}>
                        That's equivalent to ~{Math.max(Math.round(co2 / 0.8), 1)} trees for a day 🌳
                    </Text>
                </Animated.View>

                {/* Badge */}
                {showBadge && (
                    <Animated.View style={[{
                        backgroundColor: 'rgba(251,191,36,0.15)',
                        borderWidth: 1, borderColor: 'rgba(251,191,36,0.3)',
                        borderRadius: 16, paddingHorizontal: 24, paddingVertical: 12,
                        flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 32,
                    }, badgeStyle]}>
                        <Award size={20} color="#fbbf24" />
                        <Text style={{ color: '#fbbf24', fontWeight: '700', fontSize: 14 }}>High Impact! 🏆</Text>
                    </Animated.View>
                )}
            </View>

            {/* Bottom buttons */}
            <Animated.View entering={SlideInUp.delay(1200).duration(600)} style={{ paddingHorizontal: 24, paddingBottom: 32 }}>
                <TouchableOpacity
                    style={{
                        backgroundColor: '#14b8a6', paddingVertical: 16, borderRadius: 16,
                        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 12,
                    }}
                    onPress={handleDone}
                    activeOpacity={0.8}
                >
                    <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>View Feed</Text>
                    <ArrowRight size={18} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity style={{ paddingVertical: 12, alignItems: 'center' }} onPress={handleDone}>
                    <Text style={{ color: '#64748b', fontWeight: '500' }}>Close</Text>
                </TouchableOpacity>
            </Animated.View>
        </SafeAreaView>
    );
}
