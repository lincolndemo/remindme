const mockUpsert = jest.fn().mockResolvedValue({ error: null });
const mockEq = jest.fn().mockResolvedValue({ data: [], error: null });
const mockSelect = jest.fn().mockReturnThis();
const mockFrom = jest.fn(() => ({
  upsert: mockUpsert,
  select: mockSelect,
  eq: mockEq,
}));

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({ from: mockFrom })),
}));
jest.mock('expo-constants', () => ({
  default: { expoConfig: { extra: {} } },
}));

import { pushRemindersToCloud, pullRemindersFromCloud } from '../../src/services/supabase';
import type { Reminder } from '../../src/types';

const reminder: Reminder = {
  id: 'r1', title: 'Pay Claude', category: 'payment',
  dueDate: '2026-07-12T00:00:00.000Z', leadTimes: [],
  isArchived: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
};

beforeEach(() => { jest.clearAllMocks(); });

describe('pushRemindersToCloud', () => {
  it('calls upsert with mapped rows', async () => {
    await pushRemindersToCloud([reminder], 'user-123');
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ id: 'r1', user_id: 'user-123' })]),
      expect.any(Object)
    );
  });

  it('throws on Supabase error', async () => {
    mockUpsert.mockResolvedValueOnce({ error: { message: 'DB error' } });
    await expect(pushRemindersToCloud([reminder], 'user-123')).rejects.toThrow('DB error');
  });
});

describe('pullRemindersFromCloud', () => {
  it('returns empty array when no cloud data', async () => {
    const result = await pullRemindersFromCloud('user-123');
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(0);
  });
});
