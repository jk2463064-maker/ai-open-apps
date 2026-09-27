import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../theme';

type VoiceRecorderState = 'idle' | 'recording' | 'processing';

type UseVoiceRecorderReturn = {
  state: VoiceRecorderState;
  duration: number;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<string | null>;
  cancel: () => void;
};

export function useVoiceRecorder(): UseVoiceRecorderReturn {
  const [state, setState] = useState<VoiceRecorderState>('idle');
  const [duration, setDuration] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // For now, this is a mock implementation
  // In production, integrate react-native-audio or expo-audio
  const startRecording = async () => {
    setState('recording');
    setDuration(0);
    timerRef.current = setInterval(() => {
      setDuration((d) => d + 1);
    }, 1000);
  };

  const stopRecording = async () => {
    setState('processing');
    if (timerRef.current) clearInterval(timerRef.current);

    // Mock transcription - replace with real speech-to-text API
    return new Promise((resolve) => {
      setTimeout(() => {
        setState('idle');
        setDuration(0);
        resolve('This is a transcribed voice message. Replace with real speech-to-text.');
      }, 500);
    });
  };

  const cancel = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setState('idle');
    setDuration(0);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return { state, duration, startRecording, stopRecording, cancel };
}

type VoiceRecorderUIProps = {
  onTranscribed: (text: string) => void;
};

export function VoiceRecorderUI({ onTranscribed }: VoiceRecorderUIProps) {
  const { state, duration, startRecording, stopRecording, cancel } = useVoiceRecorder();

  const handleStopAndTranscribe = async () => {
    const transcript = await stopRecording();
    if (transcript) {
      onTranscribed(transcript);
    }
  };

  if (state === 'idle') {
    return null;
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.recordingBar}>
        <View style={styles.recordingIndicator} />
        <Text style={styles.recordingText}>
          {state === 'recording' ? 'Recording' : 'Processing'}
        </Text>
        <Text style={styles.durationText}>{formatDuration(duration)}</Text>
      </View>
      <View style={styles.actions}>
        <Text
          onPress={cancel}
          style={styles.cancelButton}
        >
          Cancel
        </Text>
        <Text
          onPress={handleStopAndTranscribe}
          style={styles.sendButton}
        >
          {state === 'recording' ? 'Send' : 'Processing...'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    backgroundColor: colors.bg.secondary,
    borderTopWidth: 1,
    borderTopColor: colors.message.borderColor,
  },
  recordingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg.primary,
    borderRadius: 12,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
  },
  recordingIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ef4444',
    marginRight: spacing.md,
    animation: 'pulse',
  },
  recordingText: {
    flex: 1,
    ...typography.bodyMedium,
    color: colors.text.primary,
  },
  durationText: {
    ...typography.labelMedium,
    color: colors.text.tertiary,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  cancelButton: {
    flex: 1,
    ...typography.labelLarge,
    color: colors.text.secondary,
    paddingVertical: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.message.borderColor,
    textAlign: 'center',
    overflow: 'hidden',
  },
  sendButton: {
    flex: 1,
    ...typography.labelLarge,
    color: colors.text.primary,
    paddingVertical: spacing.md,
    borderRadius: 12,
    backgroundColor: colors.interactive.primary,
    textAlign: 'center',
    overflow: 'hidden',
  },
});
