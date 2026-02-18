import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { router } from 'expo-router';
import { Leaf, Mail, Lock, User } from 'lucide-react-native';
import { supabase } from '../../utils/supabase';

export default function Signup() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSignup = async () => {
        if (!name || !email || !password) {
            Alert.alert('Error', 'Please fill in all fields.');
            return;
        }
        if (password.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters.');
            return;
        }
        setLoading(true);
        try {
            // 1. Create auth user
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: { data: { name } },
            });
            if (authError) throw authError;

            // 2. Insert into users table (the trigger handles this, but we do it manually as fallback)
            if (authData.user) {
                const { error: profileError } = await supabase.from('users').upsert({
                    id: authData.user.id,
                    name,
                    email,
                });
                if (profileError) console.warn('Profile insert warning:', profileError.message);
            }
        } catch (error) {
            Alert.alert('Signup Failed', error.message);
        } finally {
            setLoading(false);
        }
        // Navigation handled by _layout.js auth listener
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-900">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24 }} keyboardShouldPersistTaps="handled">
                    {/* Logo */}
                    <View className="items-center mb-12">
                        <View className="w-20 h-20 rounded-3xl bg-teal-500/15 border border-teal-500/30 items-center justify-center mb-4">
                            <Leaf size={40} color="#2dd4bf" />
                        </View>
                        <Text className="text-white text-3xl font-black">Join EcoSphere</Text>
                        <Text className="text-slate-400 text-sm mt-1">Start your green journey today 🌱</Text>
                    </View>

                    {/* Form */}
                    <View className="gap-4">
                        <View className="bg-slate-800 rounded-2xl flex-row items-center px-4 border border-slate-700/50">
                            <User size={18} color="#64748b" />
                            <TextInput
                                className="flex-1 text-white py-4 px-3 text-base"
                                placeholder="Full name"
                                placeholderTextColor="#475569"
                                value={name}
                                onChangeText={setName}
                                autoCapitalize="words"
                            />
                        </View>

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
                                placeholder="Password (min 6 chars)"
                                placeholderTextColor="#475569"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                            />
                        </View>

                        <TouchableOpacity
                            className="bg-teal-500 rounded-2xl py-4 items-center mt-2 shadow-lg shadow-teal-500/30"
                            onPress={handleSignup}
                            disabled={loading}
                            activeOpacity={0.8}
                        >
                            {loading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text className="text-white font-bold text-base">Create Account</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Footer */}
                    <View className="flex-row justify-center mt-8 gap-1">
                        <Text className="text-slate-400 text-sm">Already have an account?</Text>
                        <TouchableOpacity onPress={() => router.back()}>
                            <Text className="text-teal-400 font-bold text-sm">Sign In</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
