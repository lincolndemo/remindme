jest.mock('expo-sqlite', () => require('../mocks/expo-sqlite'));
jest.mock('../../src/db/reminders');

import { useReminderStore } from '../../src/store/reminders';
import * as db from '../../src/db/reminders';

const mockReminder = {
  id: 'abc', title: 'Test', category: 'task' as const,
  dueDate: '2026-07-01T10:00:00.000Z', leadTimes: [],
  isArchived: false, createdAt: '', updatedAt: '',
};

beforeEach(() => {
  useReminderStore.setState({ reminders: [], isLoading: false });
  jest.clearAllMocks();
});

describe('loadReminders', () => {
  it('sets reminders from db', async () => {
    (db.getReminders as jest.Mock).mockResolvedValue([mockReminder]);
    await useReminderStore.getState().loadReminders();
    expect(useReminderStore.getState().reminders).toHaveLength(1);
  });
});

describe('addReminder', () => {
  it('inserts and adds to store', async () => {
    (db.insertReminder as jest.Mock).mockResolvedValue(mockReminder);
    const draft = { title: 'Test', category: 'task' as const, dueDate: '2026-07-01T10:00:00.000Z', leadTimes: [] };
    await useReminderStore.getState().addReminder(draft);
    expect(useReminderStore.getState().reminders).toHaveLength(1);
  });
});

describe('archiveReminder', () => {
  it('removes reminder from active list', async () => {
    useReminderStore.setState({ reminders: [mockReminder], isLoading: false });
    (db.archiveReminder as jest.Mock).mockResolvedValue(undefined);
    await useReminderStore.getState().archiveReminder('abc');
    expect(useReminderStore.getState().reminders).toHaveLength(0);
  });
});
