import dayjs from 'dayjs';
import type { Reminder, ReminderDraft } from '../../types';
import { DEFAULT_LEAD_TIMES } from '../../utils/categories';

const BASE = 'https://www.googleapis.com/calendar/v3';

async function calendarFetch(path: string, accessToken: string, options?: RequestInit) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...(options?.headers ?? {}),
    },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message ?? 'Google Calendar API error');
  return json;
}

export async function pushReminderToGoogleCalendar(
  reminder: Reminder,
  accessToken: string
): Promise<string> {
  const event = {
    summary: reminder.title,
    description: reminder.notes ?? '',
    start: { dateTime: reminder.dueDate },
    end: { dateTime: dayjs(reminder.dueDate).add(1, 'hour').toISOString() },
    reminders: {
      useDefault: false,
      overrides: reminder.leadTimes.map((lt) => ({
        method: 'popup',
        minutes: lt.unit === 'minutes' ? lt.value
          : lt.unit === 'hours' ? lt.value * 60
          : lt.unit === 'days' ? lt.value * 60 * 24
          : lt.value * 60 * 24 * 7,
      })),
    },
  };

  const method = reminder.calendarEventId ? 'PUT' : 'POST';
  const path = reminder.calendarEventId
    ? `/calendars/primary/events/${reminder.calendarEventId}`
    : '/calendars/primary/events';

  const data = await calendarFetch(path, accessToken, {
    method,
    body: JSON.stringify(event),
  });

  return data.id;
}

export async function pullGoogleCalendarEvents(accessToken: string): Promise<ReminderDraft[]> {
  const timeMin = new Date().toISOString();
  const timeMax = dayjs().add(30, 'day').toISOString();

  const data = await calendarFetch(
    `/calendars/primary/events?timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}&singleEvents=true&orderBy=startTime`,
    accessToken
  );

  return (data.items ?? []).map((item: Record<string, unknown>) => {
    const startObj = item.start as Record<string, string>;
    const dueDate = startObj.dateTime ?? startObj.date ?? new Date().toISOString();
    return {
      title: (item.summary as string) ?? 'Calendar Event',
      category: 'appointment' as const,
      dueDate,
      leadTimes: DEFAULT_LEAD_TIMES['appointment'],
      notes: (item.description as string) || undefined,
    } satisfies ReminderDraft;
  });
}
