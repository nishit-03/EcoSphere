import { View, Text } from 'react-native';
import { BlurView } from 'expo-blur';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export function Card({ children, className, glass = false }) {
    const baseStyles = 'rounded-2xl p-4 bg-slate-800/80 border border-slate-700/50';

    if (glass) {
        return (
            <BlurView intensity={20} tint="dark" className={twMerge('rounded-2xl overflow-hidden border border-white/10', className)}>
                <View className="p-4 bg-slate-900/60">
                    {children}
                </View>
            </BlurView>
        );
    }

    return (
        <View className={twMerge(baseStyles, className)}>
            {children}
        </View>
    );
}
