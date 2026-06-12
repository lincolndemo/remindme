jest.mock('expo-contacts/legacy', () => ({
  requestPermissionsAsync: jest.fn(),
  getContactsAsync: jest.fn(),
  Fields: { Name: 'name', PhoneNumbers: 'phoneNumbers' },
}));

import * as ExpoContacts from 'expo-contacts/legacy';
import { searchContactByName } from '../../src/services/contacts';

describe('searchContactByName', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it('returns matched contact with phone number', async () => {
    (ExpoContacts.requestPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    (ExpoContacts.getContactsAsync as jest.Mock).mockResolvedValue({
      data: [{ id: '123', name: 'Sola Adeyemi', phoneNumbers: [{ number: '+2348012345678' }] }],
    });
    const result = await searchContactByName('Sola');
    expect(result?.name).toBe('Sola Adeyemi');
    expect(result?.phone).toBe('+2348012345678');
    expect(result?.contactId).toBe('123');
  });

  it('returns null when permission denied', async () => {
    (ExpoContacts.requestPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });
    const result = await searchContactByName('Sola');
    expect(result).toBeNull();
  });

  it('returns null when no contact matches', async () => {
    (ExpoContacts.requestPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    (ExpoContacts.getContactsAsync as jest.Mock).mockResolvedValue({ data: [] });
    const result = await searchContactByName('Unknown Person');
    expect(result).toBeNull();
  });

  it('returns contact with undefined phone when no numbers exist', async () => {
    (ExpoContacts.requestPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    (ExpoContacts.getContactsAsync as jest.Mock).mockResolvedValue({
      data: [{ id: '456', name: 'No Phone Person', phoneNumbers: [] }],
    });
    const result = await searchContactByName('No Phone');
    expect(result).not.toBeNull();
    expect(result?.phone).toBeUndefined();
  });
});
