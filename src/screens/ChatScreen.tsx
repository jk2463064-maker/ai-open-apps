import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
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
import type { ChatMessage } from '../types/chat';

const initialMessage: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content: 'Hi! I’m your AI assistant. What would you like to explore?',
  createdAt: Date.now(),
};

const quickPrompts = [
  'Summarize my day',
  'Plan a workout',
  'Help me write an email',
  'Brainstorm ideas',
];

function getAssistantReply(prompt: string): string {
  return `I received: “${prompt}”. Connect this function to your AI backend to enable real responses.`;
}

export function ChatScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>([initialMessage]);
  const [draft, setDraft] = useState('');

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

      <FlatList
        contentContainerStyle={styles.messages}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <MessageBubble message={item} />}
        showsVerticalScrollIndicator={false}
      />

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
            accessibilityLabel="Send message"
            onPress={() => sendMessage()}
            style={[styles.sendButton, !draft.trim() && styles.disabledButton]}
            disabled={!draft.trim()}
          >
            <Ionicons name="arrow-up" size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>
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
  messages: {
    paddingVertical: 12,
    paddingHorizontal: 6,
    paddingBottom: 24,
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

