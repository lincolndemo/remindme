jest.mock('expo-notifications', () => ({
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  scheduleNotificationAsync: jest.fn().mockResolvedValue('notif-id-123'),
  cancelScheduledNotificationAsync: jest.fn().mockResolvedValue(undefined),
  setNotificationHandler: jest.fn(),
  AndroidImportance: { HIGH: 4 },
}));
jest.mock('expo-device', () => ({ isDevice: true }));

import * as Notifications from 'expo-notifications';
import {
  requestNotificationPermission,
  scheduleNotificationsForReminder,
  cancelNotificationsForReminder,
  snoozeNotification,
} from '../../src/services/notifications';
import type { Reminder } from '../../src/types';

const reminder: Reminder = {
  id: 'r1', title: 'Pay Claude', category: 'payment',
  dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
  leadTimes: [{ value: 3, unit: 'days' }, { value: 1, unit: 'days' }],
  isArchived: false, createdAt: '', updatedAt: '',
};

beforeEach(() => { jest.clearAllMocks(); });

describe('requestNotificationPermission', () => {
  it('returns true when granted', async () => {
    const result = await requestNotificationPermission();
    expect(result).toBe(true);
  });
});

describe('scheduleNotificationsForReminder', () => {
  it('schedules one notification per lead time plus one on due date', async () => {
    const ids = await scheduleNotificationsForReminder(reminder);
    // 2 lead times + 1 due date = 3
    expect(ids).toHaveLength(3);
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(3);
  });

  it('skips past fire dates', async () => {
    const pastReminder = { ...reminder, dueDate: new Date(Date.now() - 1000).toISOString() };
    const ids = await scheduleNotificationsForReminder(pastReminder);
    expect(ids).toHaveLength(0);
  });
});

describe('cancelNotificationsForReminder', () => {
  it('calls cancel for each stored notification id', async () => {
    await cancelNotificationsForReminder(['id1', 'id2', 'id3']);
    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledTimes(3);
  });
});

describe('snoozeNotification', () => {
  it('schedules a notification 1 hour from now', async () => {
    const id = await snoozeNotification('Pay Claude', 'r1');
    expect(id).toBe('notif-id-123');
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.objectContaining({ body: 'Pay Claude' }),
      })
    );
  });
});
