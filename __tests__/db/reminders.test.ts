jest.mock('expo-sqlite', () => require('../mocks/expo-sqlite'));

import { insertReminder, getReminders, updateReminder, archiveReminder } from '../../src/db/reminders';

const sampleDraft = {
  title: 'Pay Claude',
  category: 'payment' as const,
  dueDate: '2026-07-12T10:00:00.000Z',
  leadTimes: [{ value: 3, unit: 'days' as const }],
};

describe('insertReminder', () => {
  it('returns a reminder with generated id, createdAt, and updatedAt', async () => {
    const r = await insertReminder(sampleDraft);
    expect(r.id).toBeTruthy();
    expect(r.title).toBe('Pay Claude');
    expect(r.isArchived).toBe(false);
    expect(r.createdAt).toBeTruthy();
  });
});

describe('getReminders', () => {
  it('returns array of reminders including inserted one', async () => {
    await insertReminder(sampleDraft);
    const list = await getReminders();
    expect(list.length).toBeGreaterThan(0);
    expect(list[0].title).toBe('Pay Claude');
  });
});

describe('updateReminder', () => {
  it('updates title and returns updated reminder', async () => {
    const r = await insertReminder(sampleDraft);
    const updated = await updateReminder(r.id, { title: 'Pay Claude Pro' });
    expect(updated.title).toBe('Pay Claude Pro');
  });
});

describe('archiveReminder', () => {
  it('sets isArchived to true', async () => {
    const r = await insertReminder(sampleDraft);
    await archiveReminder(r.id);
    const list = await getReminders({ includeArchived: true });
    const found = list.find((x) => x.id === r.id);
    expect(found?.isArchived).toBe(true);
  });
});
