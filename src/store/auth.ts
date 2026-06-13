import { create } from 'zustand';
import { loadTokens, clearTokens, saveTokens } from '../services/auth';
import type { AuthTokens, AuthProvider } from '../services/auth';

interface ConnectedCalendars {
  google: boolean;
  outlook: boolean;
}

interface AuthStore {
  googleTokens: AuthTokens | null;
  appleTokens: AuthTokens | null;
  connectedCalendars: ConnectedCalendars;
  isLoadingAuth: boolean;
  loadStoredAuth: () => Promise<void>;
  setGoogleTokens: (tokens: AuthTokens | null) => Promise<void>;
  setAppleTokens: (tokens: AuthTokens | null) => Promise<void>;
  setCalendarConnected: (provider: 'google' | 'outlook', connected: boolean) => void;
  signOut: (provider: AuthProvider) => Promise<void>;
}

export const useAuthStore = create<AuthStore>()((set) => ({
  googleTokens: null,
  appleTokens: null,
  connectedCalendars: { google: false, outlook: false },
  isLoadingAuth: false,

  loadStoredAuth: async () => {
    set({ isLoadingAuth: true });
    try {
      const [google, apple] = await Promise.all([loadTokens('google'), loadTokens('apple')]);
      set({ googleTokens: google, appleTokens: apple });
    } finally {
      set({ isLoadingAuth: false });
    }
  },

  setGoogleTokens: async (tokens) => {
    if (tokens) await saveTokens(tokens);
    else await clearTokens('google');
    set({ googleTokens: tokens });
  },

  setAppleTokens: async (tokens) => {
    if (tokens) await saveTokens(tokens);
    else await clearTokens('apple');
    set({ appleTokens: tokens });
  },

  setCalendarConnected: (provider, connected) =>
    set((s) => ({ connectedCalendars: { ...s.connectedCalendars, [provider]: connected } })),

  signOut: async (provider) => {
    await clearTokens(provider);
    if (provider === 'google') set({ googleTokens: null, connectedCalendars: { google: false, outlook: false } });
    if (provider === 'apple') set({ appleTokens: null });
  },
}));
