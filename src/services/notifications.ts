import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import type { Reminder } from '../types';
import { computeFireDate } from '../utils/leadTimes';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function requestNotificationPermission(): Promise<boolean> {
  if (!Device.isDevice) return false;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleNotificationsForReminder(reminder: Reminder): Promise<string[]> {
  const now = Date.now();
  const ids: string[] = [];

  const fireDates: Array<{ date: string; label: string }> = [
    ...reminder.leadTimes.map((lt) => ({
      date: computeFireDate(reminder.dueDate, lt),
      label: `${lt.value} ${lt.unit} before: ${reminder.title}`,
    })),
    { date: reminder.dueDate, label: `Due now: ${reminder.title}` },
  ];

  for (const { date, label } of fireDates) {
    const fireMs = new Date(date).getTime();
    if (fireMs <= now) continue;

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Remind Me Jo',
        body: label,
        data: { reminderId: reminder.id },
        ...(reminder.contact?.phone
          ? { categoryIdentifier: 'REMINDER_WITH_WHATSAPP' }
          : {}),
      },
      trigger: { date: new Date(fireMs) } as any,
    });
    ids.push(id);
  }

  return ids;
}

export async function cancelNotificationsForReminder(notificationIds: string[]): Promise<void> {
  await Promise.all(notificationIds.map((id) => Notifications.cancelScheduledNotificationAsync(id)));
}

export async function snoozeNotification(title: string, reminderId: string): Promise<string> {
  const snoozeDate = new Date(Date.now() + 60 * 60 * 1000);
  return Notifications.scheduleNotificationAsync({
    content: {
      title: 'Remind Me Jo — Snoozed',
      body: title,
      data: { reminderId },
    },
    trigger: { date: snoozeDate } as any,
  });
}
