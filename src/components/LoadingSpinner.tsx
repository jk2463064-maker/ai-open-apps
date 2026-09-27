import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { colors, spacing } from '../theme';

type LoadingSpinnerProps = {
  size?: 'small' | 'large';
};

export function LoadingSpinner({ size = 'large' }: LoadingSpinnerProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator
        size={size}
        color={colors.interactive.primary}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
});
