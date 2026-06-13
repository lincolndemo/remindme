import uuid from 'react-native-uuid';
import type { Reminder, ReminderDraft } from '../types';
import { getDb } from './migrations';

function rowToReminder(row: Record<string, unknown>): Reminder {
  return {
    id: row.id as string,
    title: row.title as string,
    category: row.category as Reminder['category'],
    dueDate: row.due_date as string,
    amount: row.amount as number | undefined,
    currency: row.currency as string | undefined,
    contact: row.contact
      ? (typeof row.contact === 'string' ? JSON.parse(row.contact) : row.contact)
      : undefined,
    leadTimes: typeof row.lead_times === 'string'
      ? JSON.parse(row.lead_times)
      : row.lead_times,
    notes: row.notes as string | undefined,
    isArchived: Boolean(row.is_archived),
    calendarEventId: row.calendar_event_id as string | undefined,
    notificationIds: JSON.parse((row.notification_ids as string) ?? '[]'),
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export async function insertReminder(draft: ReminderDraft): Promise<Reminder> {
  const db = await getDb();
  const now = new Date().toISOString();
  const id = uuid.v4() as string;
  await db.runAsync(
    `INSERT OR REPLACE INTO reminders
     (id, title, category, due_date, amount, currency, contact, lead_times, notes, is_archived, calendar_event_id, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?)`,
    [
      id, draft.title, draft.category, draft.dueDate,
      draft.amount ?? null, draft.currency ?? null,
      draft.contact ? JSON.stringify(draft.contact) : null,
      JSON.stringify(draft.leadTimes),
      draft.notes ?? null, draft.calendarEventId ?? null,
      now, now,
    ]
  );
  return { ...draft, id, isArchived: false, createdAt: now, updatedAt: now };
}

export async function getReminders(opts?: { includeArchived?: boolean }): Promise<Reminder[]> {
  const db = await getDb();
  const sql = opts?.includeArchived
    ? `SELECT * FROM reminders ORDER BY due_date ASC`
    : `SELECT * FROM reminders WHERE is_archived = 0 ORDER BY due_date ASC`;
  const rows = await db.getAllAsync<Record<string, unknown>>(sql);
  return rows.map(rowToReminder);
}

export async function updateReminder(
  id: string,
  changes: Partial<Omit<Reminder, 'id' | 'createdAt'>>
): Promise<Reminder> {
  const db = await getDb();
  const now = new Date().toISOString();
  const current = (await getReminders({ includeArchived: true })).find((r) => r.id === id);
  if (!current) throw new Error(`Reminder ${id} not found`);
  const next = { ...current, ...changes, updatedAt: now };
  await db.runAsync(
    `UPDATE reminders SET
       title=?, category=?, due_date=?, amount=?, currency=?,
       contact=?, lead_times=?, notes=?, is_archived=?, calendar_event_id=?, updated_at=?
     WHERE id=?`,
    [
      next.title, next.category, next.dueDate,
      next.amount ?? null, next.currency ?? null,
      next.contact ? JSON.stringify(next.contact) : null,
      JSON.stringify(next.leadTimes),
      next.notes ?? null, next.isArchived ? 1 : 0,
      next.calendarEventId ?? null, now, id,
    ]
  );
  return next;
}

export async function archiveReminder(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `UPDATE reminders SET is_archived = 1, updated_at = ? WHERE id = ?`,
    [new Date().toISOString(), id]
  );
}

export async function updateNotificationIds(id: string, notificationIds: string[]): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `UPDATE reminders SET notification_ids = ?, updated_at = ? WHERE id = ?`,
    [JSON.stringify(notificationIds), new Date().toISOString(), id]
  );
}
