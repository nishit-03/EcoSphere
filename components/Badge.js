import { View, Text } from 'react-native';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export function Badge({ children, variant = 'default', className, textClassName }) {
    const variants = {
        default: 'bg-slate-700/50 border border-slate-600/30',
        success: 'bg-teal-500/15 border border-teal-500/20',
        warning: 'bg-amber-500/15 border border-amber-500/20',
        error: 'bg-red-500/15 border border-red-500/20',
        ai: 'bg-emerald-500/15 border border-emerald-500/30',
        info: 'bg-blue-500/15 border border-blue-500/20',
        orange: 'bg-orange-500/15 border border-orange-500/20',
    };

    const textVariants = {
        default: 'text-slate-300',
        success: 'text-teal-400',
        warning: 'text-amber-400',
        error: 'text-red-400',
        ai: 'text-emerald-400',
        info: 'text-blue-400',
        orange: 'text-orange-400',
    };

    return (
        <View className={twMerge('px-2.5 py-1 rounded-full self-start', variants[variant], className)}>
            <Text className={twMerge('text-xs font-semibold', textVariants[variant], textClassName)}>
                {children}
            </Text>
        </View>
    );
}
