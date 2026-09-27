import { StyleSheet, View, ViewStyle } from 'react-native';
import { colors, shadows, spacing } from '../theme';

type CardProps = {
  children: React.ReactNode;
  variant?: 'elevated' | 'filled' | 'outlined';
  style?: ViewStyle;
};

export function Card({ children, variant = 'filled', style }: CardProps) {
  return (
    <View style={[styles.base, styles[variant], style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 16,
    padding: spacing.lg,
  },
  filled: {
    backgroundColor: colors.bg.secondary,
  },
  outlined: {
    backgroundColor: colors.bg.primary,
    borderWidth: 1,
    borderColor: colors.message.borderColor,
  },
  elevated: {
    backgroundColor: colors.bg.secondary,
    ...shadows.md,
  },
});
