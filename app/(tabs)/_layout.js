import { Tabs } from 'expo-router';
import { Home, PlusCircle, Map, Users, User } from 'lucide-react-native';
import { View } from 'react-native';
import { impactAsync } from '../../utils/haptics';

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: '#0f172a',
                    borderTopColor: '#1e293b',
                    height: 60,
                    paddingBottom: 8,
                    paddingTop: 8,
                },
                tabBarActiveTintColor: '#2dd4bf',
                tabBarInactiveTintColor: '#64748b',
            }}
            screenListeners={{
                tabPress: () => {
                    impactAsync();
                },
            }}
        >
            <Tabs.Screen
                name="home"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
                }}
            />
            <Tabs.Screen
                name="map"
                options={{
                    title: 'Impact',
                    tabBarIcon: ({ color, size }) => <Map color={color} size={size} />,
                }}
            />
            <Tabs.Screen
                name="log"
                options={{
                    title: 'Log',
                    tabBarIcon: ({ color }) => (
                        <View className="mb-8 bg-teal-500 rounded-full p-4 shadow-lg shadow-teal-500/40 border-4 border-slate-900">
                            <PlusCircle color="white" size={32} />
                        </View>
                    ),
                    tabBarLabelStyle: { display: 'none' },
                }}
            />
            <Tabs.Screen
                name="community"
                options={{
                    title: 'Community',
                    tabBarIcon: ({ color, size }) => <Users color={color} size={size} />,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
                }}
            />
        </Tabs>
    );
}
