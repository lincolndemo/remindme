import * as Linking from 'expo-linking';
import dayjs from 'dayjs';
import type { Reminder } from '../types';

export function buildWhatsAppMessage(reminder: Reminder): string | null {
  if (!reminder.contact?.phone) return null;

  const name = reminder.contact.name;
  const date = dayjs(reminder.dueDate).format('MMMM D');
  const amount = reminder.amount
    ? `₦${reminder.amount.toLocaleString()}`
    : null;

  const templates: Record<string, string> = {
    loan: amount
      ? `Hi ${name}, just a friendly reminder about the ${amount} we discussed — today's the date we agreed on (${date}). Let me know if you need to sort this out. Thanks!`
      : `Hi ${name}, just a reminder about the money we discussed — today is ${date}. Let me know. Thanks!`,
    'follow-up': `Hi ${name}, following up on what we discussed. Just checking in — any update? Thanks!`,
    appointment: `Hi ${name}, just a reminder about our appointment on ${date}. See you then!`,
    payment: `Hi ${name}, this is a reminder about the payment due on ${date}${amount ? ` (${amount})` : ''}. Thanks!`,
    birthday: `Happy Birthday ${name}! Wishing you all the best today!`,
    task: `Hi ${name}, just a reminder about: ${reminder.title}`,
    custom: `Hi ${name}, reminder: ${reminder.title} — ${date}`,
  };

  return templates[reminder.category] ?? templates.custom;
}

export async function openWhatsApp(reminder: Reminder): Promise<void> {
  const message = buildWhatsAppMessage(reminder);
  if (!message || !reminder.contact?.phone) return;

  const phone = reminder.contact.phone.replace(/[^0-9]/g, '');
  const encoded = encodeURIComponent(message);
  await Linking.openURL(`https://wa.me/${phone}?text=${encoded}`);
}
