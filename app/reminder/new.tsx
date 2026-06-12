import React from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { ManualReminderForm } from '../../src/components/ManualReminderForm';
import { useReminders } from '../../src/hooks/useReminders';
import type { ReminderDraft } from '../../src/types';

export default function NewReminderScreen() {
  const { addReminder } = useReminders();

  const handleSubmit = async (draft: ReminderDraft) => {
    await addReminder(draft);
    router.back();
  };

  return (
    <View style={styles.container}>
      <ManualReminderForm onSubmit={handleSubmit} onCancel={() => router.back()} />
    </View>
  );
}

const styles = StyleSheet.create({ container: { flex: 1 } });
