import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import type { ReminderCategory, ReminderDraft } from '../types';
import { ALL_CATEGORIES, getCategoryConfig, DEFAULT_LEAD_TIMES } from '../utils/categories';
import { LeadTimePicker } from './LeadTimePicker';

interface Props {
  initialValues?: Partial<ReminderDraft>;
  onSubmit: (draft: ReminderDraft) => void;
  onCancel: () => void;
}

export function ManualReminderForm({ initialValues, onSubmit, onCancel }: Props) {
  const [title, setTitle] = useState(initialValues?.title ?? '');
  const [category, setCategory] = useState<ReminderCategory>(initialValues?.category ?? 'task');
  const [dueDate, setDueDate] = useState<Date>(
    initialValues?.dueDate ? new Date(initialValues.dueDate) : new Date()
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [amount, setAmount] = useState(initialValues?.amount?.toString() ?? '');
  const [contactName, setContactName] = useState(initialValues?.contact?.name ?? '');
  const [leadTimes, setLeadTimes] = useState(
    initialValues?.leadTimes ?? DEFAULT_LEAD_TIMES[initialValues?.category ?? 'task']
  );
  const [notes, setNotes] = useState(initialValues?.notes ?? '');

  const handleSubmit = () => {
    if (!title.trim()) return;
    onSubmit({
      title: title.trim(),
      category,
      dueDate: dueDate.toISOString(),
      amount: amount ? parseFloat(amount) : undefined,
      currency: amount ? 'NGN' : undefined,
      contact: contactName ? { name: contactName } : undefined,
      leadTimes,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.sectionLabel}>What's this reminder for?</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Pay Claude subscription"
        value={title}
        onChangeText={setTitle}
        autoFocus
      />

      <Text style={styles.sectionLabel}>Category</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
        {ALL_CATEGORIES.map((cat) => {
          const cfg = getCategoryConfig(cat);
          const active = category === cat;
          return (
            <TouchableOpacity
              key={cat}
              style={[styles.catChip, active && { borderColor: cfg.color, backgroundColor: cfg.color + '15' }]}
              onPress={() => { setCategory(cat); setLeadTimes(DEFAULT_LEAD_TIMES[cat]); }}
            >
              <Ionicons name={cfg.icon as any} size={16} color={active ? cfg.color : '#9CA3AF'} />
              <Text style={[styles.catLabel, active && { color: cfg.color }]}>{cfg.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <Text style={styles.sectionLabel}>Due Date</Text>
      <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
        <Text style={{ color: '#111827' }}>{dueDate.toLocaleString()}</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={dueDate}
          mode="datetime"
          onChange={(_, d) => { setShowDatePicker(false); if (d) setDueDate(d); }}
        />
      )}

      <LeadTimePicker selected={leadTimes} onChange={setLeadTimes} />

      <Text style={styles.sectionLabel}>Person (optional)</Text>
      <TextInput style={styles.input} placeholder="e.g. Sola" value={contactName} onChangeText={setContactName} />

      <Text style={styles.sectionLabel}>Amount (optional)</Text>
      <TextInput
        style={styles.input} placeholder="e.g. 20000"
        value={amount} onChangeText={setAmount}
        keyboardType="numeric"
      />

      <Text style={styles.sectionLabel}>Notes (optional)</Text>
      <TextInput
        style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
        placeholder="Any extra details..."
        value={notes} onChangeText={setNotes} multiline
      />

      <View style={styles.actions}>
        <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.submitBtn, !title.trim() && styles.submitDisabled]} onPress={handleSubmit}>
          <Text style={styles.submitText}>Save Reminder</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB', padding: 20 },
  sectionLabel: { fontSize: 13, fontWeight: '600', color: '#374151', marginTop: 16, marginBottom: 6 },
  input: {
    backgroundColor: '#fff', borderRadius: 10, padding: 14,
    fontSize: 15, color: '#111827', borderWidth: 1.5, borderColor: '#E5E7EB',
  },
  categoryRow: { gap: 8, paddingBottom: 4 },
  catChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1.5, borderColor: '#E5E7EB', backgroundColor: '#fff',
  },
  catLabel: { fontSize: 13, color: '#9CA3AF', fontWeight: '500' },
  actions: { flexDirection: 'row', gap: 12, marginTop: 28, marginBottom: 40 },
  cancelBtn: { flex: 1, padding: 16, borderRadius: 12, borderWidth: 1.5, borderColor: '#E5E7EB', alignItems: 'center' },
  cancelText: { color: '#6B7280', fontWeight: '600' },
  submitBtn: { flex: 2, padding: 16, borderRadius: 12, backgroundColor: '#6C47FF', alignItems: 'center' },
  submitDisabled: { backgroundColor: '#C4B5FD' },
  submitText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
