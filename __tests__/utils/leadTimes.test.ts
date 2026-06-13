import { leadTimeToMs, computeFireDate } from '../../src/utils/leadTimes';

describe('leadTimeToMs', () => {
  it('converts 30 minutes to 1800000ms', () => {
    expect(leadTimeToMs({ value: 30, unit: 'minutes' })).toBe(30 * 60 * 1000);
  });
  it('converts 1 hour to 3600000ms', () => {
    expect(leadTimeToMs({ value: 1, unit: 'hours' })).toBe(60 * 60 * 1000);
  });
  it('converts 3 days to correct ms', () => {
    expect(leadTimeToMs({ value: 3, unit: 'days' })).toBe(3 * 24 * 60 * 60 * 1000);
  });
  it('converts 1 week to correct ms', () => {
    expect(leadTimeToMs({ value: 1, unit: 'weeks' })).toBe(7 * 24 * 60 * 60 * 1000);
  });
});

describe('computeFireDate', () => {
  it('subtracts lead time from due date', () => {
    const dueDate = '2026-07-15T14:00:00.000Z';
    const fireDate = computeFireDate(dueDate, { value: 1, unit: 'days' });
    const expected = new Date('2026-07-14T14:00:00.000Z').getTime();
    expect(new Date(fireDate).getTime()).toBe(expected);
  });

  it('returns due date itself when lead time is zero', () => {
    const dueDate = '2026-07-15T14:00:00.000Z';
    const fireDate = computeFireDate(dueDate, { value: 0, unit: 'minutes' });
    expect(fireDate).toBe(dueDate);
  });
});
