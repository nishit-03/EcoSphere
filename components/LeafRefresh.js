import { View, Animated, Easing } from 'react-native';
import { useRef, useEffect } from 'react';
import Svg, { Path } from 'react-native-svg';
import { impactAsync } from '../utils/haptics';

// ─── Simple flat leaf SVG ───
function LeafIcon({ size = 28 }) {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path
                d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22L6.66 19.7C7.14 19.87 7.64 20 8.17 20C12.55 20 16.19 16.04 17.76 14.06C20.57 10.43 20 4 20 4C20 4 18.55 4.61 17 8Z"
                fill="#34d399"
            />
            <Path
                d="M8 17C10 14 13 11.5 17 8"
                stroke="#059669"
                strokeWidth={1}
                strokeLinecap="round"
                fill="none"
            />
        </Svg>
    );
}

/**
 * Self-contained leaf refresh indicator.
 * When `active` becomes true, runs a 3s animation then calls `onComplete`.
 * Renders as an absolute overlay — must be placed OUTSIDE the scroll container.
 */
export function LeafRefreshIndicator({ active, onComplete }) {
    const rotation = useRef(new Animated.Value(0)).current;
    const opacity = useRef(new Animated.Value(0)).current;
    const scale = useRef(new Animated.Value(0.8)).current;
    const translateY = useRef(new Animated.Value(-10)).current;
    const animRef = useRef(null);

    useEffect(() => {
        if (active) {
            console.log('[LeafRefresh] Animation STARTED');
            impactAsync();

            // Reset
            rotation.setValue(0);
            opacity.setValue(0);
            scale.setValue(0.8);
            translateY.setValue(-10);

            // 3-second animation: fade in → rotate → fade out
            animRef.current = Animated.sequence([
                // Phase 1 (0–0.4s): Fade in + scale up
                Animated.parallel([
                    Animated.timing(opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
                    Animated.timing(scale, { toValue: 1, duration: 400, easing: Easing.out(Easing.back(1.5)), useNativeDriver: true }),
                    Animated.timing(translateY, { toValue: 0, duration: 400, easing: Easing.out(Easing.quad), useNativeDriver: true }),
                ]),
                // Phase 2 (0.4–2.5s): Continuous rotation
                Animated.timing(rotation, {
                    toValue: 2, // 2 full turns
                    duration: 2100,
                    easing: Easing.inOut(Easing.quad),
                    useNativeDriver: true,
                }),
                // Phase 3 (2.5–3s): Float up + fade out
                Animated.parallel([
                    Animated.timing(translateY, { toValue: -20, duration: 500, easing: Easing.in(Easing.quad), useNativeDriver: true }),
                    Animated.timing(opacity, { toValue: 0, duration: 500, useNativeDriver: true }),
                    Animated.timing(scale, { toValue: 0.6, duration: 500, useNativeDriver: true }),
                ]),
            ]);

            animRef.current.start(({ finished }) => {
                console.log('[LeafRefresh] Animation COMPLETE, finished:', finished);
                if (finished) {
                    onComplete?.();
                }
            });
        } else {
            // Immediately hide if deactivated
            if (animRef.current) {
                animRef.current.stop();
                animRef.current = null;
            }
            opacity.setValue(0);
        }

        return () => {
            if (animRef.current) {
                animRef.current.stop();
            }
        };
    }, [active]);

    const rotateInterp = rotation.interpolate({
        inputRange: [0, 1, 2],
        outputRange: ['0deg', '360deg', '720deg'],
    });

    // Don't render anything when inactive
    if (!active) return null;

    return (
        <View
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 999,
                alignItems: 'center',
                paddingTop: 60,
            }}
            pointerEvents="none"
        >
            <Animated.View
                style={{
                    opacity,
                    transform: [
                        { translateY },
                        { scale },
                        { rotate: rotateInterp },
                    ],
                }}
            >
                <LeafIcon />
            </Animated.View>
        </View>
    );
}
