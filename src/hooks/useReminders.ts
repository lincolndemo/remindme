import { useReminderStore } from '../store/reminders';
import { groupRemindersByTimeframe } from '../utils/dates';

export function useReminders() {
  const { reminders, isLoading, addReminder, updateReminder, archiveReminder, loadReminders } =
    useReminderStore();
  return {
    reminders,
    grouped: groupRemindersByTimeframe(reminders),
    isLoading,
    addReminder,
    updateReminder,
    archiveReminder,
    loadReminders,
  };
}
