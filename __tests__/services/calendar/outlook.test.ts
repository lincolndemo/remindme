global.fetch = jest.fn();

import { pushReminderToOutlook, pullOutlookCalendarEvents } from '../../../src/services/calendar/outlook';
import type { Reminder } from '../../../src/types';

const reminder: Reminder = {
  id: 'r1', title: 'Client call', category: 'appointment',
  dueDate: '2026-07-15T14:00:00.000Z', leadTimes: [],
  isArchived: false, createdAt: '', updatedAt: '',
};

beforeEach(() => { (fetch as jest.Mock).mockReset(); });

describe('pushReminderToOutlook', () => {
  it('returns event id on success', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'outlook-event-abc' }),
    });
    const eventId = await pushReminderToOutlook(reminder, 'access-token');
    expect(eventId).toBe('outlook-event-abc');
  });

  it('throws on API error', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => ({ error: { message: 'Token expired' } }),
    });
    await expect(pushReminderToOutlook(reminder, 'bad-token')).rejects.toThrow('Token expired');
  });
});

describe('pullOutlookCalendarEvents', () => {
  it('returns array of reminder drafts', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        value: [{
          id: 'evt2', subject: 'Budget review',
          start: { dateTime: '2026-07-17T09:00:00', timeZone: 'UTC' },
          end: { dateTime: '2026-07-17T10:00:00', timeZone: 'UTC' },
        }],
      }),
    });
    const drafts = await pullOutlookCalendarEvents('access-token');
    expect(drafts).toHaveLength(1);
    expect(drafts[0].title).toBe('Budget review');
    expect(drafts[0].category).toBe('appointment');
  });
});
