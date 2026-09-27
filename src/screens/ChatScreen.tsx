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

function getAssistantReply(prompt: string): string {
  return `I received: “${prompt}”. Connect this function to your AI backend to enable real responses.`;
}

export function ChatScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>([initialMessage]);
  const [draft, setDraft] = useState('');

  function sendMessage() {
    const content = draft.trim();
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
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>AI Chat</Text>
          <Text style={styles.subtitle}>Open apps starter</Text>
        </View>
        <Ionicons name="sparkles" size={24} color="#60a5fa" />
      </View>

      <FlatList
        contentContainerStyle={styles.messages}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <MessageBubble message={item} />}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.composer}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          onSubmitEditing={sendMessage}
          placeholder="Ask anything..."
          placeholderTextColor="#94a3b8"
          style={styles.input}
          multiline
          maxLength={2000}
        />
        <TouchableOpacity
          accessibilityLabel="Send message"
          onPress={sendMessage}
          style={[styles.sendButton, !draft.trim() && styles.disabledButton]}
          disabled={!draft.trim()}
        >
          <Ionicons name="arrow-up" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#1e293b',
  },
  title: { color: '#f8fafc', fontSize: 22, fontWeight: '700' },
  subtitle: { color: '#94a3b8', fontSize: 13, marginTop: 3 },
  messages: { padding: 20, paddingBottom: 12 },
  composer: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 10, padding: 12,
    borderTopWidth: 1, borderTopColor: '#1e293b', backgroundColor: '#0f172a',
  },
  input: {
    flex: 1, minHeight: 46, maxHeight: 120, borderRadius: 23, paddingHorizontal: 18,
    paddingVertical: 12, color: '#f8fafc', backgroundColor: '#1e293b', fontSize: 16,
  },
  sendButton: {
    width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#2563eb',
  },
  disabledButton: { opacity: 0.45 },
});
