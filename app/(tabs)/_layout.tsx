import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: '#6C47FF', tabBarShowLabel: true }}>
      <Tabs.Screen
        name="index"
        options={{ title: 'Reminders', tabBarIcon: ({ color }) => <Ionicons name="home-outline" size={22} color={color} /> }}
      />
      <Tabs.Screen
        name="archive"
        options={{ title: 'Archive', tabBarIcon: ({ color }) => <Ionicons name="archive-outline" size={22} color={color} /> }}
      />
      <Tabs.Screen
        name="settings"
        options={{ title: 'Settings', tabBarIcon: ({ color }) => <Ionicons name="settings-outline" size={22} color={color} /> }}
      />
    </Tabs>
  );
}
