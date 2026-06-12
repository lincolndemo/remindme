import type { LeadTime, ReminderCategory } from '../types';

export const ALL_CATEGORIES: ReminderCategory[] = [
  'appointment', 'payment', 'loan', 'birthday', 'task', 'follow-up', 'custom',
];

interface CategoryConfig {
  label: string;
  icon: string;      // @expo/vector-icons Ionicons name
  color: string;
}

const CATEGORY_CONFIG: Record<ReminderCategory, CategoryConfig> = {
  appointment: { label: 'Appointment', icon: 'calendar-outline',         color: '#6C47FF' },
  payment:     { label: 'Payment',     icon: 'card-outline',              color: '#00B37E' },
  loan:        { label: 'Loan',        icon: 'people-outline',            color: '#F97316' },
  birthday:    { label: 'Birthday',    icon: 'gift-outline',              color: '#EC4899' },
  task:        { label: 'Task',        icon: 'checkmark-circle-outline',  color: '#3B82F6' },
  'follow-up': { label: 'Follow-up',  icon: 'refresh-outline',           color: '#A855F7' },
  custom:      { label: 'Custom',      icon: 'ellipse-outline',           color: '#6B7280' },
};

export function getCategoryConfig(category: ReminderCategory): CategoryConfig {
  return CATEGORY_CONFIG[category];
}

export const DEFAULT_LEAD_TIMES: Record<ReminderCategory, LeadTime[]> = {
  appointment: [{ value: 1, unit: 'days' }, { value: 30, unit: 'minutes' }],
  payment:     [{ value: 3, unit: 'days' }, { value: 1, unit: 'days' }],
  loan:        [{ value: 3, unit: 'days' }, { value: 1, unit: 'days' }],
  birthday:    [{ value: 7, unit: 'days' }, { value: 1, unit: 'days' }],
  task:        [{ value: 1, unit: 'hours' }],
  'follow-up': [{ value: 1, unit: 'days' }],
  custom:      [{ value: 1, unit: 'hours' }],
};
