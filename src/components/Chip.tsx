import { StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';
import { colors, spacing, typography } from '../theme';

type ChipVariant = 'filled' | 'outlined';

type ChipProps = {
  label: string;
  onPress?: () => void;
  variant?: ChipVariant;
  selected?: boolean;
  style?: ViewStyle;
};

export function Chip({
  label,
  onPress,
  variant = 'filled',
  selected = false,
  style,
}: ChipProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.base,
        styles[variant],
        selected && styles.selected,
        style,
      ]}
      activeOpacity={0.7}
    >
      <Text style={[typography.labelMedium, styles.text]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filled: {
    backgroundColor: colors.bg.tertiary,
  },
  outlined: {
    borderWidth: 1,
    borderColor: colors.message.borderColor,
  },
  selected: {
    backgroundColor: colors.interactive.primary,
  },
  text: {
    color: colors.text.primary,
  },
});
