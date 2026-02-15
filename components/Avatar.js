import { View, Image, Text } from 'react-native';
import { twMerge } from 'tailwind-merge';

export function Avatar({ source, fallback, size = 'default', className }) {
    const sizes = {
        xs: 'w-6 h-6',
        sm: 'w-8 h-8',
        default: 'w-12 h-12',
        lg: 'w-24 h-24',
        xl: 'w-32 h-32',
    };

    const textSizes = {
        xs: 'text-[9px]',
        sm: 'text-xs',
        default: 'text-base',
        lg: 'text-2xl',
        xl: 'text-4xl',
    };

    return (
        <View className={twMerge('rounded-full overflow-hidden bg-slate-700 items-center justify-center border-2 border-slate-600', sizes[size], className)}>
            {source ? (
                <Image source={source} className="w-full h-full" resizeMode="cover" />
            ) : (
                <Text className={twMerge('font-bold text-slate-300', textSizes[size])}>{fallback || '?'}</Text>
            )}
        </View>
    );
}
