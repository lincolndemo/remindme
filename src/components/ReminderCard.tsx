import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Reminder } from '../types';
import { getCategoryConfig } from '../utils/categories';
import { formatRelativeTime } from '../utils/dates';

interface Props {
  reminder: Reminder;
  onPress: (id: string) => void;
  onArchive: (id: string) => void;
}

export function ReminderCard({ reminder, onPress, onArchive }: Props) {
  const config = getCategoryConfig(reminder.category);
  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(reminder.id)}>
      <View style={[styles.iconWrap, { backgroundColor: config.color + '20' }]}>
        <Ionicons name={config.icon as any} size={22} color={config.color} />
      </View>
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>{reminder.title}</Text>
        {reminder.contact && (
          <Text style={styles.sub}>{reminder.contact.name}</Text>
        )}
        {reminder.amount != null && (
          <Text style={styles.amount}>
            {reminder.currency ?? '₦'}{reminder.amount.toLocaleString()}
          </Text>
        )}
      </View>
      <View style={styles.right}>
        <Text style={[styles.badge, { color: config.color }]}>
          {formatRelativeTime(reminder.dueDate)}
        </Text>
        <TouchableOpacity onPress={() => onArchive(reminder.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="checkmark-done-outline" size={20} color="#9CA3AF" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 12,
    padding: 14, marginBottom: 10,
    shadowColor: '#000', shadowOpacity: 0.06,
    shadowRadius: 8, shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  iconWrap: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  body: { flex: 1 },
  title: { fontSize: 15, fontWeight: '600', color: '#111827' },
  sub: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  amount: { fontSize: 13, fontWeight: '700', color: '#374151', marginTop: 2 },
  right: { alignItems: 'flex-end', gap: 6 },
  badge: { fontSize: 12, fontWeight: '600' },
});
