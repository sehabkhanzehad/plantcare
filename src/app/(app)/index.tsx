import { type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { StatusChip } from '@/components/status-chip';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Screen } from '@/components/ui/screen';
import { useSession } from '@/context/auth';
import { MOCK_TODAY_TASKS, plantsNeedingAttention } from '@/constants/mock-data';
import { Spacing } from '@/constants/theme';

export default function DashboardScreen() {
  const { user } = useSession();
  const attention = plantsNeedingAttention();
  const firstName = user?.name?.split(' ')[0] || 'there';

  return (
    <Screen scroll tabBarInset>
      <View style={styles.header}>
        <ThemedText type="smallBold" themeColor="primary">
          PlantCare
        </ThemedText>
        <ThemedText type="subtitle">Hello, {firstName}</ThemedText>
        <ThemedText type="default" themeColor="textSecondary">
          Here’s what your plants need today.
        </ThemedText>
      </View>

      <Section title="Today’s tasks">
        {MOCK_TODAY_TASKS.length === 0 ? (
          <Empty text="No tasks for today. Enjoy the calm." />
        ) : (
          MOCK_TODAY_TASKS.map((task) => (
            <ThemedView key={task.id} type="backgroundElement" style={styles.row}>
              <View style={styles.rowText}>
                <ThemedText type="smallBold">{task.action}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {task.plantName}
                </ThemedText>
              </View>
              <ThemedText type="small" themeColor="primary">
                {task.due}
              </ThemedText>
            </ThemedView>
          ))
        )}
      </Section>

      <Section title="Needs attention">
        {attention.length === 0 ? (
          <Empty text="All plants look healthy." />
        ) : (
          attention.map((plant) => (
            <ThemedView key={plant.id} type="backgroundElement" style={styles.row}>
              <View style={styles.rowText}>
                <ThemedText type="smallBold">{plant.name}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  Last watered {plant.lastWatered}
                </ThemedText>
              </View>
              <StatusChip status={plant.status} />
            </ThemedView>
          ))
        )}
      </Section>
    </Screen>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <ThemedText type="smallBold">{title}</ThemedText>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <ThemedView type="backgroundElement" style={styles.empty}>
      <ThemedText type="small" themeColor="textSecondary">
        {text}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: Spacing.two,
    marginBottom: Spacing.four,
  },
  section: {
    gap: Spacing.two,
    marginBottom: Spacing.four,
  },
  sectionBody: {
    gap: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Spacing.three,
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  empty: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
  },
});
