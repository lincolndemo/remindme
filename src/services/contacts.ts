// @ts-ignore
import * as ExpoContacts from 'expo-contacts/legacy';
import type { ContactLink } from '../types';

export async function searchContactByName(name: string): Promise<ContactLink | null> {
  const { status } = await ExpoContacts.requestPermissionsAsync();
  if (status !== 'granted') return null;

  const { data } = await ExpoContacts.getContactsAsync({
    fields: [ExpoContacts.Fields.Name, ExpoContacts.Fields.PhoneNumbers],
    name,
  });

  if (!data.length) return null;

  const contact = data[0];
  if (!contact.id) return null;
  return {
    contactId: contact.id,
    name: contact.name ?? name,
    phone: contact.phoneNumbers?.[0]?.number,
  };
}
