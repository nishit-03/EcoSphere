import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { router } from 'expo-router';
import { Leaf, Mail, Lock } from 'lucide-react-native';
import { supabase } from '../../utils/supabase';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields.');
            return;
        }
        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        setLoading(false);
        if (error) {
            Alert.alert('Login Failed', error.message);
        }
        // Navigation handled by _layout.js auth listener
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-900">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1 justify-center px-6"
            >
                {/* Logo */}
                <View className="items-center mb-12">
                    <View className="w-20 h-20 rounded-3xl bg-teal-500/15 border border-teal-500/30 items-center justify-center mb-4">
                        <Leaf size={40} color="#2dd4bf" />
                    </View>
                    <Text className="text-white text-3xl font-black">EcoSphere</Text>
                    <Text className="text-slate-400 text-sm mt-1">Make every action count 🌍</Text>
                </View>

                {/* Form */}
                <View className="gap-4">
                    <View className="bg-slate-800 rounded-2xl flex-row items-center px-4 border border-slate-700/50">
                        <Mail size={18} color="#64748b" />
                        <TextInput
                            className="flex-1 text-white py-4 px-3 text-base"
                            placeholder="Email address"
                            placeholderTextColor="#475569"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                    </View>

                    <View className="bg-slate-800 rounded-2xl flex-row items-center px-4 border border-slate-700/50">
                        <Lock size={18} color="#64748b" />
                        <TextInput
                            className="flex-1 text-white py-4 px-3 text-base"
                            placeholder="Password"
                            placeholderTextColor="#475569"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                    </View>

                    <TouchableOpacity
                        className="bg-teal-500 rounded-2xl py-4 items-center mt-2 shadow-lg shadow-teal-500/30"
                        onPress={handleLogin}
                        disabled={loading}
                        activeOpacity={0.8}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-white font-bold text-base">Sign In</Text>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Footer */}
                <View className="flex-row justify-center mt-8 gap-1">
                    <Text className="text-slate-400 text-sm">Don't have an account?</Text>
                    <TouchableOpacity onPress={() => router.push('/auth/signup')}>
                        <Text className="text-teal-400 font-bold text-sm">Sign Up</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
