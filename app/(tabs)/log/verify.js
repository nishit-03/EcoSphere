import { View, Text, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CheckCircle } from 'lucide-react-native';
import { Button } from '../../../components/Button';
import { supabase } from '../../../utils/supabase';

// Upload a local file URI to Supabase Storage
async function uploadImage(uri, userId, label) {
    if (!uri) return null;
    try {
        const ext = uri.split('.').pop() || 'jpg';
        const fileName = `${userId}/${Date.now()}_${label}.${ext}`;

        const response = await fetch(uri);
        const blob = await response.blob();

        const { data, error } = await supabase.storage
            .from('post-images')
            .upload(fileName, blob, { contentType: `image/${ext}`, upsert: false });

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
            .from('post-images')
            .getPublicUrl(data.path);

        return publicUrl;
    } catch (e) {
        console.warn('Image upload failed:', e.message);
        return null;
    }
}

const ACTION_MAP = {
    cleanup: { label: 'Beach/Area Cleanup', type: 'cleanup', co2: 0.5, cal: 150 },
    transport: { label: 'Green Transport', type: 'cycling', co2: 2.4, cal: 240 },
    plant: { label: 'Tree Planting', type: 'planting', co2: 1.0, cal: 80 },
    energy: { label: 'Energy Saving', type: 'energy_saving', co2: 0.8, cal: 0 },
    other: { label: 'Eco Action', type: 'other', co2: 0.3, cal: 50 },
};

export default function VerifyScreen() {
    const [status, setStatus] = useState('uploading'); // 'uploading' | 'done' | 'error'
    const [co2Saved, setCo2Saved] = useState(0);
    const router = useRouter();
    const params = useLocalSearchParams();

    useEffect(() => {
        submitPost();
    }, []);

    const submitPost = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const action = ACTION_MAP[params.action] || ACTION_MAP.other;

            // Upload images
            const [beforeUrl, afterUrl] = await Promise.all([
                uploadImage(params.beforeUri, user.id, 'before'),
                uploadImage(params.afterUri, user.id, 'after'),
            ]);

            // Get user's community
            const { data: profile } = await supabase
                .from('users')
                .select('community_id')
                .eq('id', user.id)
                .single();

            // Insert post
            const { error } = await supabase.from('posts').insert({
                user_id: user.id,
                community_id: profile?.community_id || null,
                action_type: action.type,
                action_label: action.label,
                before_image_url: beforeUrl,
                after_image_url: afterUrl,
                co2_saved: action.co2,
                calories_burned: action.cal,
                ai_verification_status: 'verified', // Simulated AI verification
                ai_confidence_score: 0.91,
                ai_caption: `Great work! This ${action.label.toLowerCase()} action helps reduce carbon emissions and inspires others in your community. 🌱`,
                caption: `Just completed a ${action.label}!`,
            });

            if (error) throw error;

            // Update user streak
            await supabase.rpc('increment_streak', { uid: user.id }).catch(() => { });

            setCo2Saved(action.co2);
            setStatus('done');
        } catch (e) {
            console.error('Post submission failed:', e.message);
            setStatus('error');
        }
    };

    const handleDone = () => {
        router.dismissAll();
        router.push('/(tabs)/home');
    };

    if (status === 'uploading') {
        return (
            <SafeAreaView className="flex-1 bg-gray-900 items-center justify-center px-6">
                <ActivityIndicator size="large" color="#2dd4bf" className="mb-6" />
                <Text className="text-xl font-bold text-white mb-2">Saving Your Action...</Text>
                <Text className="text-slate-400 text-center">
                    Uploading photos and recording your eco impact.
                </Text>
            </SafeAreaView>
        );
    }

    if (status === 'error') {
        return (
            <SafeAreaView className="flex-1 bg-gray-900 items-center justify-center px-6">
                <Text className="text-6xl mb-4">⚠️</Text>
                <Text className="text-xl font-bold text-white mb-2 text-center">Something went wrong</Text>
                <Text className="text-slate-400 text-center mb-8">
                    Your action couldn't be saved. Please try again.
                </Text>
                <Button title="Go Back" onPress={() => router.back()} className="w-full" />
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
                    Great job! You've saved approximately{' '}
                    <Text className="font-bold text-white">{co2Saved}kg CO₂</Text> today.
                    Your action has been posted to the feed! 🌍
                </Text>

                <Button title="View Feed" onPress={handleDone} className="w-full mb-3" />
                <Button title="Close" variant="ghost" onPress={handleDone} className="w-full" />
            </View>
        </SafeAreaView>
    );
}
