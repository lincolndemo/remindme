jest.mock('expo-linking', () => ({ openURL: jest.fn() }));

import * as Linking from 'expo-linking';
import { buildWhatsAppMessage, openWhatsApp } from '../../src/services/whatsapp';
import type { Reminder } from '../../src/types';

const loanReminder: Reminder = {
  id: '1', title: 'Loan from Sola', category: 'loan',
  dueDate: '2026-07-15T10:00:00.000Z',
  amount: 20000, currency: 'NGN',
  contact: { name: 'Sola', phone: '+2348012345678' },
  leadTimes: [], isArchived: false,
  createdAt: '', updatedAt: '',
};

const paymentReminder: Reminder = {
  id: '2', title: 'Claude subscription', category: 'payment',
  dueDate: '2026-07-12T00:00:00.000Z',
  leadTimes: [], isArchived: false,
  createdAt: '', updatedAt: '',
};

describe('buildWhatsAppMessage', () => {
  it('includes person name and amount for loan reminder', () => {
    const msg = buildWhatsAppMessage(loanReminder);
    expect(msg).toContain('Sola');
    expect(msg).toContain('20,000');
    expect(msg).toContain('July 15');
  });

  it('returns null for reminder with no contact phone', () => {
    const msg = buildWhatsAppMessage(paymentReminder);
    expect(msg).toBeNull();
  });
});

describe('openWhatsApp', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it('calls Linking.openURL with wa.me link', async () => {
    await openWhatsApp(loanReminder);
    expect(Linking.openURL).toHaveBeenCalledWith(
      expect.stringContaining('wa.me/2348012345678')
    );
  });

  it('does nothing when no contact phone', async () => {
    await openWhatsApp(paymentReminder);
    expect(Linking.openURL).not.toHaveBeenCalled();
  });
});
