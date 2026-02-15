import { View, Text } from 'react-native';

export const Marker = () => null;
export const Polyline = () => null;
export const PROVIDER_GOOGLE = null;

export default function MapView(props) {
    return (
        <View className="flex-1 items-center justify-center bg-slate-100 p-6 rounded-xl border border-slate-200 m-4">
            <Text className="text-3xl mb-2">🗺️</Text>
            <Text className="text-slate-800 font-bold text-lg mb-1">Interactive Map</Text>
            <Text className="text-slate-500 text-center">
                The impact map visualization is optimized for native mobile devices (iOS/Android).
            </Text>
        </View>
    );
}
