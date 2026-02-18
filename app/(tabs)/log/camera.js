import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Button as RNButton, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Button } from '../../../components/Button';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SkipForward } from 'lucide-react-native';

export default function CameraScreen() {
    const [permission, requestPermission] = useCameraPermissions();
    const [beforePhoto, setBeforePhoto] = useState(null);
    const [step, setStep] = useState('before'); // 'before' | 'after'
    const [currentPhoto, setCurrentPhoto] = useState(null);
    const cameraRef = useRef(null);
    const router = useRouter();
    const params = useLocalSearchParams();

    // photoMode: 'before_after' | 'single' | 'optional'
    const photoMode = params.photoMode || 'before_after';
    const actionId = params.action || 'other';

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
                const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 });
                setCurrentPhoto(photo.uri);
            } catch (e) {
                console.error(e);
            }
        }
    };

    const navigateToVerify = (beforeUri, afterUri) => {
        router.push({
            pathname: '/(tabs)/log/verify',
            params: {
                action: actionId,
                beforeUri: beforeUri || '',
                afterUri: afterUri || '',
            },
        });
    };

    // Skip photo → go straight to verify
    const handleSkip = () => {
        navigateToVerify(beforePhoto || '', '');
    };

    const handleNext = () => {
        if (photoMode === 'before_after') {
            // Before/After flow (Cleanups)
            if (step === 'before') {
                setBeforePhoto(currentPhoto);
                setCurrentPhoto(null);
                setStep('after');
            } else {
                navigateToVerify(beforePhoto, currentPhoto);
            }
        } else {
            // Single or optional → one photo then verify
            navigateToVerify(currentPhoto, '');
        }
    };

    // ─── Photo preview ───
    if (currentPhoto) {
        return (
            <SafeAreaView className="flex-1 bg-black justify-between">
                <Image source={{ uri: currentPhoto }} className="flex-1 rounded-xl m-4" />
                <View className="px-6 pb-6 flex-row gap-4">
                    <Button title="Retake" variant="secondary" onPress={() => setCurrentPhoto(null)} className="flex-1" />
                    <Button
                        title={photoMode === 'before_after' && step === 'before' ? 'Next Step' : 'Continue'}
                        onPress={handleNext}
                        className="flex-1"
                    />
                </View>
            </SafeAreaView>
        );
    }

    // ─── Camera view ───
    const stepLabel = photoMode === 'before_after'
        ? `Capture ${step} Photo`
        : 'Capture Photo';

    return (
        <View className="flex-1 bg-black">
            <CameraView style={{ flex: 1 }} ref={cameraRef} facing="back">
                <SafeAreaView className="flex-1 justify-between">
                    <View className="bg-black/60 p-4 items-center">
                        <Text className="text-white font-bold text-lg uppercase">
                            {stepLabel}
                        </Text>
                        {photoMode === 'before_after' && step === 'after' && beforePhoto && (
                            <Text className="text-teal-400 text-xs mt-1">Before photo saved ✓</Text>
                        )}
                        {photoMode === 'optional' && (
                            <Text className="text-slate-400 text-xs mt-1">Photo is optional for this action</Text>
                        )}
                    </View>

                    <View className="pb-12">
                        {/* Skip button for optional photos */}
                        {(photoMode === 'optional' || photoMode === 'single') && (
                            <TouchableOpacity
                                className="flex-row items-center justify-center gap-2 mb-6"
                                onPress={handleSkip}
                            >
                                <SkipForward size={16} color="#94a3b8" />
                                <Text className="text-slate-400 font-medium">Skip Photo</Text>
                            </TouchableOpacity>
                        )}

                        <View className="flex-row justify-center items-center">
                            <TouchableOpacity
                                onPress={takePicture}
                                className="w-20 h-20 rounded-full border-4 border-white items-center justify-center bg-white/20"
                            >
                                <View className="w-16 h-16 rounded-full bg-white" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </SafeAreaView>
            </CameraView>
        </View>
    );
}
