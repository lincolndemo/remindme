import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();

export type AuthProvider = 'google' | 'apple';

export interface AuthTokens {
  provider: AuthProvider;
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  userId?: string;
  email?: string;
  displayName?: string;
}

const KEY = (provider: AuthProvider) => `auth_${provider}`;

export async function saveTokens(tokens: AuthTokens): Promise<void> {
  await SecureStore.setItemAsync(KEY(tokens.provider), JSON.stringify(tokens));
}

export async function loadTokens(provider: AuthProvider): Promise<AuthTokens | null> {
  const raw = await SecureStore.getItemAsync(KEY(provider));
  if (!raw) return null;
  return JSON.parse(raw) as AuthTokens;
}

export async function clearTokens(provider: AuthProvider): Promise<void> {
  await SecureStore.deleteItemAsync(KEY(provider));
}

export function isTokenValid(tokens: AuthTokens): boolean {
  return tokens.expiresAt > Date.now() + 60 * 1000;
}

export function useGoogleAuth() {
  const discovery = AuthSession.useAutoDiscovery('https://accounts.google.com');
  const redirectUri = AuthSession.makeRedirectUri({ scheme: 'remindmejo' });

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ?? '',
      scopes: [
        'openid', 'email', 'profile',
        'https://www.googleapis.com/auth/calendar',
      ],
      redirectUri,
    },
    discovery
  );

  return { request, response, promptAsync };
}
