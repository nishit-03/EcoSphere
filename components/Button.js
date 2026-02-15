import { TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';
import { impactAsync } from '../utils/haptics';

export function Button({
    onPress,
    title,
    variant = 'primary',
    size = 'default',
    isLoading = false,
    className,
    textClassName,
    icon
}) {
    const baseStyles = 'rounded-full items-center justify-center flex-row';

    const variants = {
        primary: 'bg-teal-500 active:bg-teal-600 shadow-lg shadow-teal-500/20',
        secondary: 'bg-slate-700 active:bg-slate-600 border border-slate-600',
        ghost: 'bg-transparent active:bg-slate-800',
        outline: 'border-2 border-teal-500 active:bg-teal-500/10',
    };

    const sizes = {
        sm: 'px-4 py-2',
        default: 'px-6 py-3.5',
        lg: 'px-8 py-4',
    };

    const textVariants = {
        primary: 'text-white font-semibold',
        secondary: 'text-slate-200 font-medium',
        ghost: 'text-teal-400 font-medium',
        outline: 'text-teal-400 font-bold',
    };

    const handlePress = (e) => {
        impactAsync();
        onPress && onPress(e);
    };

    return (
        <TouchableOpacity
            onPress={handlePress}
            disabled={isLoading}
            activeOpacity={0.8}
            className={twMerge(baseStyles, variants[variant], sizes[size], className)}
        >
            {isLoading ? (
                <ActivityIndicator color={variant === 'primary' ? 'white' : '#2dd4bf'} />
            ) : (
                <View className="flex-row items-center gap-2">
                    <Text className={twMerge('text-center', textVariants[variant], textClassName)}>
                        {title}
                    </Text>
                    {icon}
                </View>
            )}
        </TouchableOpacity>
    );
}
