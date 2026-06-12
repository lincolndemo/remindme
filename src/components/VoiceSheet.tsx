import React, { useCallback, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { useVoice } from '../hooks/useVoice';
import { NLPConfirmCard } from './NLPConfirmCard';
import type { ReminderDraft } from '../types';

interface Props {
  visible: boolean;
  onConfirm: (draft: ReminderDraft) => void;
  onEditManually: (draft?: ReminderDraft) => void;
  onClose: () => void;
}

export function VoiceSheet({ visible, onConfirm, onEditManually, onClose }: Props) {
  const sheetRef = useRef<BottomSheet>(null);
  const { state, transcript, draft, error, startListening, stopListening, reset } = useVoice();

  useEffect(() => {
    if (visible) {
      sheetRef.current?.expand();
      startListening();
    } else {
      sheetRef.current?.close();
      reset();
    }
  }, [visible]);

  const handleConfirm = (d: ReminderDraft) => {
    onConfirm(d);
    reset();
    onClose();
  };

  const handleEdit = (d: ReminderDraft) => {
    onEditManually(d);
    reset();
    onClose();
  };

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={['45%', '75%']}
      enablePanDownToClose
      onClose={onClose}
    >
      <BottomSheetView style={styles.content}>
        {state === 'listening' && (
          <View style={styles.centeredState}>
            <View style={styles.micCircle}>
              <Ionicons name={'mic' as ComponentProps<typeof Ionicons>['name']} size={36} color="#6C47FF" />
            </View>
            <Text style={styles.stateTitle}>Listening…</Text>
            <Text style={styles.stateHint}>Say your reminder naturally</Text>
            <Text style={styles.example}>"I borrowed Sola 20k, remind her July 15"</Text>
            <TouchableOpacity style={styles.stopBtn} onPress={stopListening}>
              <Text style={styles.stopText}>Done speaking</Text>
            </TouchableOpacity>
          </View>
        )}

        {state === 'processing' && (
          <View style={styles.centeredState}>
            <ActivityIndicator size="large" color="#6C47FF" />
            <Text style={styles.stateTitle}>Processing…</Text>
            {transcript ? <Text style={styles.transcript}>"{transcript}"</Text> : null}
          </View>
        )}

        {state === 'done' && draft && (
          <NLPConfirmCard
            draft={draft}
            onConfirm={handleConfirm}
            onEdit={handleEdit}
            onDiscard={() => { reset(); onClose(); }}
          />
        )}

        {(state === 'error' || state === 'offline_fallback') && (
          <View style={styles.centeredState}>
            <Ionicons name={'warning-outline' as ComponentProps<typeof Ionicons>['name']} size={36} color="#F97316" />
            <Text style={styles.stateTitle}>
              {state === 'offline_fallback' ? 'No internet' : 'Could not understand'}
            </Text>
            <Text style={styles.stateHint}>{error ?? 'Fill in the reminder manually.'}</Text>
            <TouchableOpacity style={styles.manualBtn} onPress={() => { onEditManually(); reset(); onClose(); }}>
              <Text style={styles.manualText}>Fill in manually</Text>
            </TouchableOpacity>
          </View>
        )}
      </BottomSheetView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, padding: 4 },
  centeredState: { alignItems: 'center', paddingVertical: 32, paddingHorizontal: 24, gap: 12 },
  micCircle: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: '#6C47FF15',
    justifyContent: 'center', alignItems: 'center', marginBottom: 8,
  },
  stateTitle: { fontSize: 20, fontWeight: '700', color: '#111827' },
  stateHint: { fontSize: 14, color: '#6B7280', textAlign: 'center' },
  example: { fontSize: 13, color: '#9CA3AF', fontStyle: 'italic', textAlign: 'center' },
  transcript: { fontSize: 14, color: '#374151', fontStyle: 'italic', textAlign: 'center' },
  stopBtn: { marginTop: 8, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24, backgroundColor: '#6C47FF' },
  stopText: { color: '#fff', fontWeight: '600' },
  manualBtn: { marginTop: 8, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24, borderWidth: 1.5, borderColor: '#6C47FF' },
  manualText: { color: '#6C47FF', fontWeight: '600' },
});
