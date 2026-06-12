import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import type { GroupedReminders, Reminder } from '../types';

dayjs.extend(isSameOrBefore);

export function isToday(isoDate: string): boolean {
  return dayjs(isoDate).isSame(dayjs(), 'day');
}

export function isThisWeek(isoDate: string): boolean {
  const d = dayjs(isoDate);
  const now = dayjs();
  return !d.isSame(now, 'day') && d.isAfter(now) && d.isBefore(now.add(7, 'day'));
}

export function formatRelativeTime(isoDate: string): string {
  const d = dayjs(isoDate);
  const now = dayjs();
  if (d.isBefore(now, 'day')) return 'Overdue';
  if (d.isSame(now, 'day')) return 'Today';
  if (d.isSame(now.add(1, 'day'), 'day')) return 'Tomorrow';
  if (d.isBefore(now.add(7, 'day'))) return d.format('dddd');
  return d.format('MMM D');
}

export function groupRemindersByTimeframe(reminders: Reminder[]): GroupedReminders {
  const active = reminders.filter((r) => !r.isArchived);
  const now = dayjs();
  return {
    overdue: active.filter((r) => dayjs(r.dueDate).isBefore(now, 'day')),
    today: active.filter((r) => isToday(r.dueDate)),
    thisWeek: active.filter((r) => isThisWeek(r.dueDate)),
    upcoming: active.filter((r) => {
      const d = dayjs(r.dueDate);
      return !d.isBefore(now, 'day') && !isToday(r.dueDate) && !isThisWeek(r.dueDate);
    }),
  };
}
