import { useCallback, useRef, useState } from 'react';
import { useAuthStore } from '../store/auth';
import { useReminderStore } from '../store/reminders';
import { pushRemindersToCloud, pullRemindersFromCloud } from '../services/supabase';
import { pushReminderToGoogleCalendar, pullGoogleCalendarEvents } from '../services/calendar/google';
import { insertReminder, updateReminder } from '../db/reminders';
import { isTokenValid } from '../services/auth';

export function useSync() {
  const syncingRef = useRef(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const { googleTokens, connectedCalendars } = useAuthStore();
  const { reminders, loadReminders } = useReminderStore();

  const sync = useCallback(async () => {
    if (syncingRef.current) return;
    syncingRef.current = true;
    setIsSyncing(true);
    try {
      // 1. Cloud backup (Supabase)
      if (googleTokens && isTokenValid(googleTokens) && googleTokens.userId) {
        await pushRemindersToCloud(reminders, googleTokens.userId);
        const cloudReminders = await pullRemindersFromCloud(googleTokens.userId);
        for (const cr of cloudReminders) {
          const exists = reminders.find((r) => r.id === cr.id);
          if (!exists) await insertReminder(cr);
        }
      }

      // 2. Google Calendar
      if (connectedCalendars.google && googleTokens && isTokenValid(googleTokens)) {
        for (const r of reminders) {
          if (!r.calendarEventId && !r.isArchived) {
            const eventId = await pushReminderToGoogleCalendar(r, googleTokens.accessToken);
            await updateReminder(r.id, { calendarEventId: eventId });
          }
        }
        const drafts = await pullGoogleCalendarEvents(googleTokens.accessToken);
        for (const d of drafts) {
          const exists = reminders.some(
            (r) => r.title === d.title && r.dueDate.startsWith(d.dueDate.substring(0, 10))
          );
          if (!exists) await insertReminder(d);
        }
      }

      await loadReminders();
      setLastSyncedAt(new Date());
    } finally {
      syncingRef.current = false;
      setIsSyncing(false);
    }
  }, [googleTokens, connectedCalendars, reminders, loadReminders]);

  return { sync, isSyncing, lastSyncedAt };
}
