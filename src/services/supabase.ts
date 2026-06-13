import { createClient, SupabaseClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import type { Reminder } from '../types';

let _client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (_client) return _client;
  const url = Constants.expoConfig?.extra?.supabaseUrl ?? process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
  const key = Constants.expoConfig?.extra?.supabaseAnonKey ?? process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';
  _client = createClient(url, key);
  return _client;
}

function toRow(reminder: Reminder, userId: string) {
  return {
    id: reminder.id,
    user_id: userId,
    title: reminder.title,
    category: reminder.category,
    due_date: reminder.dueDate,
    amount: reminder.amount ?? null,
    currency: reminder.currency ?? null,
    contact: reminder.contact ?? null,
    lead_times: reminder.leadTimes,
    notes: reminder.notes ?? null,
    is_archived: reminder.isArchived,
    calendar_event_id: reminder.calendarEventId ?? null,
    notification_ids: reminder.notificationIds ?? [],
    created_at: reminder.createdAt,
    updated_at: reminder.updatedAt,
  };
}

function fromRow(row: Record<string, unknown>): Reminder {
  return {
    id: row.id as string,
    title: row.title as string,
    category: row.category as Reminder['category'],
    dueDate: row.due_date as string,
    amount: row.amount as number | undefined,
    currency: row.currency as string | undefined,
    contact: row.contact as Reminder['contact'] | undefined,
    leadTimes: row.lead_times as Reminder['leadTimes'],
    notes: row.notes as string | undefined,
    isArchived: Boolean(row.is_archived),
    calendarEventId: row.calendar_event_id as string | undefined,
    notificationIds: row.notification_ids as string[] | undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export async function pushRemindersToCloud(reminders: Reminder[], userId: string): Promise<void> {
  const client = getClient();
  const rows = reminders.map((r) => toRow(r, userId));
  const { error } = await client.from('reminders').upsert(rows, { onConflict: 'id' });
  if (error) throw new Error(`Supabase push failed: ${error.message}`);
}

export async function pullRemindersFromCloud(userId: string): Promise<Reminder[]> {
  const client = getClient();
  const { data, error } = await client
    .from('reminders')
    .select('*')
    .eq('user_id', userId);
  if (error) throw new Error(`Supabase pull failed: ${error.message}`);
  return (data ?? []).map(fromRow);
}
