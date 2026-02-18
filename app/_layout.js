import "../global.css";
import { Stack, router, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';

export default function Layout() {
    const [session, setSession] = useState(undefined); // undefined = loading
    const segments = useSegments();

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        });

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        if (session === undefined) return; // still loading

        const inAuthGroup = segments[0] === 'auth';

        if (!session && !inAuthGroup) {
            // Not logged in → redirect to login
            router.replace('/auth/login');
        } else if (session && inAuthGroup) {
            // Logged in but on auth screen → redirect to app
            router.replace('/(tabs)/home');
        }
    }, [session, segments]);

    return (
        <>
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="auth" options={{ headerShown: false }} />
                <Stack.Screen name="onboarding" options={{ headerShown: false }} />
            </Stack>
            <StatusBar style="light" />
        </>
    );
}
