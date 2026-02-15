import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Button as RNButton, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Button } from '../../../components/Button';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, RefreshCw } from 'lucide-react-native';

export default function CameraScreen() {
    const [permission, requestPermission] = useCameraPermissions();
    const [photo, setPhoto] = useState(null);
    const [step, setStep] = useState('before'); // 'before' | 'after'
    const cameraRef = useRef(null);
    const router = useRouter();
    const params = useLocalSearchParams();

    if (!permission) return <View />;
    if (!permission.granted) {
        return (
            <View className="flex-1 justify-center items-center p-6 bg-gray-900">
                <Text className="text-center mb-4 text-slate-300">We need your permission to show the camera</Text>
                <RNButton onPress={requestPermission} title="Grant Permission" />
            </View>
        );
    }

    const takePicture = async () => {
        if (cameraRef.current) {
            try {
                const photo = await cameraRef.current.takePictureAsync({ quality: 0.7, base64: true });
                setPhoto(photo.uri);
            } catch (e) {
                console.error(e);
            }
        }
    };

    const handleNext = () => {
        if (step === 'before') {
            // In real app, we would store 'before' photo and clear state for 'after'
            // For MVP, checking flow
            setStep('after');
            setPhoto(null);
        } else {
            // Proceed to verification
            router.push('/(tabs)/log/verify');
        }
    };

    if (photo) {
        return (
            <SafeAreaView className="flex-1 bg-black justify-between">
                <Image source={{ uri: photo }} className="flex-1 rounded-xl m-4" />
                <View className="px-6 pb-6 flex-row gap-4">
                    <Button title="Retake" variant="secondary" onPress={() => setPhoto(null)} className="flex-1" />
                    <Button title={step === 'before' ? "Next Step" : "Verify"} onPress={handleNext} className="flex-1" />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <View className="flex-1 bg-black">
            <CameraView style={{ flex: 1 }} ref={cameraRef} facing="back">
                <SafeAreaView className="flex-1 justify-between">
                    <View className="bg-black/60 p-4 items-center">
                        <Text className="text-white font-bold text-lg uppercase">
                            Capture {step} Photo
                        </Text>
                    </View>

                    <View className="flex-row justify-center items-center pb-12">
                        <TouchableOpacity
                            onPress={takePicture}
                            className="w-20 h-20 rounded-full border-4 border-white items-center justify-center bg-white/20"
                        >
                            <View className="w-16 h-16 rounded-full bg-white" />
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </CameraView>
        </View>
    );
}
