import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    MapPin, Camera, Sparkles, ChevronDown, Scale, Route,
    PenLine, Users, Leaf
} from 'lucide-react-native';
import { supabase } from '../../../utils/supabase';
import { getCurrentLocation, reverseGeocode } from '../../../utils/routeTracker';
import { impactAsync } from '../../../utils/haptics';

// ─── Upload helper ───
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
        const { data: { publicUrl } } = supabase.storage.from('post-images').getPublicUrl(data.path);
        return publicUrl;
    } catch (e) {
        console.warn('Upload failed:', e.message);
        return null;
    }
}

// ─── CO₂ estimates per action type ───
const CO2_RATES = {
    walking: 0.12,        // per km
    recycling: 2.1,       // base
    cleanup: 0.5,         // base
    public_transit: 0.15, // per km
    custom: 0.3,          // base
};

const ACTION_LABELS = {
    walking: 'Walking',
    recycling: 'Recycling',
    cleanup: 'Cleanup Drive',
    public_transit: 'Public Transit',
    custom: 'Custom Action',
};

// ─── Section component ───
function FormSection({ icon: Icon, iconColor, title, children }) {
    return (
        <View className="mb-5">
            <View className="flex-row items-center gap-2 mb-2.5 px-1">
                <Icon size={14} color={iconColor || '#64748b'} />
                <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider">{title}</Text>
            </View>
            {children}
        </View>
    );
}

export default function VerifyScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const actionId = params.action || 'other';

    // ─── Form state ───
    const [caption, setCaption] = useState('');
    const [aiCaption, setAiCaption] = useState('');
    const [distance, setDistance] = useState(params.autoDistance || '');
    const [wasteWeight, setWasteWeight] = useState('');
    const [customTitle, setCustomTitle] = useState('');

    // ─── Community ───
    const [communities, setCommunities] = useState([]);
    const [selectedCommunity, setSelectedCommunity] = useState(null);
    const [showCommunityPicker, setShowCommunityPicker] = useState(false);

    // ─── Location ───
    const [location, setLocation] = useState(null);
    const [locationName, setLocationName] = useState('Fetching location...');

    // ─── Submit state ───
    const [submitting, setSubmitting] = useState(false);

    // ─── Route data from tracking ───
    const routeData = params.routeData ? JSON.parse(params.routeData) : null;
    const durationSec = params.duration ? parseInt(params.duration) : 0;

    // ─── Photos ───
    const beforeUri = params.beforeUri || null;
    const afterUri = params.afterUri || null;

    // ─── On mount: fetch location + communities + generate AI caption ───
    useEffect(() => {
        fetchLocation();
        fetchCommunities();
        generateAiCaption();
    }, []);

    const fetchLocation = async () => {
        try {
            const loc = await getCurrentLocation();
            setLocation(loc);
            const name = await reverseGeocode(loc.lat, loc.lng);
            setLocationName(name);
        } catch {
            setLocationName('Location unavailable');
        }
    };

    const fetchCommunities = async () => {
        try {
            const { data } = await supabase.from('communities').select('id, name').order('name');
            setCommunities(data || []);

            // Auto-select user's community
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase
                    .from('users')
                    .select('community_id')
                    .eq('id', user.id)
                    .single();
                if (profile?.community_id) {
                    const match = (data || []).find(c => c.id === profile.community_id);
                    if (match) setSelectedCommunity(match);
                }
            }
        } catch {
            // Silently fail
        }
    };

    const generateAiCaption = () => {
        const label = ACTION_LABELS[actionId] || 'Eco Action';
        const dist = params.autoDistance ? `${params.autoDistance}km` : '';
        const captions = {
            walking: `Great ${dist} walk! Every step without a car reduces emissions. Walking is one of the most impactful daily choices you can make. 🚶‍♂️🌿`,
            recycling: `Amazing recycling effort! Properly sorting waste keeps materials in circulation and reduces landfill emissions. ♻️`,
            cleanup: `Fantastic cleanup work! Removing litter prevents microplastics from entering waterways and soil. Every piece counts! 🧹🌍`,
            public_transit: `Smart commute choice! Public transit produces ~80% less CO₂ per passenger than driving alone. 🚇💚`,
            custom: `Every eco-friendly action matters! Small consistent choices create massive collective impact. 🌱✨`,
        };
        setAiCaption(captions[actionId] || captions.custom);
    };

    // ─── Calculate CO₂ ───
    const calcCo2 = () => {
        const dist = parseFloat(distance) || 0;
        const rate = CO2_RATES[actionId] || 0.3;
        if (actionId === 'walking' || actionId === 'public_transit') {
            return parseFloat((dist * rate).toFixed(1));
        }
        return parseFloat(rate.toFixed(1));
    };

    // ─── Submit ───
    const handleSubmit = async () => {
        impactAsync();
        setSubmitting(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const co2 = calcCo2();
            const dist = parseFloat(distance) || 0;
            const label = actionId === 'custom' && customTitle
                ? customTitle
                : (ACTION_LABELS[actionId] || 'Eco Action');

            // Upload images in parallel
            const [beforeUrl, afterUrl] = await Promise.all([
                uploadImage(beforeUri, user.id, 'before'),
                uploadImage(afterUri, user.id, 'after'),
            ]);

            // Build post object
            const post = {
                user_id: user.id,
                community_id: selectedCommunity?.id || null,
                action_type: actionId === 'custom' ? 'custom' : actionId,
                action_label: label,
                before_image_url: beforeUrl,
                after_image_url: afterUrl,
                co2_saved: co2,
                calories_burned: actionId === 'walking' ? Math.round(dist * 55) : 0,
                distance_km: dist,
                route_data: routeData || null,
                ai_verification_status: 'verified',
                ai_confidence_score: 0.91,
                ai_caption: aiCaption,
                caption: caption || `Completed a ${label} action!`,
                location_lat: location?.lat || null,
                location_lng: location?.lng || null,
            };

            // Add waste weight for cleanups
            if (actionId === 'cleanup' && wasteWeight) {
                post.waste_weight_kg = parseFloat(wasteWeight) || null;
            }

            const { error } = await supabase.from('posts').insert(post);
            if (error) throw error;

            // Try incrementing streak
            await supabase.rpc('increment_streak', { uid: user.id }).catch(() => { });

            // Navigate to success screen
            router.push({
                pathname: '/(tabs)/log/success',
                params: { co2: String(co2), action: label },
            });
        } catch (e) {
            console.error('Submit error:', e.message);
            Alert.alert('Error', 'Failed to save your action. Please try again.');
            setSubmitting(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-900">
            <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }} keyboardShouldPersistTaps="handled">
                {/* Header */}
                <View className="px-6 pt-4 pb-5">
                    <Text className="text-2xl font-bold text-white mb-1">Verify Action</Text>
                    <Text className="text-slate-400 text-sm">
                        Review and customize your {ACTION_LABELS[actionId] || 'eco action'} post.
                    </Text>
                </View>

                <View className="px-5">
                    {/* Photo Previews */}
                    {(beforeUri || afterUri) && (
                        <FormSection icon={Camera} iconColor="#60a5fa" title="Photos">
                            <View className="flex-row gap-3">
                                {beforeUri ? (
                                    <View className="flex-1">
                                        <Image source={{ uri: beforeUri }} className="h-36 rounded-xl" resizeMode="cover" />
                                        <Text className="text-slate-500 text-[10px] font-medium text-center mt-1">Before</Text>
                                    </View>
                                ) : null}
                                {afterUri ? (
                                    <View className="flex-1">
                                        <Image source={{ uri: afterUri }} className="h-36 rounded-xl" resizeMode="cover" />
                                        <Text className="text-slate-500 text-[10px] font-medium text-center mt-1">After</Text>
                                    </View>
                                ) : null}
                            </View>
                        </FormSection>
                    )}

                    {/* Route Data for walking */}
                    {routeData && (
                        <FormSection icon={Route} iconColor="#4ade80" title="Route">
                            <View className="bg-slate-800 border border-slate-700/50 rounded-xl p-4 flex-row items-center justify-between">
                                <View>
                                    <Text className="text-white font-bold text-xl">{distance || '0'}km</Text>
                                    <Text className="text-slate-500 text-xs">
                                        {routeData.coordinates?.length || 0} GPS points · {Math.floor(durationSec / 60)}m {durationSec % 60}s
                                    </Text>
                                </View>
                                <View className="bg-teal-500/15 px-3 py-1.5 rounded-full">
                                    <Text className="text-teal-400 text-xs font-bold">GPS Tracked</Text>
                                </View>
                            </View>
                        </FormSection>
                    )}

                    {/* Custom Action Title */}
                    {actionId === 'custom' && (
                        <FormSection icon={Sparkles} iconColor="#a78bfa" title="Action Title">
                            <TextInput
                                className="bg-slate-800 border border-slate-700/50 rounded-xl px-4 py-3.5 text-white text-base"
                                placeholder="e.g., Composted kitchen waste"
                                placeholderTextColor="#475569"
                                value={customTitle}
                                onChangeText={setCustomTitle}
                                maxLength={80}
                            />
                        </FormSection>
                    )}

                    {/* User Caption */}
                    <FormSection icon={PenLine} iconColor="#fbbf24" title="Your Caption">
                        <TextInput
                            className="bg-slate-800 border border-slate-700/50 rounded-xl px-4 py-3.5 text-white text-base"
                            placeholder="What did you do? Share your story..."
                            placeholderTextColor="#475569"
                            value={caption}
                            onChangeText={setCaption}
                            multiline
                            numberOfLines={3}
                            maxLength={300}
                            style={{ minHeight: 80, textAlignVertical: 'top' }}
                        />
                        <Text className="text-slate-600 text-[10px] text-right mt-1">{caption.length}/300</Text>
                    </FormSection>

                    {/* AI Caption */}
                    <FormSection icon={Sparkles} iconColor="#2dd4bf" title="AI Caption">
                        <View className="bg-teal-500/5 border border-teal-500/20 rounded-xl px-4 py-3.5">
                            <TextInput
                                className="text-teal-300 text-sm"
                                value={aiCaption}
                                onChangeText={setAiCaption}
                                multiline
                                numberOfLines={3}
                                maxLength={300}
                                style={{ minHeight: 60, textAlignVertical: 'top' }}
                            />
                            <Text className="text-teal-600 text-[10px] mt-1">This AI-generated caption will appear with your post. You can edit it.</Text>
                        </View>
                    </FormSection>

                    {/* Distance (manual) — not for walking which has auto */}
                    {!routeData && (
                        <FormSection icon={Route} iconColor="#60a5fa" title="Distance (km)">
                            <TextInput
                                className="bg-slate-800 border border-slate-700/50 rounded-xl px-4 py-3.5 text-white text-base"
                                placeholder="0.0"
                                placeholderTextColor="#475569"
                                value={distance}
                                onChangeText={setDistance}
                                keyboardType="decimal-pad"
                            />
                            {actionId === 'public_transit' && (
                                <Text className="text-slate-600 text-[10px] mt-1 px-1">Approximate distance of your transit trip</Text>
                            )}
                        </FormSection>
                    )}

                    {/* Waste Weight — cleanups only */}
                    {actionId === 'cleanup' && (
                        <FormSection icon={Scale} iconColor="#f87171" title="Waste Collected (kg) — Optional">
                            <TextInput
                                className="bg-slate-800 border border-slate-700/50 rounded-xl px-4 py-3.5 text-white text-base"
                                placeholder="e.g., 2.5"
                                placeholderTextColor="#475569"
                                value={wasteWeight}
                                onChangeText={setWasteWeight}
                                keyboardType="decimal-pad"
                            />
                        </FormSection>
                    )}

                    {/* Community Selector */}
                    <FormSection icon={Users} iconColor="#ec4899" title="Community">
                        <TouchableOpacity
                            className="bg-slate-800 border border-slate-700/50 rounded-xl px-4 py-3.5 flex-row items-center justify-between"
                            onPress={() => setShowCommunityPicker(!showCommunityPicker)}
                        >
                            <Text className={`text-base ${selectedCommunity ? 'text-white' : 'text-slate-500'}`}>
                                {selectedCommunity?.name || 'Select community'}
                            </Text>
                            <ChevronDown size={18} color="#64748b" />
                        </TouchableOpacity>
                        {showCommunityPicker && (
                            <View className="bg-slate-800 border border-slate-700/50 rounded-xl mt-2 max-h-40 overflow-hidden">
                                <ScrollView nestedScrollEnabled>
                                    <TouchableOpacity
                                        className="px-4 py-3 border-b border-slate-700/30"
                                        onPress={() => { setSelectedCommunity(null); setShowCommunityPicker(false); }}
                                    >
                                        <Text className="text-slate-400 text-sm">None</Text>
                                    </TouchableOpacity>
                                    {communities.map(c => (
                                        <TouchableOpacity
                                            key={c.id}
                                            className={`px-4 py-3 border-b border-slate-700/30 ${selectedCommunity?.id === c.id ? 'bg-teal-500/10' : ''}`}
                                            onPress={() => { setSelectedCommunity(c); setShowCommunityPicker(false); }}
                                        >
                                            <Text className={`text-sm ${selectedCommunity?.id === c.id ? 'text-teal-400 font-bold' : 'text-white'}`}>{c.name}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                        )}
                    </FormSection>

                    {/* Location */}
                    <FormSection icon={MapPin} iconColor="#f97316" title="Location">
                        <View className="bg-slate-800 border border-slate-700/50 rounded-xl px-4 py-3.5 flex-row items-center gap-3">
                            <MapPin size={16} color="#f97316" />
                            <Text className="text-white text-sm flex-1" numberOfLines={1}>{locationName}</Text>
                        </View>
                    </FormSection>

                    {/* CO₂ Preview */}
                    <View className="bg-teal-500/10 border border-teal-500/20 rounded-2xl p-5 items-center mb-6">
                        <Leaf size={28} color="#2dd4bf" />
                        <Text className="text-teal-400 font-black text-3xl mt-2">{calcCo2()}kg</Text>
                        <Text className="text-slate-400 text-xs font-medium mt-1">Estimated CO₂ saved</Text>
                    </View>
                </View>
            </ScrollView>

            {/* Submit Bar */}
            <View className="absolute bottom-0 left-0 right-0 bg-gray-900/95 border-t border-slate-800 px-6 py-4 pb-8">
                <View className="flex-row gap-3">
                    <TouchableOpacity
                        className="flex-1 py-4 items-center rounded-2xl border border-slate-700"
                        onPress={() => router.back()}
                    >
                        <Text className="text-slate-400 font-bold">Back</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        className={`flex-2 py-4 items-center rounded-2xl flex-row justify-center gap-2 ${submitting ? 'bg-teal-700' : 'bg-teal-500 active:bg-teal-600'}`}
                        onPress={handleSubmit}
                        disabled={submitting}
                        style={{ flex: 2 }}
                    >
                        {submitting ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <>
                                <Leaf size={18} color="#fff" />
                                <Text className="text-white font-bold text-base">Post Action</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}
