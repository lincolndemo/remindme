import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useReminderStore } from '../../src/store/reminders';
import { ManualReminderForm } from '../../src/components/ManualReminderForm';
import type { ReminderDraft } from '../../src/types';

export default function ReminderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { reminders, updateReminder, archiveReminder } = useReminderStore();
  const reminder = reminders.find((r) => r.id === id);

  if (!reminder) {
    return (
      <View style={styles.container}>
        <Text>Reminder not found.</Text>
      </View>
    );
  }

  const handleSubmit = async (draft: ReminderDraft) => {
    await updateReminder(id, draft);
    router.back();
  };

  const handleArchive = () => {
    Alert.alert('Mark as done?', 'This will move the reminder to your archive.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Done', style: 'destructive', onPress: async () => { await archiveReminder(id); router.back(); } },
    ]);
  };

  return (
    <View style={styles.container}>
      <ManualReminderForm
        initialValues={reminder}
        onSubmit={handleSubmit}
        onCancel={() => router.back()}
      />
      <TouchableOpacity style={styles.archiveBtn} onPress={handleArchive}>
        <Text style={styles.archiveText}>Mark as Done</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  archiveBtn: { margin: 20, padding: 16, borderRadius: 12, borderWidth: 1.5, borderColor: '#FCA5A5', alignItems: 'center' },
  archiveText: { color: '#EF4444', fontWeight: '600' },
});
