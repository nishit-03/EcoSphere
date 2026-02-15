import { View, Text, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CheckCircle } from 'lucide-react-native';
import { Button } from '../../../components/Button';

export default function VerifyScreen() {
    const [verifying, setVerifying] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const timer = setTimeout(() => {
            setVerifying(false);
        }, 3000);
        return () => clearTimeout(timer);
    }, []);

    const handleDone = () => {
        router.dismissAll();
        router.push('/(tabs)/home');
    };

    if (verifying) {
        return (
            <SafeAreaView className="flex-1 bg-gray-900 items-center justify-center px-6">
                <ActivityIndicator size="large" color="#2dd4bf" className="mb-6" />
                <Text className="text-xl font-bold text-white mb-2">Verifying Action...</Text>
                <Text className="text-slate-400 text-center">
                    Our AI is analyzing your photos for authenticity and location data.
                </Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-900 items-center justify-center px-6">
            <View className="mb-6">
                <CheckCircle size={100} color="#2dd4bf" />
            </View>

            <View>
                <Text className="text-3xl font-bold text-teal-400 mb-2 text-center">Verified!</Text>
                <Text className="text-slate-400 text-center mb-8">
                    Great job! You've saved approximately <Text className="font-bold text-white">2.5kg CO2</Text> today.
                </Text>

                <Button title="Share to Feed" onPress={handleDone} className="w-full mb-3" />
                <Button title="Close" variant="ghost" onPress={handleDone} className="w-full" />
            </View>
        </SafeAreaView>
    );
}
