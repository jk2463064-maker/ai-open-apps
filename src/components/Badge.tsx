import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, spacing, typography } from '../theme';

type BadgeVariant = 'primary' | 'success' | 'warning' | 'danger';

type BadgeProps = {
  label: string;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  style?: ViewStyle;
};

export function Badge({ label, variant = 'primary', size = 'sm', style }: BadgeProps) {
  const bgColor = {
    primary: colors.interactive.primary,
    success: colors.interactive.success,
    warning: colors.interactive.warning,
    danger: colors.interactive.danger,
  }[variant];

  return (
    <View
      style={[
        styles.base,
        size === 'sm' ? styles.sizeSm : styles.sizeMd,
        { backgroundColor: bgColor },
        style,
      ]}
    >
      <Text
        style={[
          size === 'sm' ? typography.labelSmall : typography.labelMedium,
          { color: colors.text.primary },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sizeSm: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  sizeMd: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
});
