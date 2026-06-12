jest.mock('@react-native-voice/voice', () => ({
  __esModule: true,
  default: {
    onSpeechResults: null as any,
    onSpeechError: null as any,
    onSpeechEnd: null as any,
    start: jest.fn(),
    stop: jest.fn(),
    destroy: jest.fn().mockResolvedValue(undefined),
  },
}));
jest.mock('../../src/services/nlp');
jest.mock('../../src/services/contacts');

import { renderHook, act } from '@testing-library/react-native';
import Voice from '@react-native-voice/voice';
import { useVoice } from '../../src/hooks/useVoice';
import * as nlp from '../../src/services/nlp';
import * as contacts from '../../src/services/contacts';

describe('useVoice', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it('starts in idle state', async () => {
    const { result } = await renderHook(() => useVoice());
    expect(result.current.state).toBe('idle');
    expect(result.current.transcript).toBe('');
  });

  it('transitions to listening when startListening called', async () => {
    (Voice.start as jest.Mock).mockResolvedValue(undefined);
    const { result } = await renderHook(() => useVoice());
    await act(async () => { await result.current.startListening(); });
    expect(result.current.state).toBe('listening');
  });

  it('transitions to processing after speech ends', async () => {
    (Voice.start as jest.Mock).mockResolvedValue(undefined);
    (nlp.parseReminderFromText as jest.Mock).mockResolvedValue({
      title: 'Pay Claude', category: 'payment',
      dueDate: new Date().toISOString(), leadTimes: [], confidence: 0.9,
    });
    (contacts.searchContactByName as jest.Mock).mockResolvedValue(null);

    const { result } = await renderHook(() => useVoice());
    await act(async () => { await result.current.startListening(); });
    await act(async () => {
      (Voice as any).onSpeechResults?.({ value: ['I just paid Claude today remind me in 30 days'] });
      (Voice as any).onSpeechEnd?.({});
    });
    expect(['processing', 'done']).toContain(result.current.state);
  });

  it('sets error state on voice error', async () => {
    (Voice.start as jest.Mock).mockResolvedValue(undefined);
    const { result } = await renderHook(() => useVoice());
    await act(async () => { await result.current.startListening(); });
    await act(async () => {
      (Voice as any).onSpeechError?.({ error: { message: 'mic not available' } });
    });
    expect(result.current.state).toBe('error');
    expect(result.current.error).toContain('mic not available');
  });

  it('resets to idle after reset() called', async () => {
    (Voice.start as jest.Mock).mockResolvedValue(undefined);
    const { result } = await renderHook(() => useVoice());
    await act(async () => { await result.current.startListening(); });
    await act(async () => { result.current.reset(); });
    expect(result.current.state).toBe('idle');
    expect(result.current.transcript).toBe('');
    expect(result.current.draft).toBeNull();
  });

  it('reaches done state with draft after speech processed', async () => {
    (Voice.start as jest.Mock).mockResolvedValue(undefined);
    (nlp.parseReminderFromText as jest.Mock).mockResolvedValue({
      title: 'Pay Claude', category: 'payment',
      dueDate: '2026-07-12T00:00:00.000Z',
      leadTimes: [{ value: 3, unit: 'days' }], confidence: 0.9,
    });
    (contacts.searchContactByName as jest.Mock).mockResolvedValue(null);

    const { result } = await renderHook(() => useVoice());
    await act(async () => { await result.current.startListening(); });
    await act(async () => {
      (Voice as any).onSpeechResults?.({ value: ['Pay Claude subscription in 30 days'] });
      (Voice as any).onSpeechEnd?.({});
    });
    await act(async () => {}); // flush async NLP call
    expect(result.current.state).toBe('done');
    expect(result.current.draft?.title).toBe('Pay Claude');
  });

  it('transitions to offline_fallback on NLPParseError', async () => {
    (Voice.start as jest.Mock).mockResolvedValue(undefined);
    (nlp.parseReminderFromText as jest.Mock).mockRejectedValue(
      new nlp.NLPParseError('parse failed')
    );
    const { result } = await renderHook(() => useVoice());
    await act(async () => { await result.current.startListening(); });
    await act(async () => {
      (Voice as any).onSpeechResults?.({ value: ['unclear text'] });
      (Voice as any).onSpeechEnd?.({});
    });
    await act(async () => {});
    expect(result.current.state).toBe('offline_fallback');
  });

  it('sets error state when Voice.start fails', async () => {
    (Voice.start as jest.Mock).mockRejectedValue(new Error('mic denied'));
    const { result } = await renderHook(() => useVoice());
    await act(async () => { await result.current.startListening(); });
    expect(result.current.state).toBe('error');
    expect(result.current.error).toContain('Failed to start');
  });
});
