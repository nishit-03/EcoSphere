import { TextInput, View, Text } from 'react-native';
import { twMerge } from 'tailwind-merge';

export function Input({ label, error, className, ...props }) {
    return (
        <View className="w-full mb-4">
            {label && <Text className="text-slate-600 mb-1.5 font-medium ml-1">{label}</Text>}
            <TextInput
                placeholderTextColor="#94a3b8"
                className={twMerge(
                    'w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-800 focus:border-teal-500 focus:bg-white',
                    error && 'border-red-500 bg-red-50',
                    className
                )}
                {...props}
            />
            {error && <Text className="text-red-500 text-sm mt-1 ml-1">{error}</Text>}
        </View>
    );
}
