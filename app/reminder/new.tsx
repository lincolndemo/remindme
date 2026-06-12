import React from 'react';
import { StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ManualReminderForm } from '../../src/components/ManualReminderForm';
import { useReminders } from '../../src/hooks/useReminders';
import type { ReminderDraft } from '../../src/types';

export default function NewReminderScreen() {
  const { addReminder } = useReminders();
  const { prefill } = useLocalSearchParams<{ prefill?: string }>();
  const initialValues: Partial<ReminderDraft> | undefined = prefill
    ? (() => { try { return JSON.parse(prefill) as Partial<ReminderDraft>; } catch { return undefined; } })()
    : undefined;

  const handleSubmit = async (draft: ReminderDraft) => {
    await addReminder(draft);
    router.back();
  };

  return (
    <View style={styles.container}>
      <ManualReminderForm
        initialValues={initialValues}
        onSubmit={handleSubmit}
        onCancel={() => router.back()}
      />
    </View>
  );
}

const styles = StyleSheet.create({ container: { flex: 1 } });
