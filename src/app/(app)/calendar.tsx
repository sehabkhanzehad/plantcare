import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, ChevronRight, Droplets } from 'lucide-react-native';
import {
  useFonts,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from '@expo-google-fonts/manrope';

import { Screen } from '@/components/ui/screen';
import { ThemedText } from '@/components/themed-text';
import { usePlants, type Plant } from '@/context/plants';
import { CardRadius, Spacing } from '@/constants/theme';

const INK = '#0E1D15';
const MUTED = '#6B776F';
const SOFT = '#F3F5F1';
const SURFACE = '#FFFFFF';
const FOREST = '#0F2A1D';
const ACCENT = '#CFF27E';
const LINE = '#E6EBE6';

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
  const { plants } = usePlants();
  const [fontsLoaded] = useFonts({
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });

  const days = useMemo(
    () =>
      Array.from({ length: 7 }, (_, index) => {
        const date = new Date();
        date.setHours(0, 0, 0, 0);
        date.setDate(date.getDate() + index);
        return date;
      }),
    [],
  );

  const [selectedDate, setSelectedDate] = useState(dateKey(days[0]));
  const selectedPlants = plants.filter((plant) => isDueOn(plant, selectedDate));
  const dueByDay = useMemo(() => {
    const map = new Map<string, number>();
    days.forEach((date) => {
      const key = dateKey(date);
      map.set(key, plants.filter((plant) => isDueOn(plant, key)).length);
    });
    return map;
  }, [days, plants]);

  const selected = new Date(`${selectedDate}T00:00:00`);
  const isToday = selectedDate === dateKey(days[0]);
  const dayLabel = selected.toLocaleDateString(undefined, { weekday: 'long' });
  const dateLabel = selected.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

  if (!fontsLoaded) {
    return (
      <Screen padded style={styles.screen}>
        <ThemedText style={styles.loading}>Loading…</ThemedText>
      </Screen>
    );
  }

  return (
    <Screen scroll padded style={styles.screen}>
      <View style={styles.topBar}>
        <Pressable
          accessibilityLabel="Go back"
          onPress={() => router.back()}
          hitSlop={10}
          style={styles.backButton}>
          <ArrowLeft size={18} color={INK} strokeWidth={1.7} />
        </Pressable>
        <ThemedText style={styles.topLabel}>Care</ThemedText>
        <View style={styles.topSpacer} />
      </View>

      <View style={styles.hero}>
        <ThemedText style={styles.eyebrow}>{isToday ? 'Today' : dayLabel}</ThemedText>
        <ThemedText style={styles.heroTitle}>{dateLabel}</ThemedText>
        <ThemedText style={styles.heroSub}>
          {selectedPlants.length === 0
            ? 'A quiet day for your garden'
            : `${selectedPlants.length} plant${selectedPlants.length === 1 ? '' : 's'} need water`}
        </ThemedText>
      </View>

      <View style={styles.weekCard}>
        <View style={styles.week}>
          {days.map((date) => {
            const key = dateKey(date);
            const active = selectedDate === key;
            const dueCount = dueByDay.get(key) ?? 0;
            return (
              <Pressable
                key={key}
                onPress={() => setSelectedDate(key)}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                accessibilityLabel={`Select ${date.toDateString()}`}
                style={styles.day}
                android_ripple={{ color: 'transparent' }}>
                <ThemedText style={[styles.dayName, active && styles.dayNameActive]}>
                  {date.toLocaleDateString(undefined, { weekday: 'narrow' })}
                </ThemedText>
                <View
                  style={[
                    styles.dayNumberWrap,
                    active && styles.dayNumberWrapActive,
                  ]}>
                  <ThemedText style={[styles.dayNumber, active && styles.dayNumberActive]}>
                    {date.getDate()}
                  </ThemedText>
                </View>
                <View
                  style={[
                    styles.dayDot,
                    dueCount > 0 ? styles.dayDotOn : styles.dayDotOff,
                    active && dueCount > 0 && styles.dayDotActive,
                  ]}
                />
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <ThemedText style={styles.sectionTitle}>Schedule</ThemedText>
        <ThemedText style={styles.sectionMeta}>
          {selectedPlants.length} due
        </ThemedText>
      </View>

      {selectedPlants.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.emptyRule} />
          <ThemedText style={styles.emptyTitle}>All clear</ThemedText>
          <ThemedText style={styles.emptyText}>
            No watering planned for this day.
          </ThemedText>
        </View>
      ) : (
        <View style={styles.list}>
          {selectedPlants.map((plant, index) => (
            <WateringRow
              key={plant.id}
              plant={plant}
              isLast={index === selectedPlants.length - 1}
            />
          ))}
        </View>
      )}
    </Screen>
  );
}

function WateringRow({ plant, isLast }: { plant: Plant; isLast: boolean }) {
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/plant/[id]', params: { id: plant.id } })}
      style={[styles.row, !isLast && styles.rowBorder]}
      accessibilityRole="button"
      accessibilityLabel={`Open ${plant.name}`}>
      <View style={styles.rowIcon}>
        <Droplets size={16} color={FOREST} strokeWidth={1.7} />
      </View>
      <View style={styles.rowCopy}>
        <ThemedText style={styles.rowTitle}>{plant.name}</ThemedText>
        <ThemedText style={styles.rowMeta}>
          {plant.type} · every {plant.wateringFrequency}d
        </ThemedText>
      </View>
      <ChevronRight size={16} color="#A3AFA6" strokeWidth={1.7} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: SOFT,
  },
  loading: {
    color: MUTED,
    fontFamily: 'Manrope_500Medium',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.five,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: SURFACE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topLabel: {
    flex: 1,
    textAlign: 'center',
    color: INK,
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 13,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  topSpacer: {
    width: 40,
  },
  hero: {
    marginBottom: Spacing.five,
    gap: 6,
  },
  eyebrow: {
    color: MUTED,
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 12,
    letterSpacing: 0.4,
  },
  heroTitle: {
    color: INK,
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 40,
    lineHeight: 44,
    letterSpacing: -0.8,
  },
  heroSub: {
    color: MUTED,
    fontFamily: 'Manrope_500Medium',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 2,
  },
  weekCard: {
    backgroundColor: SURFACE,
    borderRadius: CardRadius,
    paddingVertical: 14,
    paddingHorizontal: 8,
    marginBottom: Spacing.five,
  },
  week: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  day: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  dayName: {
    color: '#9AA49C',
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 10,
    letterSpacing: 0.2,
  },
  dayNameActive: {
    color: FOREST,
  },
  dayNumberWrap: {
    width: 36,
    height: 36,
    borderRadius: 999,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  dayNumberWrapActive: {
    backgroundColor: FOREST,
    borderRadius: 999,
  },
  dayNumber: {
    color: INK,
    fontFamily: 'Manrope_700Bold',
    fontSize: 15,
    textAlign: 'center',
    includeFontPadding: false,
  },
  dayNumberActive: {
    color: ACCENT,
  },
  dayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  dayDotOn: {
    backgroundColor: FOREST,
  },
  dayDotOff: {
    backgroundColor: 'transparent',
  },
  dayDotActive: {
    backgroundColor: ACCENT,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: Spacing.three,
  },
  sectionTitle: {
    color: INK,
    fontFamily: 'Manrope_700Bold',
    fontSize: 17,
  },
  sectionMeta: {
    color: MUTED,
    fontFamily: 'Manrope_500Medium',
    fontSize: 12,
  },
  list: {
    backgroundColor: SURFACE,
    borderRadius: CardRadius,
    paddingHorizontal: 4,
    marginBottom: Spacing.five,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: LINE,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: SOFT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowCopy: {
    flex: 1,
    gap: 2,
  },
  rowTitle: {
    color: INK,
    fontFamily: 'Manrope_700Bold',
    fontSize: 15,
  },
  rowMeta: {
    color: MUTED,
    fontFamily: 'Manrope_500Medium',
    fontSize: 12,
  },
  empty: {
    backgroundColor: SURFACE,
    borderRadius: CardRadius,
    paddingVertical: 36,
    paddingHorizontal: 24,
    alignItems: 'center',
    gap: 8,
    marginBottom: Spacing.five,
  },
  emptyRule: {
    width: 28,
    height: 2,
    borderRadius: 1,
    backgroundColor: ACCENT,
    marginBottom: 8,
  },
  emptyTitle: {
    color: INK,
    fontFamily: 'Manrope_700Bold',
    fontSize: 16,
  },
  emptyText: {
    color: MUTED,
    fontFamily: 'Manrope_500Medium',
    fontSize: 13,
    textAlign: 'center',
  },
});
