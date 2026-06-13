jest.mock('expo-auth-session', () => ({
  useAutoDiscovery: jest.fn(),
  useAuthRequest: jest.fn().mockReturnValue([null, null, jest.fn()]),
  makeRedirectUri: jest.fn().mockReturnValue('remindmejo://'),
}));
jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  getItemAsync: jest.fn(),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('expo-web-browser', () => ({
  maybeCompleteAuthSession: jest.fn(),
}));

import * as SecureStore from 'expo-secure-store';
import { saveTokens, loadTokens, clearTokens, isTokenValid } from '../../src/services/auth';
import type { AuthTokens } from '../../src/services/auth';

const tokens: AuthTokens = {
  provider: 'google',
  accessToken: 'abc123',
  refreshToken: 'xyz789',
  expiresAt: Date.now() + 3600 * 1000,
};

beforeEach(() => { jest.clearAllMocks(); });

describe('saveTokens', () => {
  it('stores tokens as JSON under provider key', async () => {
    await saveTokens(tokens);
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
      'auth_google',
      expect.stringContaining('abc123')
    );
  });
});

describe('loadTokens', () => {
  it('returns null when nothing stored', async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);
    const result = await loadTokens('google');
    expect(result).toBeNull();
  });

  it('returns parsed tokens when stored', async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(JSON.stringify(tokens));
    const result = await loadTokens('google');
    expect(result?.accessToken).toBe('abc123');
  });
});

describe('clearTokens', () => {
  it('deletes stored token', async () => {
    await clearTokens('google');
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('auth_google');
  });
});

describe('isTokenValid', () => {
  it('returns true for non-expired token', () => {
    expect(isTokenValid(tokens)).toBe(true);
  });

  it('returns false for expired token', () => {
    const expired: AuthTokens = { ...tokens, expiresAt: Date.now() - 1000 };
    expect(isTokenValid(expired)).toBe(false);
  });
});
