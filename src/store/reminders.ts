import { create } from 'zustand';
import * as db from '../db/reminders';
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
    const reminders = await db.getReminders();
    set({ reminders, isLoading: false });
  },

  addReminder: async (draft) => {
    const reminder = await db.insertReminder(draft);
    set((s) => ({ reminders: [...s.reminders, reminder] }));
    return reminder;
  },

  updateReminder: async (id, changes) => {
    const updated = await db.updateReminder(id, changes);
    set((s) => ({
      reminders: s.reminders.map((r) => (r.id === id ? updated : r)),
    }));
  },

  archiveReminder: async (id) => {
    await db.archiveReminder(id);
    set((s) => ({ reminders: s.reminders.filter((r) => r.id !== id) }));
  },
}));
