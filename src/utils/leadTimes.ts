import type { LeadTime } from '../types';

const MS_PER: Record<LeadTime['unit'], number> = {
  minutes: 60 * 1000,
  hours:   60 * 60 * 1000,
  days:    24 * 60 * 60 * 1000,
  weeks:   7 * 24 * 60 * 60 * 1000,
};

export function leadTimeToMs(lt: LeadTime): number {
  return lt.value * MS_PER[lt.unit];
}

export function computeFireDate(dueDate: string, lt: LeadTime): string {
  const offset = leadTimeToMs(lt);
  if (offset === 0) return dueDate;
  return new Date(new Date(dueDate).getTime() - offset).toISOString();
}
