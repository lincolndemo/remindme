import React, { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { getDb } from '../src/db/migrations';
import { useReminderStore } from '../src/store/reminders';
import { useAuthStore } from '../src/store/auth';
import { useSync } from '../src/hooks/useSync';
import { snoozeNotification } from '../src/services/notifications';
import { openWhatsApp } from '../src/services/whatsapp';
import { getReminders } from '../src/db/reminders';

async function registerNotificationCategories() {
  if (typeof Notifications.setNotificationCategoryAsync !== 'function') return;
  await Notifications.setNotificationCategoryAsync('REMINDER_WITH_WHATSAPP', [
    { identifier: 'SNOOZE', buttonTitle: 'Snooze 1hr', options: { isDestructive: false } },
    { identifier: 'WHATSAPP', buttonTitle: 'Send WhatsApp', options: { isDestructive: false } },
  ]);
  await Notifications.setNotificationCategoryAsync('REMINDER_DEFAULT', [
    { identifier: 'SNOOZE', buttonTitle: 'Snooze 1hr', options: { isDestructive: false } },
  ]);
}

function SyncManager() {
  const { sync } = useSync();
  const appState = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      if (appState.current.match(/inactive|background/) && next === 'active') {
        sync();
      }
      appState.current = next;
    });
    return () => sub.remove();
  }, [sync]);

  return null;
}

export default function RootLayout() {
  const loadReminders = useReminderStore((s) => s.loadReminders);
  const loadStoredAuth = useAuthStore((s) => s.loadStoredAuth);
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    getDb().then(() => Promise.all([loadReminders(), loadStoredAuth()]));
    registerNotificationCategories();

    notificationListener.current = Notifications.addNotificationReceivedListener(() => {
      loadReminders();
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      async (response) => {
        const reminderId = response.notification.request.content.data?.reminderId as string;
        const actionId = response.actionIdentifier;

        if (actionId === 'SNOOZE' && reminderId) {
          const title = response.notification.request.content.body ?? 'Reminder';
          await snoozeNotification(title, reminderId);
          return;
        }

        if (actionId === 'WHATSAPP' && reminderId) {
          const all = await getReminders({ includeArchived: true });
          const reminder = all.find((r) => r.id === reminderId);
          if (reminder) await openWhatsApp(reminder);
          return;
        }

        if (reminderId) {
          router.push(`/reminder/${reminderId}`);
        }
      }
    );

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <SyncManager />
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="reminder/new" options={{ title: 'New Reminder', presentation: 'modal' }} />
          <Stack.Screen name="reminder/[id]" options={{ title: 'Edit Reminder', presentation: 'modal' }} />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
