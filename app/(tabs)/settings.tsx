import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { useAuthStore } from '../../src/store/auth';
import { useGoogleAuth } from '../../src/services/auth';
import { useSync } from '../../src/hooks/useSync';
import dayjs from 'dayjs';

export default function SettingsScreen() {
  const { googleTokens, connectedCalendars, setGoogleTokens, setCalendarConnected, signOut } = useAuthStore();
  const { request, response, promptAsync } = useGoogleAuth();
  const { sync, isSyncing, lastSyncedAt } = useSync();

  useEffect(() => {
    if (response?.type === 'success') {
      const { access_token } = response.params;
      setGoogleTokens({
        provider: 'google',
        accessToken: access_token,
        expiresAt: Date.now() + 3600 * 1000,
      });
    }
  }, [response]);

  const handleAppleSignIn = async () => {
    try {
      const cred = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      Alert.alert('Signed in with Apple', `Welcome${cred.fullName?.givenName ? `, ${cred.fullName.givenName}` : ''}!`);
    } catch {
      // User cancelled — no-op
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Settings</Text>

        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.card}>
          {googleTokens ? (
            <View style={styles.row}>
              <Ionicons name={'logo-google' as ComponentProps<typeof Ionicons>['name']} size={20} color="#6C47FF" />
              <Text style={styles.rowLabel}>Google (connected)</Text>
              <TouchableOpacity onPress={() => signOut('google')}>
                <Text style={styles.danger}>Sign out</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.authBtn} onPress={() => promptAsync()} disabled={!request}>
              <Ionicons name={'logo-google' as ComponentProps<typeof Ionicons>['name']} size={20} color="#6C47FF" />
              <Text style={styles.authBtnText}>Sign in with Google</Text>
            </TouchableOpacity>
          )}
          <View style={styles.divider} />
          <TouchableOpacity style={styles.authBtn} onPress={handleAppleSignIn}>
            <Ionicons name={'logo-apple' as ComponentProps<typeof Ionicons>['name']} size={20} color="#111827" />
            <Text style={styles.authBtnText}>Sign in with Apple</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Calendar Sync</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Ionicons name={'logo-google' as ComponentProps<typeof Ionicons>['name']} size={18} color={connectedCalendars.google ? '#6C47FF' : '#9CA3AF'} />
            <Text style={styles.rowLabel}>Google Calendar</Text>
            <Switch
              value={connectedCalendars.google}
              onValueChange={(v) => {
                if (v && !googleTokens) {
                  Alert.alert('Sign in required', 'Please sign in with Google first.');
                  return;
                }
                setCalendarConnected('google', v);
              }}
              trackColor={{ true: '#6C47FF' }}
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Ionicons name={'mail-outline' as ComponentProps<typeof Ionicons>['name']} size={18} color={connectedCalendars.outlook ? '#6C47FF' : '#9CA3AF'} />
            <Text style={styles.rowLabel}>Outlook Calendar</Text>
            <Switch
              value={connectedCalendars.outlook}
              onValueChange={(v) => setCalendarConnected('outlook', v)}
              trackColor={{ true: '#6C47FF' }}
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.syncBtn, isSyncing && styles.syncBtnDisabled]}
          onPress={sync}
          disabled={isSyncing}
        >
          <Ionicons name={(isSyncing ? 'hourglass-outline' : 'sync-outline') as ComponentProps<typeof Ionicons>['name']} size={18} color="#fff" />
          <Text style={styles.syncBtnText}>{isSyncing ? 'Syncing…' : 'Sync Now'}</Text>
        </TouchableOpacity>

        {lastSyncedAt && (
          <Text style={styles.lastSync}>Last synced {dayjs(lastSyncedAt).format('h:mm A')}</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9FAFB' },
  content: { padding: 20 },
  heading: { fontSize: 26, fontWeight: '800', color: '#111827', marginBottom: 24 },
  sectionTitle: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, color: '#9CA3AF', marginBottom: 8, marginTop: 16 },
  card: { backgroundColor: '#fff', borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: '#F3F4F6' },
  row: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  rowLabel: { flex: 1, fontSize: 15, color: '#111827', fontWeight: '500' },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginHorizontal: 16 },
  authBtn: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 },
  authBtnText: { fontSize: 15, color: '#111827', fontWeight: '600' },
  danger: { color: '#EF4444', fontWeight: '600', fontSize: 14 },
  syncBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#6C47FF', borderRadius: 12, padding: 16, marginTop: 24 },
  syncBtnDisabled: { opacity: 0.6 },
  syncBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  lastSync: { textAlign: 'center', color: '#9CA3AF', fontSize: 13, marginTop: 8 },
});
