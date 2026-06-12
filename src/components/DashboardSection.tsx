import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import type { Reminder } from '../types';
import { ReminderCard } from './ReminderCard';

interface Props {
  title: string;
  reminders: Reminder[];
  onPress: (id: string) => void;
  onArchive: (id: string) => void;
  accentColor?: string;
}

export function DashboardSection({ title, reminders, onPress, onArchive, accentColor = '#6C47FF' }: Props) {
  if (reminders.length === 0) return null;
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: accentColor }]}>{title}</Text>
        <Text style={styles.count}>{reminders.length}</Text>
      </View>
      <FlatList
        data={reminders}
        keyExtractor={(r) => r.id}
        renderItem={({ item }) => (
          <ReminderCard reminder={item} onPress={onPress} onArchive={onArchive} />
        )}
        scrollEnabled={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 24 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  title: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, flex: 1 },
  count: { fontSize: 13, color: '#9CA3AF', fontWeight: '600' },
});
