export type ReminderCategory =
  | 'appointment'
  | 'payment'
  | 'loan'
  | 'birthday'
  | 'task'
  | 'follow-up'
  | 'custom';

export type LeadTimeUnit = 'minutes' | 'hours' | 'days' | 'weeks';

export interface LeadTime {
  value: number;
  unit: LeadTimeUnit;
}

export interface ContactLink {
  contactId?: string;
  name: string;
  phone?: string;
}

export interface Reminder {
  id: string;
  title: string;
  category: ReminderCategory;
  dueDate: string;        // ISO 8601 e.g. "2026-07-15T14:00:00.000Z"
  amount?: number;
  currency?: string;      // e.g. "NGN"
  contact?: ContactLink;
  leadTimes: LeadTime[];
  notes?: string;
  isArchived: boolean;
  calendarEventId?: string;
  notificationIds?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ReminderDraft extends Omit<Reminder, 'id' | 'createdAt' | 'updatedAt' | 'isArchived'> {}

export type TimeGroup = 'today' | 'thisWeek' | 'upcoming' | 'overdue';

export interface GroupedReminders {
  overdue: Reminder[];
  today: Reminder[];
  thisWeek: Reminder[];
  upcoming: Reminder[];
}

export interface NLPResult {
  title: string;
  category: ReminderCategory;
  dueDate: string;
  amount?: number;
  currency?: string;
  contactName?: string;
  leadTimes: LeadTime[];
  notes?: string;
  confidence: number;
}
