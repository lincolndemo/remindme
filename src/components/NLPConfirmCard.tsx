import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import type { ReminderDraft } from '../types';
import { getCategoryConfig } from '../utils/categories';
import dayjs from 'dayjs';

interface Props {
  draft: ReminderDraft;
  onConfirm: (draft: ReminderDraft) => void;
  onEdit: (draft: ReminderDraft) => void;
  onDiscard: () => void;
}

export function NLPConfirmCard({ draft, onConfirm, onEdit, onDiscard }: Props) {
  const config = getCategoryConfig(draft.category);
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.iconWrap, { backgroundColor: config.color + '20' }]}>
          <Ionicons name={config.icon as ComponentProps<typeof Ionicons>['name']} size={20} color={config.color} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.category}>{config.label}</Text>
          <Text style={styles.title}>{draft.title}</Text>
        </View>
      </View>

      <View style={styles.meta}>
        <Text style={styles.metaItem}>
          {dayjs(draft.dueDate).format('ddd, MMM D YYYY [at] h:mm A')}
        </Text>
        {draft.contact && (
          <Text style={styles.metaItem}>
            {draft.contact.name}
          </Text>
        )}
        {draft.amount != null && (
          <Text style={styles.metaItem}>
            {draft.currency ?? '₦'}{draft.amount.toLocaleString()}
          </Text>
        )}
        {draft.leadTimes.length > 0 && (
          <Text style={styles.metaItem}>
            Reminding {draft.leadTimes.map(lt => `${lt.value} ${lt.unit}`).join(', ')} before
          </Text>
        )}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.discardBtn} onPress={onDiscard}>
          <Text style={styles.discardText}>Discard</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.editBtn} onPress={() => onEdit(draft)}>
          <Text style={styles.editText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.confirmBtn, { backgroundColor: config.color }]} onPress={() => onConfirm(draft)}>
          <Text style={styles.confirmText}>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, margin: 16 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  iconWrap: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  headerText: { flex: 1 },
  category: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', color: '#9CA3AF', letterSpacing: 0.8 },
  title: { fontSize: 17, fontWeight: '700', color: '#111827', marginTop: 2 },
  meta: { gap: 8, marginBottom: 20 },
  metaItem: { fontSize: 14, color: '#374151' },
  actions: { flexDirection: 'row', gap: 10 },
  discardBtn: { flex: 1, padding: 12, borderRadius: 10, borderWidth: 1.5, borderColor: '#E5E7EB', alignItems: 'center' },
  discardText: { color: '#9CA3AF', fontWeight: '600' },
  editBtn: { flex: 1, padding: 12, borderRadius: 10, borderWidth: 1.5, borderColor: '#6C47FF', alignItems: 'center' },
  editText: { color: '#6C47FF', fontWeight: '600' },
  confirmBtn: { flex: 1, padding: 12, borderRadius: 10, alignItems: 'center' },
  confirmText: { color: '#fff', fontWeight: '700' },
});
