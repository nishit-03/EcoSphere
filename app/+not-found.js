import { Link, Stack } from 'expo-router';
import { View, Text } from 'react-native';

export default function NotFoundScreen() {
    return (
        <>
            <Stack.Screen options={{ title: 'Oops!' }} />
            <View className="flex-1 items-center justify-center bg-white p-5">
                <Text className="text-xl font-bold mb-4">This screen doesn't exist.</Text>
                <Link href="/(tabs)/home" className="text-teal-500 underline text-base">
                    Go to Home Screen
                </Link>
            </View>
        </>
    );
}
