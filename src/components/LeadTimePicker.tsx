import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import type { LeadTime } from '../types';

const PRESET_LEAD_TIMES: Array<{ label: string; value: LeadTime }> = [
  { label: '30 min', value: { value: 30, unit: 'minutes' } },
  { label: '1 hour', value: { value: 1, unit: 'hours' } },
  { label: '3 hours', value: { value: 3, unit: 'hours' } },
  { label: '1 day', value: { value: 1, unit: 'days' } },
  { label: '3 days', value: { value: 3, unit: 'days' } },
  { label: '1 week', value: { value: 1, unit: 'weeks' } },
];

function isSelected(selected: LeadTime[], lt: LeadTime): boolean {
  return selected.some((s) => s.value === lt.value && s.unit === lt.unit);
}

interface Props {
  selected: LeadTime[];
  onChange: (updated: LeadTime[]) => void;
}

export function LeadTimePicker({ selected, onChange }: Props) {
  const toggle = (lt: LeadTime) => {
    if (isSelected(selected, lt)) {
      onChange(selected.filter((s) => !(s.value === lt.value && s.unit === lt.unit)));
    } else {
      onChange([...selected, lt]);
    }
  };

  return (
    <View>
      <Text style={styles.label}>Remind me before</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {PRESET_LEAD_TIMES.map((p) => {
          const active = isSelected(selected, p.value);
          return (
            <TouchableOpacity
              key={p.label}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => toggle(p.value)}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{p.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8 },
  row: { gap: 8, paddingBottom: 4 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1.5, borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  chipActive: { borderColor: '#6C47FF', backgroundColor: '#6C47FF10' },
  chipText: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  chipTextActive: { color: '#6C47FF', fontWeight: '700' },
});
