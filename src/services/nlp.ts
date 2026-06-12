import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import Constants from 'expo-constants';
import type { NLPResult } from '../types';
import { DEFAULT_LEAD_TIMES } from '../utils/categories';

const NLPResultSchema = z.object({
  title: z.string(),
  category: z.enum(['appointment', 'payment', 'loan', 'birthday', 'task', 'follow-up', 'custom']),
  dueDate: z.string(),
  amount: z.number().optional(),
  currency: z.string().optional(),
  contactName: z.string().optional(),
  leadTimes: z.array(z.object({ value: z.number(), unit: z.enum(['minutes', 'hours', 'days', 'weeks']) })),
  confidence: z.number().min(0).max(1),
});

const SYSTEM_PROMPT = `You are a reminder parser. Extract structured reminder information from natural language.
Today's date is ${new Date().toISOString().split('T')[0]}.

Return ONLY valid JSON matching this schema — no markdown, no explanation:
{
  "title": "concise reminder title",
  "category": "appointment|payment|loan|birthday|task|follow-up|custom",
  "dueDate": "ISO 8601 date string",
  "amount": number or omit,
  "currency": "NGN" or omit,
  "contactName": "person's name" or omit,
  "leadTimes": [{"value": number, "unit": "minutes|hours|days|weeks"}],
  "confidence": 0.0-1.0
}

Rules:
- For "remind me in X days/weeks", calculate dueDate from today
- Default currency is NGN if an amount is mentioned without currency
- If no lead times specified, use category defaults: appointments=[1 day, 30 min], payments=[3 days, 1 day], loans=[3 days, 1 day]
- Category "loan" covers both borrowing and lending
- Confidence < 0.5 means you couldn't reliably parse the input`;

export class NLPParseError extends Error {
  constructor(message: string) { super(`NLPParseError: ${message}`); this.name = 'NLPParseError'; }
}

export async function parseReminderFromText(text: string): Promise<NLPResult> {
  const apiKey = Constants.expoConfig?.extra?.anthropicApiKey ?? process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;
  const client = new Anthropic({ apiKey });

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 512,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: text }],
  });

  const rawText = response.content.find((c) => c.type === 'text')?.text ?? '';

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    throw new NLPParseError(`Failed to parse NLP response as JSON: ${rawText}`);
  }

  const result = NLPResultSchema.safeParse(parsed);
  if (!result.success) {
    throw new NLPParseError(`NLP response failed validation: ${result.error.message}`);
  }

  return result.data as NLPResult;
}
