import { Stack } from 'expo-router';

export default function LogLayout() {
    return (
        <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
            <Stack.Screen name="index" options={{ title: 'Select Action' }} />
            <Stack.Screen name="camera" options={{ presentation: 'fullScreenModal' }} />
            <Stack.Screen name="verify" options={{ presentation: 'modal' }} />
        </Stack>
    );
}
