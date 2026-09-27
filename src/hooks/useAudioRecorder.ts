import * as FileSystem from 'expo-file-system';
import * as Permissions from 'expo-permissions';
import { useEffect, useRef, useState } from 'react';

type AudioRecorderState = 'idle' | 'recording' | 'processing';

type UseAudioRecorderReturn = {
  state: AudioRecorderState;
  duration: number;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<string | null>;
  cancel: () => void;
  error: string | null;
};

export function useAudioRecorder(): UseAudioRecorderReturn {
  const [state, setState] = useState<AudioRecorderState>('idle');
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const recordingRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const requestPermissions = async () => {
    try {
      const { status } = await Permissions.askAsync(Permissions.AUDIO_RECORDING);
      return status === 'granted';
    } catch (err) {
      setError('Permission to record audio was denied');
      return false;
    }
  };

  const startRecording = async () => {
    try {
      const hasPermission = await requestPermissions();
      if (!hasPermission) {
        setError('Microphone permission required');
        return;
      }

      // Dynamic import to avoid issues with SSR/web
      const { Audio } = await import('expo-audio');

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      });

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await recording.startAsync();

      recordingRef.current = recording;
      setState('recording');
      setError(null);
      setDuration(0);

      timerRef.current = setInterval(() => {
        setDuration((d) => d + 1);
      }, 1000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start recording';
      setError(message);
      setState('idle');
    }
  };

  const stopRecording = async () => {
    try {
      if (!recordingRef.current) return null;

      setState('processing');
      if (timerRef.current) clearInterval(timerRef.current);

      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();

      setState('idle');
      setDuration(0);
      recordingRef.current = null;

      return uri;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to stop recording';
      setError(message);
      setState('idle');
      return null;
    }
  };

  const cancel = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setState('idle');
    setDuration(0);
    recordingRef.current = null;
    setError(null);
  };

  return { state, duration, startRecording, stopRecording, cancel, error };
}
