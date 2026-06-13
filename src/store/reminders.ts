import { create } from 'zustand';
import * as db from '../db/reminders';
import { scheduleNotificationsForReminder, cancelNotificationsForReminder } from '../services/notifications';
import { updateNotificationIds } from '../db/reminders';
import type { Reminder, ReminderDraft } from '../types';

interface ReminderStore {
  reminders: Reminder[];
  isLoading: boolean;
  loadReminders: () => Promise<void>;
  addReminder: (draft: ReminderDraft) => Promise<Reminder>;
  updateReminder: (id: string, changes: Partial<Reminder>) => Promise<void>;
  archiveReminder: (id: string) => Promise<void>;
}

export const useReminderStore = create<ReminderStore>()((set, get) => ({
  reminders: [],
  isLoading: false,

  loadReminders: async () => {
    set({ isLoading: true });
    try {
      const reminders = await db.getReminders();
      set({ reminders });
    } finally {
      set({ isLoading: false });
    }
  },

  addReminder: async (draft) => {
    const reminder = await db.insertReminder(draft);
    const notificationIds = await scheduleNotificationsForReminder(reminder);
    await updateNotificationIds(reminder.id, notificationIds);
    const withIds = { ...reminder, notificationIds };
    set((s) => ({ reminders: [...s.reminders, withIds] }));
    return withIds;
  },

  updateReminder: async (id, changes) => {
    const existing = get().reminders.find((r) => r.id === id);
    if (existing?.notificationIds?.length) {
      await cancelNotificationsForReminder(existing.notificationIds);
    }
    const updated = await db.updateReminder(id, changes);
    const notificationIds = await scheduleNotificationsForReminder(updated);
    await updateNotificationIds(id, notificationIds);
    const withIds = { ...updated, notificationIds };
    set((s) => ({ reminders: s.reminders.map((r) => (r.id === id ? withIds : r)) }));
  },

  archiveReminder: async (id) => {
    const existing = get().reminders.find((r) => r.id === id);
    if (existing?.notificationIds?.length) {
      await cancelNotificationsForReminder(existing.notificationIds);
    }
    await db.archiveReminder(id);
    set((s) => ({ reminders: s.reminders.filter((r) => r.id !== id) }));
  },
}));
