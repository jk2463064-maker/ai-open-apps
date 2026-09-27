import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../theme';
import type { ChatMessage } from '../types/chat';

type MessageBubbleProps = {
  message: ChatMessage;
};

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <View style={[styles.row, isUser ? styles.userRow : styles.assistantRow]}>
      <View
        style={[
          styles.bubble,
          isUser ? styles.userBubble : styles.assistantBubble,
        ]}
      >
        <Text
          style={[
            typography.bodyMedium,
            { color: isUser ? colors.message.userText : colors.message.assistantText },
          ]}
        >
          {message.content}
        </Text>
        <Text
          style={[
            typography.labelSmall,
            {
              color: isUser ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.5)',
              marginTop: spacing.sm,
            },
          ]}
        >
          {new Date(message.createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { width: '100%', marginBottom: spacing.md },
  userRow: { alignItems: 'flex-end' },
  assistantRow: { alignItems: 'flex-start' },
  bubble: {
    maxWidth: '85%',
    borderRadius: 18,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  userBubble: {
    backgroundColor: colors.message.userBg,
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: colors.message.assistantBg,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: colors.message.borderColor,
  },
});
