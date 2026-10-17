import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

export type SectionHeaderProps = {
  title: string;
  trailing?: ReactNode;
};

export function SectionHeader({ title, trailing }: SectionHeaderProps) {
  return (
    <View style={styles.row}>
      <ThemedText style={styles.title}>{title}</ThemedText>
      {typeof trailing === 'string' ? (
        <ThemedText type="smallBold" themeColor="primary">{trailing}</ThemedText>
      ) : (
        trailing
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.two + 2,
  },
  title: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 17,
  },
});
