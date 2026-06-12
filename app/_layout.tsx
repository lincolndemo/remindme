import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { getDb } from '../src/db/migrations';
import { useReminderStore } from '../src/store/reminders';

export default function RootLayout() {
  const loadReminders = useReminderStore((s) => s.loadReminders);

  useEffect(() => {
    getDb().then(() => loadReminders());
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="reminder/new" options={{ title: 'New Reminder', presentation: 'modal' }} />
          <Stack.Screen name="reminder/[id]" options={{ title: 'Edit Reminder', presentation: 'modal' }} />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
