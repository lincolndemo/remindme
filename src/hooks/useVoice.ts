import { useState, useEffect, useCallback } from 'react';
import Voice from '@react-native-voice/voice';
import { parseReminderFromText, NLPParseError } from '../services/nlp';
import { searchContactByName } from '../services/contacts';
import type { NLPResult, ReminderDraft } from '../types';
import { DEFAULT_LEAD_TIMES } from '../utils/categories';

export type VoiceState = 'idle' | 'listening' | 'processing' | 'done' | 'error' | 'offline_fallback';

interface UseVoiceResult {
  state: VoiceState;
  transcript: string;
  draft: ReminderDraft | null;
  error: string | null;
  startListening: () => Promise<void>;
  stopListening: () => Promise<void>;
  reset: () => void;
}

export function useVoice(): UseVoiceResult {
  const [state, setState] = useState<VoiceState>('idle');
  const [transcript, setTranscript] = useState('');
  const [draft, setDraft] = useState<ReminderDraft | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Voice.onSpeechResults = (e: any) => {
      const text = e.value?.[0] ?? '';
      setTranscript(text);
    };
    Voice.onSpeechEnd = () => {
      setState('processing');
    };
    Voice.onSpeechError = (e: any) => {
      setError(e.error?.message ?? 'Voice recognition failed');
      setState('error');
    };
    return () => { Voice.destroy?.(); };
  }, []);

  useEffect(() => {
    if (state === 'processing' && transcript) {
      processTranscript(transcript);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, transcript]);

  const processTranscript = async (text: string) => {
    try {
      const nlpResult: NLPResult = await parseReminderFromText(text);
      const contact = nlpResult.contactName
        ? await searchContactByName(nlpResult.contactName)
        : null;

      const reminderDraft: ReminderDraft = {
        title: nlpResult.title,
        category: nlpResult.category,
        dueDate: nlpResult.dueDate,
        amount: nlpResult.amount,
        currency: nlpResult.currency,
        contact: contact ?? (nlpResult.contactName ? { name: nlpResult.contactName } : undefined),
        leadTimes: nlpResult.leadTimes.length
          ? nlpResult.leadTimes
          : DEFAULT_LEAD_TIMES[nlpResult.category],
        notes: nlpResult.notes,
      };
      setDraft(reminderDraft);
      setState('done');
    } catch (e) {
      if (e instanceof NLPParseError) {
        setState('offline_fallback');
      } else {
        setError('Could not process reminder. Please try again or fill in manually.');
        setState('error');
      }
    }
  };

  const startListening = useCallback(async () => {
    setTranscript('');
    setDraft(null);
    setError(null);
    setState('listening');
    await Voice.start('en-NG');
  }, []);

  const stopListening = useCallback(async () => {
    await Voice.stop();
  }, []);

  const reset = useCallback(() => {
    setState('idle');
    setTranscript('');
    setDraft(null);
    setError(null);
  }, []);

  return { state, transcript, draft, error, startListening, stopListening, reset };
}
