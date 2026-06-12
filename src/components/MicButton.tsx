import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  onPress: () => void;
  isRecording?: boolean;
}

export function MicButton({ onPress, isRecording = false }: Props) {
  return (
    <TouchableOpacity
      style={[styles.button, isRecording && styles.recording]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Ionicons
        name={isRecording ? 'stop' : 'mic'}
        size={28}
        color="#fff"
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute', bottom: 28, alignSelf: 'center',
    width: 68, height: 68, borderRadius: 34,
    backgroundColor: '#6C47FF',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#6C47FF', shadowOpacity: 0.5,
    shadowRadius: 12, shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  recording: { backgroundColor: '#EF4444' },
});
