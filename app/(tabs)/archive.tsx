import React, { useEffect, useState } from 'react';
import { FlatList, View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { getReminders } from '../../src/db/reminders';
import { ReminderCard } from '../../src/components/ReminderCard';
import type { Reminder } from '../../src/types';

export default function ArchiveScreen() {
  const [archived, setArchived] = useState<Reminder[]>([]);

  useEffect(() => {
    getReminders({ includeArchived: true }).then((all) =>
      setArchived(all.filter((r) => r.isArchived))
    );
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Text style={styles.heading}>Archive</Text>
      {archived.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No archived reminders.</Text>
        </View>
      ) : (
        <FlatList
          data={archived}
          keyExtractor={(r) => r.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <ReminderCard
              reminder={item}
              onPress={(id) => router.push(`/reminder/${id}`)}
              onArchive={() => {}}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9FAFB' },
  heading: { fontSize: 26, fontWeight: '800', color: '#111827', padding: 20 },
  list: { padding: 20 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: '#9CA3AF', fontSize: 16 },
});
