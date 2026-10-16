import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { CalendarDays, CheckCircle2, Droplets, Leaf } from 'lucide-react-native';

import { Screen } from '@/components/ui/screen';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { usePlants, type Plant } from '@/context/plants';
import { CardRadius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

function dateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function daysBetween(from: string, to: string) {
  const start = new Date(`${from}T00:00:00`).getTime();
  const end = new Date(`${to}T00:00:00`).getTime();
  return Math.floor((end - start) / 86400000);
}

function isDueOn(plant: Plant, date: string) {
  const elapsed = daysBetween(plant.lastWatered, date);
  return elapsed >= plant.wateringFrequency && elapsed % plant.wateringFrequency === 0;
}

export default function CalendarScreen() {
  const theme = useTheme();
  const { plants } = usePlants();
  const days = useMemo(() => Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + index);
    return date;
  }), []);
  const [selectedDate, setSelectedDate] = useState(dateKey(days[0]));
  const selectedPlants = plants.filter((plant) => isDueOn(plant, selectedDate));
  const selectedLabel = new Date(`${selectedDate}T00:00:00`).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Screen scroll tabBarInset>
      <View style={styles.header}>
        <View style={styles.headingRow}>
          <View>
            <ThemedText style={styles.title}>Care calendar</ThemedText>
            <ThemedText style={styles.subtitle} themeColor="textSecondary">
              Plan your garden care
            </ThemedText>
          </View>
          <View style={[styles.headerIcon, { backgroundColor: `${theme.primary}18` }]}>
            <CalendarDays size={22} color={theme.primary} strokeWidth={1.8} />
          </View>
        </View>
      </View>

      <View style={styles.week}>
        {days.map((date) => {
          const key = dateKey(date);
          const selected = selectedDate === key;
          return (
            <Pressable
              key={key}
              onPress={() => setSelectedDate(key)}
              accessibilityRole="button"
              accessibilityLabel={`Select ${date.toDateString()}`}
              style={[styles.day, selected && { backgroundColor: theme.primary }]}>
              <ThemedText style={[styles.dayName, selected && { color: theme.onPrimary }]}>
                {date.toLocaleDateString(undefined, { weekday: 'short' }).slice(0, 3)}
              </ThemedText>
              <ThemedText style={[styles.dayNumber, selected && { color: theme.onPrimary }]}>
                {date.getDate()}
              </ThemedText>
              <View style={[styles.dayDot, { backgroundColor: selected ? theme.onPrimary : theme.primary }]} />
            </Pressable>
          );
        })}
      </View>

      <View style={styles.summaryCard}>
        <View style={[styles.summaryIcon, { backgroundColor: `${theme.primary}18` }]}>
          <Droplets size={21} color={theme.primary} strokeWidth={1.8} />
        </View>
        <View style={styles.summaryCopy}>
          <ThemedText style={styles.summaryTitle}>{selectedPlants.length} plants to water</ThemedText>
          <ThemedText style={styles.summarySubtitle} themeColor="textSecondary">{selectedLabel}</ThemedText>
        </View>
      </View>

      <ThemedText style={styles.sectionTitle}>Watering plan</ThemedText>
      {selectedPlants.length === 0 ? (
        <ThemedView type="backgroundElement" style={styles.empty}>
          <CheckCircle2 size={28} color={theme.primary} strokeWidth={1.7} />
          <ThemedText style={styles.emptyTitle}>Nothing due</ThemedText>
          <ThemedText style={styles.emptyText} themeColor="textSecondary">
            Your plants are all set for this day.
          </ThemedText>
        </ThemedView>
      ) : (
        <View style={styles.list}>
          {selectedPlants.map((plant) => <WateringCard key={plant.id} plant={plant} />)}
        </View>
      )}
    </Screen>
  );
}

function WateringCard({ plant }: { plant: Plant }) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/plant/[id]', params: { id: plant.id } })}
      style={styles.cardPressable}>
      <ThemedView type="backgroundElement" style={styles.card}>
        <View style={[styles.plantIcon, { backgroundColor: `${theme.primary}18` }]}>
          <Leaf size={20} color={theme.primary} strokeWidth={1.8} />
        </View>
        <View style={styles.cardCopy}>
          <ThemedText style={styles.plantName}>{plant.name}</ThemedText>
          <ThemedText style={styles.plantMeta} themeColor="textSecondary">
            {plant.type} · Every {plant.wateringFrequency} days
          </ThemedText>
        </View>
        <Droplets size={19} color={theme.primary} strokeWidth={1.8} />
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: Spacing.four },
  headingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 30, lineHeight: 36, fontWeight: '800' },
  subtitle: { marginTop: 3 },
  headerIcon: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  week: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.four },
  day: { width: 43, height: 70, borderRadius: 18, alignItems: 'center', justifyContent: 'center', gap: 4 },
  dayName: { color: '#718078', fontSize: 10, fontWeight: '600' },
  dayNumber: { color: '#0E1D15', fontSize: 17, fontWeight: '800' },
  dayDot: { width: 4, height: 4, borderRadius: 2 },
  summaryCard: { backgroundColor: '#0F2A1D', borderRadius: CardRadius, padding: 17, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: Spacing.four },
  summaryIcon: { width: 42, height: 42, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: '#CFF27E' },
  summaryCopy: { flex: 1 },
  summaryTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  summarySubtitle: { color: '#B9C7BD', fontSize: 12, marginTop: 3 },
  sectionTitle: { color: '#0E1D15', fontSize: 17, fontWeight: '800', marginBottom: 12 },
  list: { gap: Spacing.two },
  cardPressable: { width: '100%' },
  card: { padding: 14, borderRadius: CardRadius, flexDirection: 'row', alignItems: 'center', gap: 11 },
  plantIcon: { width: 44, height: 44, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  cardCopy: { flex: 1 },
  plantName: { fontSize: 14, fontWeight: '800' },
  plantMeta: { fontSize: 11, marginTop: 3 },
  empty: { padding: 28, borderRadius: CardRadius, alignItems: 'center', gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: '800' },
  emptyText: { fontSize: 12, textAlign: 'center' },
});
