import dayjs from 'dayjs';
import type { Reminder, ReminderDraft } from '../../types';
import { DEFAULT_LEAD_TIMES } from '../../utils/categories';

const BASE = 'https://graph.microsoft.com/v1.0/me';

async function graphFetch(path: string, accessToken: string, options?: RequestInit) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...(options?.headers ?? {}),
    },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message ?? 'Microsoft Graph API error');
  return json;
}

export async function pushReminderToOutlook(
  reminder: Reminder,
  accessToken: string
): Promise<string> {
  const event = {
    subject: reminder.title,
    body: { contentType: 'text', content: reminder.notes ?? '' },
    start: { dateTime: reminder.dueDate, timeZone: 'UTC' },
    end: { dateTime: dayjs(reminder.dueDate).add(1, 'hour').toISOString(), timeZone: 'UTC' },
    isReminderOn: true,
    reminderMinutesBeforeStart: reminder.leadTimes[0]
      ? reminder.leadTimes[0].unit === 'minutes' ? reminder.leadTimes[0].value
        : reminder.leadTimes[0].unit === 'hours' ? reminder.leadTimes[0].value * 60
        : reminder.leadTimes[0].unit === 'days' ? reminder.leadTimes[0].value * 60 * 24
        : reminder.leadTimes[0].value * 60 * 24 * 7
      : 60,
  };

  const method = reminder.calendarEventId ? 'PATCH' : 'POST';
  const path = reminder.calendarEventId
    ? `/events/${reminder.calendarEventId}`
    : '/events';

  const data = await graphFetch(path, accessToken, {
    method,
    body: JSON.stringify(event),
  });

  return data.id;
}

export async function pullOutlookCalendarEvents(accessToken: string): Promise<ReminderDraft[]> {
  const start = new Date().toISOString();
  const end = dayjs().add(30, 'day').toISOString();

  const data = await graphFetch(
    `/calendarView?startDateTime=${encodeURIComponent(start)}&endDateTime=${encodeURIComponent(end)}&$select=id,subject,start,end,body`,
    accessToken
  );

  return (data.value ?? []).map((item: Record<string, unknown>) => {
    const startObj = item.start as Record<string, string>;
    return {
      title: (item.subject as string) ?? 'Outlook Event',
      category: 'appointment' as const,
      dueDate: new Date(startObj.dateTime + 'Z').toISOString(),
      leadTimes: DEFAULT_LEAD_TIMES['appointment'],
      notes: (item.body as Record<string, string>)?.content || undefined,
    } satisfies ReminderDraft;
  });
}
