import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import type { CareStatus } from '@/constants/mock-data';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function StatusChip({ status }: { status: CareStatus }) {
  const theme = useTheme();
  const color =
    status === 'Healthy'
      ? theme.statusHealthy
      : status === 'Needs Attention'
        ? theme.statusAttention
        : theme.statusOverdue;

  return (
    <View style={[styles.chip, { backgroundColor: `${color}22` }]}>
      <ThemedText type="smallBold" style={{ color }}>
        {status}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: Spacing.two,
  },
});
