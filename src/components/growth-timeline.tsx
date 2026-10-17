import { Image, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import type { GrowthEntry } from '@/context/plants';
import { CardRadius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type GrowthTimelineProps = {
  entries: GrowthEntry[];
  onRemove?: (id: string) => void;
};

export function GrowthTimeline({ entries, onRemove }: GrowthTimelineProps) {
  const theme = useTheme();
  const sorted = [...entries].sort(
    (a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime(),
  );

  if (sorted.length === 0) {
    return (
      <ThemedText type="small" themeColor="textSecondary">
        No growth photos yet.
      </ThemedText>
    );
  }

  return (
    <View style={styles.list}>
      {sorted.map((entry, index) => {
        const isLast = index === sorted.length - 1;
        return (
          <View key={entry.id} style={styles.row}>
            <View style={styles.rail}>
              <View style={[styles.dot, { backgroundColor: theme.primary, borderColor: theme.surface }]} />
              {!isLast ? <View style={[styles.line, { backgroundColor: theme.border }]} /> : null}
            </View>
            <View style={[styles.card, { backgroundColor: theme.background, borderColor: theme.border }]}>
              {entry.imageUri ? (
                <Image source={{ uri: entry.imageUri }} style={styles.thumb} />
              ) : null}
              <View style={styles.meta}>
                <ThemedText type="smallBold">
                  {new Date(entry.recordedAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </ThemedText>
                {entry.note ? (
                  <ThemedText type="small" themeColor="textSecondary">{entry.note}</ThemedText>
                ) : null}
                {onRemove ? (
                  <Pressable onPress={() => onRemove(entry.id)} hitSlop={8}>
                    <ThemedText type="smallBold" style={{ color: theme.danger }}>Remove</ThemedText>
                  </Pressable>
                ) : null}
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 0,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  rail: {
    width: 16,
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    marginTop: 6,
  },
  line: {
    flex: 1,
    width: 2,
    marginTop: 4,
    minHeight: 40,
  },
  card: {
    flex: 1,
    flexDirection: 'row',
    gap: Spacing.two,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: CardRadius - 4,
    padding: Spacing.two,
    marginBottom: Spacing.two,
  },
  thumb: {
    width: 64,
    height: 64,
    borderRadius: 12,
  },
  meta: {
    flex: 1,
    gap: 4,
    justifyContent: 'center',
  },
});
