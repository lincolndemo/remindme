import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Text style={styles.heading}>Settings</Text>
      <View style={styles.placeholder}>
        <Text style={styles.sub}>Calendar sync and account settings coming in Plan 4.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9FAFB' },
  heading: { fontSize: 26, fontWeight: '800', color: '#111827', padding: 20 },
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  sub: { color: '#9CA3AF', fontSize: 15, textAlign: 'center' },
});
