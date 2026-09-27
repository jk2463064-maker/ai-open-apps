import { StyleSheet, Text, View } from 'react-native';
import type { ChatMessage } from '../types/chat';

type MessageBubbleProps = {
  message: ChatMessage;
};

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <View style={[styles.row, isUser ? styles.userRow : styles.assistantRow]}>
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble]}>
        <Text style={styles.text}>{message.content}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { width: '100%', marginBottom: 12 },
  userRow: { alignItems: 'flex-end' },
  assistantRow: { alignItems: 'flex-start' },
  bubble: { maxWidth: '84%', borderRadius: 18, paddingHorizontal: 16, paddingVertical: 12 },
  userBubble: { backgroundColor: '#2563eb', borderBottomRightRadius: 4 },
  assistantBubble: { backgroundColor: '#1e293b', borderBottomLeftRadius: 4 },
  text: { color: '#f8fafc', fontSize: 16, lineHeight: 23 },
});
