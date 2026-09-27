import { StyleSheet, Text, TextInput, View, ViewStyle } from 'react-native';
import { colors, spacing, typography } from '../theme';

type InputProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  multiline?: boolean;
  maxLength?: number;
  style?: ViewStyle;
};

export function Input({
  value,
  onChangeText,
  placeholder,
  label,
  error,
  multiline = false,
  maxLength,
  style,
}: InputProps) {
  return (
    <View style={style}>
      {label && (
        <Text style={[typography.labelMedium, { color: colors.text.primary, marginBottom: spacing.sm }]}>
          {label}
        </Text>
      )}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.text.tertiary}
        style={[
          styles.input,
          multiline && styles.multiline,
          error && styles.error,
        ]}
        multiline={multiline}
        maxLength={maxLength}
      />
      {error && (
        <Text style={[typography.labelSmall, { color: colors.interactive.danger, marginTop: spacing.sm }]}>
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    minHeight: 46,
    borderRadius: 12,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    color: colors.text.primary,
    backgroundColor: colors.bg.secondary,
    borderWidth: 1,
    borderColor: colors.message.borderColor,
    fontSize: 16,
    fontWeight: '400',
  },
  multiline: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  error: {
    borderColor: colors.interactive.danger,
  },
});
