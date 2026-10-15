import { StyleSheet, View } from 'react-native';

import { StatusChip } from '@/components/status-chip';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Screen } from '@/components/ui/screen';
import { MOCK_PLANTS } from '@/constants/mock-data';
import { Spacing } from '@/constants/theme';

export default function PlantsScreen() {
  return (
    <Screen scroll tabBarInset>
      <View style={styles.header}>
        <ThemedText type="subtitle">My Plants</ThemedText>
        <ThemedText type="default" themeColor="textSecondary">
          Placeholder list — plant CRUD comes next.
        </ThemedText>
      </View>

      <View style={styles.list}>
        {MOCK_PLANTS.map((plant) => (
          <ThemedView key={plant.id} type="backgroundElement" style={styles.card}>
            <View style={styles.cardTop}>
              <ThemedText type="smallBold">{plant.name}</ThemedText>
              <StatusChip status={plant.status} />
            </View>
            <ThemedText type="small" themeColor="textSecondary">
              {plant.type} · Last watered {plant.lastWatered}
            </ThemedText>
          </ThemedView>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: Spacing.two,
    marginBottom: Spacing.four,
  },
  list: {
    gap: Spacing.two,
  },
  card: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.two,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
});
