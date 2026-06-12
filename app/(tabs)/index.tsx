import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useReminders } from '../../src/hooks/useReminders';
import { DashboardSection } from '../../src/components/DashboardSection';
import { MicButton } from '../../src/components/MicButton';
import { VoiceSheet } from '../../src/components/VoiceSheet';
import type { ReminderDraft } from '../../src/types';

export default function DashboardScreen() {
  const { grouped, isLoading, archiveReminder, loadReminders, addReminder } = useReminders();
  const [voiceVisible, setVoiceVisible] = useState(false);
  const isEmpty = Object.values(grouped).every((g) => g.length === 0);

  const handleVoiceConfirm = async (draft: ReminderDraft) => {
    await addReminder(draft);
  };

  const handleEditManually = (draft?: ReminderDraft) => {
    if (draft) {
      router.push({ pathname: '/reminder/new', params: { prefill: JSON.stringify(draft) } });
    } else {
      router.push('/reminder/new');
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>
        <Text style={styles.heading}>Remind Me Jo</Text>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={loadReminders} />}
        >
          {isEmpty && !isLoading && (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No reminders yet.</Text>
              <Text style={styles.emptySubText}>Tap the mic to add your first one.</Text>
            </View>
          )}
          <DashboardSection title="Overdue" reminders={grouped.overdue} accentColor="#EF4444"
            onPress={(id) => router.push(`/reminder/${id}`)} onArchive={archiveReminder} />
          <DashboardSection title="Today" reminders={grouped.today} accentColor="#6C47FF"
            onPress={(id) => router.push(`/reminder/${id}`)} onArchive={archiveReminder} />
          <DashboardSection title="This Week" reminders={grouped.thisWeek} accentColor="#3B82F6"
            onPress={(id) => router.push(`/reminder/${id}`)} onArchive={archiveReminder} />
          <DashboardSection title="Upcoming" reminders={grouped.upcoming} accentColor="#9CA3AF"
            onPress={(id) => router.push(`/reminder/${id}`)} onArchive={archiveReminder} />
        </ScrollView>
        <MicButton onPress={() => setVoiceVisible(true)} />
      </View>

      <VoiceSheet
        visible={voiceVisible}
        onConfirm={handleVoiceConfirm}
        onEditManually={handleEditManually}
        onClose={() => setVoiceVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9FAFB' },
  container: { flex: 1 },
  heading: { fontSize: 26, fontWeight: '800', color: '#111827', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 100 },
  empty: { alignItems: 'center', marginTop: 80 },
  emptyText: { fontSize: 18, fontWeight: '600', color: '#6B7280' },
  emptySubText: { fontSize: 14, color: '#9CA3AF', marginTop: 6 },
});
