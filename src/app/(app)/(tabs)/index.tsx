import { useMemo } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import {
  useFonts,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from '@expo-google-fonts/manrope';
import {
  Bell,
  CalendarDays,
  Check,
  Droplets,
  Flame,
  FlaskConical,
  Plus,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Sun,
  Thermometer,
} from 'lucide-react-native';
import Svg, { Circle } from 'react-native-svg';

import { SectionHeader } from '@/components/ui/section-header';
import { useGardenEnvironment } from '@/context/garden-environment';
import { useMarketplace } from '@/context/marketplace';
import { useNotifications } from '@/context/notifications';
import { usePlants } from '@/context/plants';
import { useDashboardPrefs } from '@/hooks/use-dashboard-prefs';
import { Screen } from '@/components/ui/screen';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { useResolvedColorScheme, useTheme } from '@/hooks/use-theme';
import {
  addDays,
  buildTodayTasks,
  dateKey,
  getCareTip,
  isCarePaused,
  wateringStreak,
  weeklyCareTotal,
  weeklyLogDelta,
  type CareTask,
} from '@/lib/care';
import { BottomTabInset, CardRadius, Spacing } from '@/constants/theme';

const DEFAULT_PLANT_IMAGE =
  'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=480&q=80';

export default function DashboardScreen() {
  const theme = useTheme();
  const isDark = useResolvedColorScheme() === 'dark';
  const { plants, careLogs, growthEntries, waterPlant, logCare } = usePlants();
  const { environment } = useGardenEnvironment();
  const { listings } = useMarketplace();
  const { unreadCount } = useNotifications();
  const { careChartRange: range, setCareChartRange: setRange } = useDashboardPrefs();
  const [fontsLoaded] = useFonts({
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });
  const today = dateKey(new Date());
  const tasks = useMemo(() => buildTodayTasks(plants, today), [plants, today]);
  const completedToday = useMemo(() => {
    return careLogs.filter((log) => log.completedAt.startsWith(today)).length;
  }, [careLogs, today]);

  const healthy = plants.filter((plant) => plant.status === 'Healthy').length;
  const health = plants.length ? Math.round((healthy / plants.length) * 100) : 0;
  const greeting =
    new Date().getHours() < 12
      ? 'Good morning'
      : new Date().getHours() < 18
        ? 'Good afternoon'
        : 'Good evening';
  const date = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  });

  const weekDelta = weeklyLogDelta(careLogs);
  const streak = wateringStreak(careLogs);
  const weekTotal = weeklyCareTotal(careLogs);
  const tip = getCareTip(plants);
  const pausedCount = plants.filter((p) => isCarePaused(p, today)).length;

  const careWeek = useMemo(() => {
    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const now = new Date();
    const todayIndex = (now.getDay() + 6) % 7;
    const monday = new Date(now);
    monday.setHours(0, 0, 0, 0);
    monday.setDate(now.getDate() - todayIndex);
    return labels.map((day, index) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + index);
      const key = dateKey(date);
      return {
        day,
        count: careLogs.filter((log) => log.completedAt.startsWith(key)).length,
        isToday: index === todayIndex,
        isFuture: index > todayIndex,
      };
    });
  }, [careLogs]);

  const careMonth = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const todayIndex = (now.getDay() + 6) % 7;
    const monday = new Date(now);
    monday.setDate(now.getDate() - todayIndex);
    return [3, 2, 1, 0].map((offset) => {
      const start = new Date(monday);
      start.setDate(monday.getDate() - offset * 7);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      const startKey = dateKey(start);
      const endKey = dateKey(end);
      return {
        day: `W${4 - offset}`,
        count: careLogs.filter((log) => {
          const d = log.completedAt.split('T')[0];
          return d >= startKey && d <= endKey;
        }).length,
        isToday: offset === 0,
        isFuture: false,
      };
    });
  }, [careLogs]);

  const monthTotal = useMemo(() => {
    const now = new Date();
    const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    return careLogs.filter((log) => log.completedAt.startsWith(ym)).length;
  }, [careLogs]);

  const chartData = range === 'week' ? careWeek : careMonth;
  const chartMax = Math.max(...chartData.map((d) => d.count), 1);
  const rangeTotal = range === 'week' ? weekTotal : monthTotal;
  const rangeLabel = range === 'week' ? 'tasks this week' : 'tasks this month';

  const recentGrowth = useMemo(() => {
    const cutoff = addDays(today, -14);
    return growthEntries
      .filter((e) => e.recordedAt.split('T')[0] >= cutoff)
      .sort((a, b) => b.recordedAt.localeCompare(a.recordedAt))[0];
  }, [growthEntries, today]);

  const growthPlant = recentGrowth
    ? plants.find((p) => p.id === recentGrowth.plantId)
    : undefined;

  const activeListings = listings.filter((l) => l.status === 'active').length;

  function completeTask(task: CareTask) {
    if (task.kind === 'water') {
      waterPlant(task.plantId);
    } else {
      logCare(task.plantId, 'fertilized');
    }
  }

  function isTaskDoneToday(task: CareTask): boolean {
    return careLogs.some(
      (log) =>
        log.plantId === task.plantId &&
        log.completedAt.startsWith(today) &&
        (task.kind === 'water' ? log.action === 'watered' : log.action === 'fertilized'),
    );
  }

  if (!fontsLoaded) {
    return (
      <View style={[styles.loader, { backgroundColor: theme.background }]}>
        <ThemedText>Loading...</ThemedText>
      </View>
    );
  }

  return (
    <Screen tabBarInset={false} style={[styles.screen, { backgroundColor: theme.background }]}>
      <View style={styles.top}>
        <View style={styles.userBlock} pointerEvents="box-none">
          <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
            <SymbolView
              name={{ ios: 'leaf.fill', android: 'eco', web: 'eco' }}
              tintColor={theme.onPrimary}
              size={18}
            />
          </View>
          <View style={styles.userCopy}>
            <ThemedText style={[styles.date, { color: theme.textSecondary }]}>{date}</ThemedText>
            <ThemedText style={[styles.greeting, { color: theme.text }]} numberOfLines={1}>
              {greeting}
            </ThemedText>
          </View>
        </View>
        <View style={styles.topActions}>
          <Pressable
            accessibilityLabel="Open calendar"
            hitSlop={12}
            onPress={() => router.push('/calendar')}
            style={[styles.bell, theme.cardElevated]}>
            <CalendarDays size={20} color={theme.text} strokeWidth={1.8} pointerEvents="none" />
          </Pressable>
          <Pressable
            accessibilityLabel="Open notifications"
            hitSlop={12}
            onPress={() => router.push('/notifications')}
            style={[styles.bell, theme.cardElevated]}>
            <Bell size={20} color={theme.text} strokeWidth={1.8} pointerEvents="none" />
            {unreadCount > 0 ? <View style={[styles.unread, { backgroundColor: theme.primary }]} pointerEvents="none" /> : null}
          </Pressable>
        </View>
      </View>

      {pausedCount > 0 ? (
        <View style={[styles.pauseBanner, theme.card]}>
          <ThemedText type="small" themeColor="textSecondary">
            {pausedCount} plant{pausedCount === 1 ? '' : 's'} on vacation pause
          </ThemedText>
        </View>
      ) : null}

      <ScrollView
        style={styles.bodyScroll}
        contentContainerStyle={styles.bodyContent}
        showsVerticalScrollIndicator={false}>
        <View
          style={[
            styles.hero,
            {
              backgroundColor: theme.heroBackground,
              borderColor: isDark ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.12)',
              ...(isDark
                ? {
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 12 },
                    shadowOpacity: 0.5,
                    shadowRadius: 28,
                  }
                : {}),
            },
          ]}>
          <View style={styles.heroHeader}>
            <ThemedText style={styles.heroTitle}>Garden health</ThemedText>
            {weekDelta !== null ? (
              <Pill
                text={`${weekDelta >= 0 ? '+' : ''}${weekDelta}% this week`}
                accent={theme.accent}
                ink={theme.heroBackground}
              />
            ) : null}
          </View>
          <View style={styles.heroContent}>
            <HealthRing score={health} accent={theme.accent} track="rgba(255,255,255,0.15)" />
            <View style={styles.healthRows}>
              <HealthRow label="Thriving" value={healthy} muted={theme.heroMuted} />
              <HealthRow
                label="Needs care"
                value={plants.filter((p) => p.status === 'Needs Attention').length}
                muted={theme.heroMuted}
              />
              <HealthRow
                label="At risk"
                value={plants.filter((p) => p.status === 'Overdue').length}
                muted={theme.heroMuted}
              />
            </View>
          </View>
        </View>

        <View style={styles.envRow}>
          <EnvCard icon={Thermometer} value={environment.temperatureValue} label={environment.zoneLabel} theme={theme} />
          <EnvCard icon={Droplets} value={environment.humidityValue} label="Humidity" theme={theme} />
          <EnvCard icon={Sun} value={environment.lightLabel} label="Light" theme={theme} />
        </View>

        {activeListings > 0 ? (
          <>
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
            <Pressable
              onPress={() => router.push({ pathname: '/community', params: { segment: 'shop' } })}
              style={[styles.shopCard, theme.card]}>
              <View style={[styles.shopIcon, { backgroundColor: `${theme.primary}18` }]}>
                <ShoppingBag size={22} color={theme.primary} strokeWidth={1.8} />
              </View>
              <View style={styles.shopCopy}>
                <ThemedText style={[styles.shopTitle, { color: theme.text }]}>Buy & sell plants</ThemedText>
                <ThemedText style={[styles.shopSubtitle, { color: theme.textSecondary }]}>
                  {activeListings} active listing{activeListings === 1 ? '' : 's'}
                </ThemedText>
              </View>
              <View style={[styles.shopButton, { backgroundColor: theme.primary }]}>
                <ShoppingCart size={15} color={theme.onPrimary} strokeWidth={2} />
                <ThemedText style={[styles.shopButtonText, { color: theme.onPrimary }]}>Buy</ThemedText>
              </View>
            </Pressable>
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
          </>
        ) : null}

        <SectionHeader
          title="Today's care"
          trailing={`${completedToday} of ${tasks.length} done`}
        />
        {tasks.length === 0 ? (
          <View style={[styles.emptyTasks, theme.card]}>
            <ThemedText type="smallBold">All caught up</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              No watering or feeding due today.
            </ThemedText>
          </View>
        ) : (
          <View style={styles.taskList}>
            {tasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                complete={isTaskDoneToday(task)}
                onPress={() => completeTask(task)}
                theme={theme}
                isDark={isDark}
              />
            ))}
          </View>
        )}

        <View style={[styles.analytics, theme.card]}>
          <View style={styles.analyticsTop}>
            <View>
              <ThemedText style={[styles.analyticsTitle, { color: theme.text }]}>
                Care completed
              </ThemedText>
              <View style={styles.analyticsValueRow}>
                <ThemedText style={[styles.analyticsValue, { color: theme.text }]}>{rangeTotal}</ThemedText>
                <ThemedText style={[styles.analyticsSubtitle, { color: theme.textSecondary }]} numberOfLines={1}>
                  {rangeLabel}
                </ThemedText>
              </View>
            </View>
            <View style={[styles.segment, { backgroundColor: theme.background }]}>
              {(['week', 'month'] as const).map((item) => {
                const active = range === item;
                return (
                  <Pressable
                    key={item}
                    onPress={() => setRange(item)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    style={[styles.segmentItem, active && { backgroundColor: theme.primary }]}>
                    <ThemedText
                      style={[styles.segmentText, { color: active ? theme.onPrimary : theme.textSecondary }]}>
                      {item === 'week' ? 'Week' : 'Month'}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>
          </View>
          <View style={styles.chart}>
            {chartData.map((item) => (
              <View key={item.day} style={styles.barColumn}>
                <View
                  style={[
                    styles.bar,
                    item.isFuture
                      ? [styles.futureBar, { borderColor: theme.border }]
                      : { backgroundColor: item.isToday ? theme.primary : theme.primaryMuted },
                    { height: item.isFuture ? 28 : Math.max(8, (item.count / chartMax) * 76) },
                  ]}
                />
                <ThemedText
                  style={[
                    styles.barLabel,
                    { color: theme.textSecondary },
                    item.isToday && { color: theme.primary, fontWeight: '700' },
                  ]}>
                  {item.day}
                </ThemedText>
              </View>
            ))}
          </View>
          <View style={[styles.streak, { backgroundColor: `${theme.statusAttention}14` }]}>
            <Flame size={18} color={theme.statusAttention} />
            <ThemedText style={[styles.streakText, { color: theme.text }]}>
              {streak.current}-day watering streak
            </ThemedText>
            <ThemedText style={[styles.best, { color: theme.statusAttention }]}>
              Best: {streak.best}
            </ThemedText>
          </View>
        </View>

        <View style={styles.plantsHeader}>
          <View style={styles.plantsTitleRow}>
            <ThemedText style={styles.sectionTitle}>My plants</ThemedText>
            <ThemedText style={[styles.totalPlants, { color: theme.textSecondary }]}>
              {plants.length} total
            </ThemedText>
          </View>
          <Pressable onPress={() => router.push('/plants')}>
            <ThemedText type="smallBold" themeColor="primary">See all</ThemedText>
          </Pressable>
        </View>

        {plants.length === 0 ? (
          <View style={[styles.emptyGarden, theme.card]}>
            <ThemedText type="subtitle">Your garden is empty</ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={styles.emptyGardenText}>
              Add a plant to start tracking water, feed, and growth.
            </ThemedText>
            <Button title="Add plant" onPress={() => router.push('/add-plant')} />
          </View>
        ) : (
          <View style={styles.plantScroller}>
            {plants.slice(0, 3).map((plant) => (
              <Pressable
                key={plant.id}
                onPress={() => router.push({ pathname: '/plant/[id]', params: { id: plant.id } })}
                style={[styles.plantCard, theme.card]}>
                <Image
                  source={{ uri: plant.image || DEFAULT_PLANT_IMAGE }}
                  style={[styles.plantImage, { backgroundColor: theme.primaryMuted }]}
                  resizeMode="cover"
                />
                <ThemedText style={styles.plantName} numberOfLines={1}>{plant.name}</ThemedText>
                <View style={styles.statusLine}>
                  <View
                    style={[
                      styles.statusDot,
                      {
                        backgroundColor:
                          plant.status === 'Healthy' ? theme.statusHealthy : theme.statusAttention,
                      },
                    ]}
                  />
                  <ThemedText style={[styles.plantStatus, { color: theme.textSecondary }]} numberOfLines={1}>
                    {plant.status}
                  </ThemedText>
                </View>
              </Pressable>
            ))}
            {plants.length < 3 ? (
              <Pressable
                onPress={() => router.push('/add-plant')}
                style={[styles.addPlantCard, theme.card]}>
                <Plus size={22} color={theme.primary} />
                <ThemedText type="smallBold" themeColor="primary">Add</ThemedText>
              </Pressable>
            ) : null}
          </View>
        )}

        {recentGrowth && growthPlant ? (
          <Pressable
            onPress={() =>
              router.push({ pathname: '/plant/[id]', params: { id: growthPlant.id } })
            }
            style={[styles.growthTeaser, theme.card]}>
            {recentGrowth.imageUri ? (
              <Image source={{ uri: recentGrowth.imageUri }} style={styles.growthThumb} />
            ) : null}
            <View style={styles.growthTeaserCopy}>
              <ThemedText type="smallBold">Recent growth</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {growthPlant.name} · {new Date(recentGrowth.recordedAt).toLocaleDateString()}
              </ThemedText>
            </View>
          </Pressable>
        ) : null}

        <View
          style={[
            styles.tip,
            isDark ? theme.card : { backgroundColor: theme.primaryMuted },
          ]}>
          <View
            style={[
              styles.tipIcon,
              { backgroundColor: isDark ? `${theme.primary}18` : theme.heroBackground },
            ]}>
            <Sparkles size={20} color={isDark ? theme.primary : theme.accent} />
          </View>
          <View style={styles.tipCopy}>
            <ThemedText style={[styles.tipTitle, { color: theme.text }]}>{tip.title}</ThemedText>
            <ThemedText style={[styles.tipText, { color: theme.textSecondary }]}>{tip.body}</ThemedText>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

function Pill({ text, accent, ink }: { text: string; accent: string; ink: string }) {
  return (
    <View style={[styles.pill, { backgroundColor: accent }]}>
      <ThemedText style={[styles.pillText, { color: ink }]}>{text}</ThemedText>
    </View>
  );
}

function EnvCard({
  icon: Icon,
  value,
  label,
  theme,
}: {
  icon: typeof Thermometer;
  value: string;
  label: string;
  theme: ReturnType<typeof useTheme>;
}) {
  return (
    <View style={[styles.envCard, theme.card]}>
      <Icon size={19} color={theme.primary} strokeWidth={1.9} />
      <View style={styles.envCopy}>
        <ThemedText style={[styles.envValue, { color: theme.text }]} numberOfLines={1}>
          {value}
        </ThemedText>
        <ThemedText style={[styles.envLabel, { color: theme.textSecondary }]} numberOfLines={1}>
          {label}
        </ThemedText>
      </View>
    </View>
  );
}

function HealthRing({ score, accent, track }: { score: number; accent: string; track: string }) {
  const circumference = 2 * Math.PI * 48;
  return (
    <View style={styles.ring}>
      <Svg width={112} height={112} viewBox="0 0 112 112">
        <Circle cx="56" cy="56" r="48" stroke={track} strokeWidth="10" fill="none" />
        <Circle
          cx="56"
          cy="56"
          r="48"
          stroke={accent}
          strokeWidth="10"
          fill="none"
          strokeDasharray={`${circumference}`}
          strokeDashoffset={`${circumference * (1 - score / 100)}`}
          strokeLinecap="round"
          rotation="-90"
          origin="56,56"
        />
      </Svg>
      <View style={styles.ringText}>
        <ThemedText style={styles.score}>{score}</ThemedText>
        <ThemedText style={styles.outOf}>out of 100</ThemedText>
      </View>
    </View>
  );
}

function HealthRow({ label, value, muted }: { label: string; value: number; muted: string }) {
  return (
    <View style={styles.healthRow}>
      <ThemedText style={styles.healthLabel}>{label}</ThemedText>
      <ThemedText style={[styles.healthValue, { color: muted }]}>
        {value} {value === 1 ? 'plant' : 'plants'}
      </ThemedText>
    </View>
  );
}

function TaskRow({
  task,
  complete,
  onPress,
  theme,
  isDark,
}: {
  task: CareTask;
  complete: boolean;
  onPress: () => void;
  theme: ReturnType<typeof useTheme>;
  isDark: boolean;
}) {
  const Icon = task.kind === 'water' ? Droplets : FlaskConical;
  const iconBg = task.kind === 'water'
    ? isDark ? '#152228' : '#E3F0F5'
    : isDark ? '#1F1C14' : '#F7EEDB';
  const iconColor = task.kind === 'water'
    ? isDark ? '#6BA8C8' : '#2F6F8F'
    : isDark ? '#C9A85A' : '#8A6A12';

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: complete }}
      onPress={onPress}
      style={[
        styles.task,
        theme.card,
        complete && styles.taskComplete,
      ]}>
      <View style={[styles.taskIcon, { backgroundColor: iconBg }]}>
        <Icon size={19} color={iconColor} strokeWidth={1.8} />
      </View>
      <View style={styles.taskCopy}>
        <ThemedText style={[styles.taskTitle, complete && styles.strike]}>{task.title}</ThemedText>
        <ThemedText style={[styles.taskSubtitle, { color: theme.textSecondary }]}>{task.subtitle}</ThemedText>
      </View>
      <View
        style={[
          styles.checkbox,
          { borderColor: theme.border },
          complete && { backgroundColor: theme.primary, borderColor: theme.primary },
        ]}>
        {complete ? <Check size={11} color={theme.onPrimary} /> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    zIndex: 10,
  },
  userBlock: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 12, marginRight: 8 },
  userCopy: { flex: 1, width: 0, minWidth: 0 },
  avatar: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-8deg' }] },
  date: { fontFamily: 'Manrope_500Medium', fontSize: 12 },
  greeting: { fontFamily: 'Manrope_800ExtraBold', fontSize: 19, lineHeight: 26, width: '100%' },
  topActions: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 0 },
  bell: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  unread: { position: 'absolute', top: 10, right: 10, width: 7, height: 7, borderRadius: 4 },
  pauseBanner: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  bodyScroll: { flex: 1 },
  bodyContent: { paddingBottom: BottomTabInset + Spacing.five },
  envRow: { flexDirection: 'row', gap: 9, marginBottom: 12 },
  envCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingVertical: 15,
    paddingHorizontal: 13,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
  },
  envCopy: { flex: 1, minWidth: 0 },
  envValue: { fontFamily: 'Manrope_800ExtraBold', fontSize: 15, lineHeight: 19 },
  envLabel: { fontFamily: 'Manrope_500Medium', fontSize: 10.5, marginTop: 1 },
  hero: {
    borderRadius: CardRadius,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 17,
    marginBottom: 12,
  },
  heroHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  heroTitle: { color: '#FFFFFF', fontFamily: 'Manrope_600SemiBold', fontSize: 14 },
  heroContent: { flexDirection: 'row', alignItems: 'center', gap: 22 },
  pill: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  pillText: { fontFamily: 'Manrope_700Bold', fontSize: 10 },
  ring: { width: 112, height: 112, alignItems: 'center', justifyContent: 'center' },
  ringText: { position: 'absolute', alignItems: 'center' },
  score: { color: '#FFFFFF', fontFamily: 'Manrope_800ExtraBold', fontSize: 28, lineHeight: 30 },
  outOf: { color: '#B9C7BD', fontFamily: 'Manrope_500Medium', fontSize: 9 },
  healthRows: { flex: 1 },
  healthRow: { flexDirection: 'row', alignItems: 'center', minHeight: 39, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' },
  healthLabel: { flex: 1, color: '#FFFFFF', fontFamily: 'Manrope_600SemiBold', fontSize: 12 },
  healthValue: { fontFamily: 'Manrope_500Medium', fontSize: 12 },
  shopCard: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: CardRadius, padding: 16, marginBottom: 12, marginTop: 0 },
  shopIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  shopCopy: { flex: 1, gap: 2 },
  shopTitle: { fontFamily: 'Manrope_700Bold', fontSize: 15 },
  shopSubtitle: { fontFamily: 'Manrope_500Medium', fontSize: 11 },
  shopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
  },
  shopButtonText: { fontFamily: 'Manrope_700Bold', fontSize: 12 },
  divider: { height: StyleSheet.hairlineWidth, marginBottom: 12 },
  taskList: { gap: 8, marginBottom: 22 },
  emptyTasks: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: CardRadius,
    padding: Spacing.four,
    gap: 4,
    marginBottom: 22,
  },
  task: {
    minHeight: 70,
    borderRadius: CardRadius,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  taskComplete: { opacity: 0.6 },
  taskIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  taskCopy: { flex: 1 },
  taskTitle: { fontFamily: 'Manrope_700Bold', fontSize: 13 },
  strike: { textDecorationLine: 'line-through' },
  taskSubtitle: { fontFamily: 'Manrope_500Medium', fontSize: 11, marginTop: 3 },
  checkbox: { width: 18, height: 18, borderRadius: 9, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  analytics: {
    borderRadius: CardRadius,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    marginBottom: 22,
  },
  analyticsTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  analyticsTitle: { fontFamily: 'Manrope_600SemiBold', fontSize: 14 },
  segment: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    padding: 3,
  },
  segmentItem: {
    paddingHorizontal: 13,
    paddingVertical: 6,
    borderRadius: 999,
  },
  segmentText: { fontFamily: 'Manrope_600SemiBold', fontSize: 10 },
  analyticsValueRow: { flexDirection: 'row', alignItems: 'baseline', gap: 7, marginTop: 2 },
  analyticsValue: { fontFamily: 'Manrope_800ExtraBold', fontSize: 32, lineHeight: 38 },
  analyticsSubtitle: { fontFamily: 'Manrope_500Medium', fontSize: 12 },
  chart: { height: 110, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 12 },
  barColumn: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: 110, gap: 5 },
  bar: { width: 34, maxWidth: '78%', borderRadius: 9 },
  futureBar: { backgroundColor: 'transparent', borderWidth: 1, borderStyle: 'dashed' },
  barLabel: { fontFamily: 'Manrope_500Medium', fontSize: 9 },
  streak: {
    marginTop: 12,
    borderRadius: CardRadius,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  streakText: { flex: 1, fontFamily: 'Manrope_600SemiBold', fontSize: 11 },
  best: { fontFamily: 'Manrope_600SemiBold', fontSize: 10 },
  plantsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  plantsTitleRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  sectionTitle: { fontFamily: 'Manrope_700Bold', fontSize: 17 },
  totalPlants: { fontFamily: 'Manrope_600SemiBold', fontSize: 10 },
  plantScroller: { flexDirection: 'row', gap: 8, paddingBottom: 16 },
  plantCard: {
    flex: 1,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 8,
  },
  addPlantCard: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  plantImage: { width: '100%', height: 84, borderRadius: 13 },
  plantName: { fontFamily: 'Manrope_700Bold', fontSize: 13, lineHeight: 17, marginTop: 6 },
  statusLine: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  statusDot: { width: 5, height: 5, borderRadius: 3 },
  plantStatus: { fontFamily: 'Manrope_500Medium', fontSize: 10, lineHeight: 13 },
  emptyGarden: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: CardRadius,
    padding: Spacing.four,
    gap: Spacing.two,
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  emptyGardenText: { marginBottom: Spacing.two },
  growthTeaser: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: CardRadius,
    padding: 12,
    marginBottom: 16,
  },
  growthThumb: { width: 48, height: 48, borderRadius: 12 },
  growthTeaserCopy: { flex: 1, gap: 2 },
  tip: { flexDirection: 'row', gap: 11, padding: 16, borderRadius: CardRadius, marginBottom: 8 },
  tipIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  tipCopy: { flex: 1 },
  tipTitle: { fontFamily: 'Manrope_700Bold', fontSize: 13 },
  tipText: { fontFamily: 'Manrope_500Medium', fontSize: 11, lineHeight: 16, marginTop: 3 },
});
