const mockCreate = jest.fn();

jest.mock('@anthropic-ai/sdk', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    messages: {
      create: mockCreate,
    },
  })),
}));

import Anthropic from '@anthropic-ai/sdk';
import { parseReminderFromText } from '../../src/services/nlp';

beforeEach(() => {
  jest.clearAllMocks();
  (Anthropic as jest.Mock).mockImplementation(() => ({ messages: { create: mockCreate } }));
});

describe('parseReminderFromText', () => {
  it('parses a payment reminder correctly', async () => {
    mockCreate.mockResolvedValue({
      content: [{ type: 'text', text: JSON.stringify({
        title: 'Claude subscription payment',
        category: 'payment',
        dueDate: '2026-07-12T00:00:00.000Z',
        leadTimes: [{ value: 3, unit: 'days' }, { value: 1, unit: 'days' }],
        confidence: 0.95,
      })}],
    });
    const result = await parseReminderFromText('I just paid Claude subscription today remind me in 30 days');
    expect(result.category).toBe('payment');
    expect(result.title).toContain('Claude');
    expect(result.confidence).toBeGreaterThan(0.8);
  });

  it('parses a loan reminder with contact and amount', async () => {
    mockCreate.mockResolvedValue({
      content: [{ type: 'text', text: JSON.stringify({
        title: 'Loan from Sola',
        category: 'loan',
        dueDate: '2026-07-15T00:00:00.000Z',
        amount: 20000,
        currency: 'NGN',
        contactName: 'Sola',
        leadTimes: [{ value: 3, unit: 'days' }, { value: 1, unit: 'days' }],
        confidence: 0.92,
      })}],
    });
    const result = await parseReminderFromText('I just borrowed Sola 20k I want to remind her by July 15');
    expect(result.contactName).toBe('Sola');
    expect(result.amount).toBe(20000);
    expect(result.category).toBe('loan');
  });

  it('throws NLPParseError when response is invalid JSON', async () => {
    mockCreate.mockResolvedValue({
      content: [{ type: 'text', text: 'not json at all' }],
    });
    await expect(parseReminderFromText('some text')).rejects.toThrow('NLPParseError');
  });
});
