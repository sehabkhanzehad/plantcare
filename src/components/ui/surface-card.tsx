import { StyleSheet, View, type ViewProps } from 'react-native';

import { CardRadius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type SurfaceCardProps = ViewProps & {
  elevated?: boolean;
  padded?: boolean;
};

export function SurfaceCard({
  children,
  elevated = false,
  padded = true,
  style,
  ...rest
}: SurfaceCardProps) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.card,
        elevated ? theme.cardElevated : theme.card,
        padded && styles.padded,
        style,
      ]}
      {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: CardRadius,
  },
  padded: {
    padding: Spacing.three,
  },
});
