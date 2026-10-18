import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, ChevronRight, Droplets, FlaskConical } from 'lucide-react-native';
import {
  useFonts,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from '@expo-google-fonts/manrope';

import { Screen } from '@/components/ui/screen';
import { ThemedText } from '@/components/themed-text';
import { usePlants } from '@/context/plants';
import {
  countDueOnDate,
  dateKey,
  getScheduleForDate,
  type DayScheduleItem,
} from '@/lib/care';
import { CardRadius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function CalendarScreen() {
  const theme = useTheme();
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
  const schedule = getScheduleForDate(plants, selectedDate);
  const dueByDay = useMemo(() => {
    const map = new Map<string, number>();
    days.forEach((date) => {
      map.set(dateKey(date), countDueOnDate(plants, dateKey(date)));
    });
    return map;
  }, [days, plants]);

  const selected = new Date(`${selectedDate}T00:00:00`);
  const isToday = selectedDate === dateKey(days[0]);
  const dayLabel = selected.toLocaleDateString(undefined, { weekday: 'long' });
  const dateLabel = selected.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

  const waterCount = schedule.filter((item) => item.waterDue).length;
  const feedCount = schedule.filter((item) => item.fertilizeDue).length;

  if (!fontsLoaded) {
    return (
      <Screen padded style={[styles.screen, { backgroundColor: theme.background }]}>
        <ThemedText style={styles.loading}>Loading…</ThemedText>
      </Screen>
    );
  }

  return (
    <Screen scroll padded style={[styles.screen, { backgroundColor: theme.background }]}>
      <View style={styles.topBar}>
        <Pressable
          accessibilityLabel="Go back"
          onPress={() => router.back()}
          hitSlop={10}
          style={[styles.backButton, theme.cardElevated]}>
          <ArrowLeft size={18} color={theme.text} strokeWidth={1.7} />
        </Pressable>
        <ThemedText style={[styles.topLabel, { color: theme.text }]}>Care</ThemedText>
        <View style={styles.topSpacer} />
      </View>

      <View style={styles.hero}>
        <ThemedText style={[styles.eyebrow, { color: theme.textSecondary }]}>
          {isToday ? 'Today' : dayLabel}
        </ThemedText>
        <ThemedText style={[styles.heroTitle, { color: theme.text }]}>{dateLabel}</ThemedText>
        <ThemedText style={[styles.heroSub, { color: theme.textSecondary }]}>
          {schedule.length === 0
            ? 'A quiet day for your garden'
            : [
                waterCount > 0 ? `${waterCount} water` : null,
                feedCount > 0 ? `${feedCount} feed` : null,
              ]
                .filter(Boolean)
                .join(' · ')}
        </ThemedText>
      </View>

      <View style={[styles.weekCard, theme.card]}>
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
                <ThemedText
                  style={[
                    styles.dayName,
                    { color: theme.textSecondary },
                    active && { color: theme.primary },
                  ]}>
                  {date.toLocaleDateString(undefined, { weekday: 'narrow' })}
                </ThemedText>
                <View
                  style={[
                    styles.dayNumberWrap,
                    active && { backgroundColor: theme.primary, borderRadius: 999 },
                  ]}>
                  <ThemedText
                    style={[
                      styles.dayNumber,
                      { color: theme.text },
                      active && { color: theme.onPrimary },
                    ]}>
                    {date.getDate()}
                  </ThemedText>
                </View>
                <View
                  style={[
                    styles.dayDot,
                    dueCount > 0 ? { backgroundColor: theme.primary } : { backgroundColor: 'transparent' },
                    active && dueCount > 0 && { backgroundColor: theme.onPrimary },
                  ]}
                />
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>Schedule</ThemedText>
        <ThemedText style={[styles.sectionMeta, { color: theme.textSecondary }]}>
          {schedule.length} due
        </ThemedText>
      </View>

      {schedule.length === 0 ? (
        <View style={[styles.empty, theme.card]}>
          <View style={[styles.emptyRule, { backgroundColor: theme.accent }]} />
          <ThemedText style={[styles.emptyTitle, { color: theme.text }]}>All clear</ThemedText>
          <ThemedText style={[styles.emptyText, { color: theme.textSecondary }]}>
            No care tasks planned for this day.
          </ThemedText>
        </View>
      ) : (
        <View style={[styles.list, theme.card]}>
          {schedule.map((item, index) => (
            <ScheduleRow
              key={`${item.plant.id}-${item.waterDue}-${item.fertilizeDue}`}
              item={item}
              isLast={index === schedule.length - 1}
              theme={theme}
            />
          ))}
        </View>
      )}
    </Screen>
  );
}

function ScheduleRow({
  item,
  isLast,
  theme,
}: {
  item: DayScheduleItem;
  isLast: boolean;
  theme: ReturnType<typeof useTheme>;
}) {
  const { plant, waterDue, fertilizeDue } = item;
  const label = [waterDue ? 'Water' : null, fertilizeDue ? 'Feed' : null].filter(Boolean).join(' + ');
  const Icon = fertilizeDue && !waterDue ? FlaskConical : Droplets;

  return (
    <Pressable
      onPress={() => router.push({ pathname: '/plant/[id]', params: { id: plant.id } })}
      style={[styles.row, !isLast && { borderBottomColor: theme.border, borderBottomWidth: StyleSheet.hairlineWidth }]}
      accessibilityRole="button"
      accessibilityLabel={`Open ${plant.name}`}>
      <View style={[styles.rowIcon, { backgroundColor: theme.background }]}>
        <Icon size={16} color={theme.primary} strokeWidth={1.7} />
      </View>
      <View style={styles.rowCopy}>
        <ThemedText style={[styles.rowTitle, { color: theme.text }]}>{plant.name}</ThemedText>
        <ThemedText style={[styles.rowMeta, { color: theme.textSecondary }]}>
          {label} · {plant.type}
        </ThemedText>
      </View>
      <ChevronRight size={16} color={theme.textSecondary} strokeWidth={1.7} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {},
  loading: {
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  topLabel: {
    flex: 1,
    textAlign: 'center',
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
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 12,
    letterSpacing: 0.4,
  },
  heroTitle: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 40,
    lineHeight: 44,
    letterSpacing: -0.8,
  },
  heroSub: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 2,
  },
  weekCard: {
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
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 10,
    letterSpacing: 0.2,
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
  dayNumber: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 15,
    textAlign: 'center',
    includeFontPadding: false,
  },
  dayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: Spacing.three,
  },
  sectionTitle: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 17,
  },
  sectionMeta: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 12,
  },
  list: {
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
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowCopy: {
    flex: 1,
    gap: 2,
  },
  rowTitle: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 15,
  },
  rowMeta: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 12,
  },
  empty: {
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
    marginBottom: 8,
  },
  emptyTitle: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 16,
  },
  emptyText: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 13,
    textAlign: 'center',
  },
});
