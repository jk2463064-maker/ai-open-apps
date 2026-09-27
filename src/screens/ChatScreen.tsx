import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { MessageBubble } from '../components/MessageBubble';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { initializeTranscription, transcribeAudio } from '../services/transcriptionService';
import type { ChatMessage } from '../types/chat';

const initialMessage: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content: 'Hi! I\'m your AI assistant. What would you like to explore?',
  createdAt: Date.now(),
};

const quickPrompts = [
  'Summarize my day',
  'Plan a workout',
  'Help me write an email',
  'Brainstorm ideas',
];

function getAssistantReply(prompt: string): string {
  return `I received: "${prompt}". Connect this function to your AI backend to enable real responses.`;
}

export function ChatScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>([initialMessage]);
  const [draft, setDraft] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [transcriptionError, setTranscriptionError] = useState<string | null>(null);
  const { state, duration, startRecording, stopRecording, cancel, error } = useAudioRecorder();

  useEffect(() => {
    // Initialize transcription service on app load
    // Replace with your actual API key - DO NOT hardcode in production!
    const provider = (process.env.EXPO_PUBLIC_TRANSCRIPTION_PROVIDER || 'openai') as
      | 'google'
      | 'openai'
      | 'assemblyai';
    const apiKey = process.env.EXPO_PUBLIC_TRANSCRIPTION_API_KEY;

    if (apiKey) {
      try {
        initializeTranscription({
          provider,
          apiKey,
          language: 'en-US',
        });
      } catch (err) {
        setTranscriptionError(
          err instanceof Error ? err.message : 'Failed to initialize transcription'
        );
      }
    }
  }, []);

  function sendMessage(contentOverride?: string) {
    const content = (contentOverride ?? draft).trim();
    if (!content) return;

    const userMessage: ChatMessage = {
      id: `${Date.now()}-user`,
      role: 'user',
      content,
      createdAt: Date.now(),
    };
    const assistantMessage: ChatMessage = {
      id: `${Date.now()}-assistant`,
      role: 'assistant',
      content: getAssistantReply(content),
      createdAt: Date.now(),
    };

    setMessages((current) => [...current, userMessage, assistantMessage]);
    setDraft('');
  }

  const handleMicPress = async () => {
    if (state === 'idle') {
      setIsRecording(true);
      await startRecording();
    }
  };

  const handleStopRecording = async () => {
    const audioUri = await stopRecording();
    setIsRecording(false);

    if (!audioUri) {
      setTranscriptionError('Failed to record audio');
      return;
    }

    try {
      const result = await transcribeAudio(audioUri);
      if (result.success) {
        sendMessage(result.text);
      } else {
        setTranscriptionError(result.error || 'Failed to transcribe audio');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Transcription failed';
      setTranscriptionError(message);
    }
  };

  const handleCancel = () => {
    cancel();
    setIsRecording(false);
    setTranscriptionError(null);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.headerCard}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.eyebrow}>AI CHAT</Text>
            <Text style={styles.title}>Open Apps</Text>
          </View>
          <TouchableOpacity style={styles.iconButton} activeOpacity={0.8}>
            <Ionicons name="sparkles" size={18} color="#e2e8f0" />
          </TouchableOpacity>
        </View>

        <View style={styles.statusRow}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>Online now</Text>
        </View>
      </View>

      {!isRecording && (
        <View style={styles.promptRow}>
          {quickPrompts.map((prompt) => (
            <TouchableOpacity
              key={prompt}
              onPress={() => sendMessage(prompt)}
              style={styles.promptChip}
              activeOpacity={0.8}
            >
              <Text style={styles.promptText}>{prompt}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {transcriptionError && (
        <View style={styles.errorBar}>
          <Ionicons name="alert-circle" size={16} color="#ef4444" />
          <Text style={styles.errorText}>{transcriptionError}</Text>
          <TouchableOpacity onPress={() => setTranscriptionError(null)}>
            <Ionicons name="close" size={16} color="#ef4444" />
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        contentContainerStyle={styles.messages}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <MessageBubble message={item} />}
        showsVerticalScrollIndicator={false}
      />

      {isRecording && (
        <View style={styles.recordingPanel}>
          <View style={styles.recordingBar}>
            <View style={styles.recordingIndicator} />
            <Text style={styles.recordingText}>Recording</Text>
            <Text style={styles.durationText}>{formatDuration(duration)}</Text>
          </View>
          <View style={styles.recordingActions}>
            <TouchableOpacity onPress={handleCancel} style={styles.recordingCancelBtn}>
              <Text style={styles.recordingActionText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleStopRecording} style={styles.recordingSendBtn}>
              <Ionicons name="checkmark" size={20} color="#ffffff" />
              <Text style={styles.recordingActionText}>Send</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {!isRecording && (
        <View style={styles.composerWrap}>
          <View style={styles.composer}>
            <TextInput
              value={draft}
              onChangeText={setDraft}
              onSubmitEditing={() => sendMessage()}
              placeholder="Type your message..."
              placeholderTextColor="#94a3b8"
              style={styles.input}
              multiline
              maxLength={2000}
            />
            <TouchableOpacity
              accessibilityLabel="Voice input"
              onPress={handleMicPress}
              style={styles.micButton}
            >
              <Ionicons name="mic" size={20} color="#60a5fa" />
            </TouchableOpacity>
            <TouchableOpacity
              accessibilityLabel="Send message"
              onPress={() => sendMessage()}
              style={[styles.sendButton, !draft.trim() && styles.disabledButton]}
              disabled={!draft.trim()}
            >
              <Ionicons name="arrow-up" size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    paddingHorizontal: 14,
    paddingTop: 16,
  },
  headerCard: {
    backgroundColor: '#111827',
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#1f2937',
    shadowColor: '#000',
    shadowOpacity: 0.24,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eyebrow: {
    color: '#60a5fa',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  title: {
    color: '#f8fafc',
    fontSize: 28,
    fontWeight: '700',
    marginTop: 4,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22c55e',
    marginRight: 8,
  },
  statusText: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '500',
  },
  promptRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 14,
    marginBottom: 8,
    gap: 8,
  },
  promptChip: {
    backgroundColor: '#1e293b',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  promptText: {
    color: '#e2e8f0',
    fontSize: 12,
    fontWeight: '600',
  },
  errorBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#ef4444',
  },
  errorText: {
    flex: 1,
    color: '#fca5a5',
    fontSize: 12,
    fontWeight: '500',
  },
  messages: {
    paddingVertical: 12,
    paddingHorizontal: 6,
    paddingBottom: 24,
  },
  recordingPanel: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 18,
    backgroundColor: 'rgba(15, 23, 42, 0.96)',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOpacity: 0.28,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
  },
  recordingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  recordingIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ef4444',
    marginRight: 12,
  },
  recordingText: {
    flex: 1,
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '600',
  },
  durationText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '500',
  },
  recordingActions: {
    flexDirection: 'row',
    gap: 12,
  },
  recordingCancelBtn: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    paddingVertical: 12,
    alignItems: 'center',
  },
  recordingSendBtn: {
    flex: 1,
    flexDirection: 'row',
    borderRadius: 12,
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  recordingActionText: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '600',
  },
  composerWrap: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 18,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.96)',
    borderRadius: 24,
    padding: 10,
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOpacity: 0.28,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
  },
  input: {
    flex: 1,
    minHeight: 48,
    maxHeight: 120,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#f8fafc',
    backgroundColor: '#1e293b',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  micButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  sendButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    shadowColor: '#2563eb',
    shadowOpacity: 0.45,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  disabledButton: {
    opacity: 0.45,
  },
});
