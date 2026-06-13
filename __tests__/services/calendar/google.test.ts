global.fetch = jest.fn();

import { pushReminderToGoogleCalendar, pullGoogleCalendarEvents } from '../../../src/services/calendar/google';
import type { Reminder } from '../../../src/types';

const reminder: Reminder = {
  id: 'r1', title: 'Doctor appointment', category: 'appointment',
  dueDate: '2026-07-15T14:00:00.000Z', leadTimes: [],
  isArchived: false, createdAt: '', updatedAt: '',
};

beforeEach(() => { (fetch as jest.Mock).mockReset(); });

describe('pushReminderToGoogleCalendar', () => {
  it('returns event id on success', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'google-event-123' }),
    });
    const eventId = await pushReminderToGoogleCalendar(reminder, 'access-token');
    expect(eventId).toBe('google-event-123');
  });

  it('throws on API error', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => ({ error: { message: 'Unauthorized' } }),
    });
    await expect(pushReminderToGoogleCalendar(reminder, 'bad-token')).rejects.toThrow('Unauthorized');
  });
});

describe('pullGoogleCalendarEvents', () => {
  it('returns array of reminder drafts from calendar events', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        items: [{
          id: 'evt1', summary: 'Team meeting',
          start: { dateTime: '2026-07-16T10:00:00Z' },
          end: { dateTime: '2026-07-16T11:00:00Z' },
        }],
      }),
    });
    const drafts = await pullGoogleCalendarEvents('access-token');
    expect(drafts).toHaveLength(1);
    expect(drafts[0].title).toBe('Team meeting');
    expect(drafts[0].category).toBe('appointment');
  });
});
