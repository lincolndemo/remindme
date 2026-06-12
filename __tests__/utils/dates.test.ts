import dayjs from 'dayjs';
import { isToday, isThisWeek, groupRemindersByTimeframe, formatRelativeTime } from '../../src/utils/dates';
import type { Reminder } from '../../src/types';

const makeReminder = (dueDate: string): Reminder => ({
  id: '1', title: 'Test', category: 'task', dueDate,
  leadTimes: [], isArchived: false,
  createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
});

describe('isToday', () => {
  it('returns true for a date that is today', () => {
    expect(isToday(new Date().toISOString())).toBe(true);
  });
  it('returns false for yesterday', () => {
    expect(isToday(dayjs().subtract(1, 'day').toISOString())).toBe(false);
  });
  it('returns false for tomorrow', () => {
    expect(isToday(dayjs().add(1, 'day').toISOString())).toBe(false);
  });
});

describe('isThisWeek', () => {
  it('returns true for 3 days from now', () => {
    expect(isThisWeek(dayjs().add(3, 'day').toISOString())).toBe(true);
  });
  it('returns false for 8 days from now', () => {
    expect(isThisWeek(dayjs().add(8, 'day').toISOString())).toBe(false);
  });
  it('returns false for past dates', () => {
    expect(isThisWeek(dayjs().subtract(1, 'day').toISOString())).toBe(false);
  });
});

describe('groupRemindersByTimeframe', () => {
  it('groups overdue, today, thisWeek, upcoming correctly', () => {
    const reminders = [
      makeReminder(dayjs().subtract(1, 'day').toISOString()),
      makeReminder(dayjs().add(2, 'hour').toISOString()),
      makeReminder(dayjs().add(4, 'day').toISOString()),
      makeReminder(dayjs().add(14, 'day').toISOString()),
    ];
    const grouped = groupRemindersByTimeframe(reminders);
    expect(grouped.overdue).toHaveLength(1);
    expect(grouped.today).toHaveLength(1);
    expect(grouped.thisWeek).toHaveLength(1);
    expect(grouped.upcoming).toHaveLength(1);
  });

  it('excludes archived reminders', () => {
    const archived = { ...makeReminder(dayjs().add(2, 'hour').toISOString()), isArchived: true };
    const grouped = groupRemindersByTimeframe([archived]);
    expect(grouped.today).toHaveLength(0);
  });
});

describe('formatRelativeTime', () => {
  it('returns "Today" for dates within today', () => {
    expect(formatRelativeTime(dayjs().add(2, 'hour').toISOString())).toBe('Today');
  });
  it('returns "Tomorrow" for dates within tomorrow', () => {
    expect(formatRelativeTime(dayjs().add(1, 'day').toISOString())).toBe('Tomorrow');
  });
  it('returns "Overdue" for past dates', () => {
    expect(formatRelativeTime(dayjs().subtract(1, 'day').toISOString())).toBe('Overdue');
  });
  it('returns day name for dates within this week', () => {
    const threeDays = dayjs().add(3, 'day');
    expect(formatRelativeTime(threeDays.toISOString())).toBe(threeDays.format('dddd'));
  });
});
