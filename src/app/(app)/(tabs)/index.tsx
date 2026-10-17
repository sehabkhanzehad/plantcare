import { useState, type ReactNode } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Link, router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useFonts, Manrope_500Medium, Manrope_600SemiBold, Manrope_700Bold, Manrope_800ExtraBold } from '@expo-google-fonts/manrope';
import { Bell, CalendarDays, Check, Droplets, FlaskConical, Flame, Leaf, ShoppingBag, Sparkles, Sun, Thermometer } from 'lucide-react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { useNotifications } from '@/context/notifications';
import { usePlants } from '@/context/plants';
import { Screen } from '@/components/ui/screen';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { BottomTabInset, CardRadius, Spacing } from '@/constants/theme';

const unsplash = (id: string, w = 480) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

const PLANTS = [
  { name: 'Monstera', image: unsplash('photo-1614594975525-e45190c55d0b'), status: 'Healthy' },
  { name: 'Snake Plant', image: unsplash('photo-1593482892290-f54927ae2c78'), status: 'Water today' },
  { name: 'Pothos', image: unsplash('photo-1585320806297-9794b3e4eeae'), status: 'Needs feed' },
] as const;

const WEEK = [
  { day: 'Mon', height: 56 }, { day: 'Tue', height: 78 }, { day: 'Wed', height: 48 },
  { day: 'Thu', height: 90 }, { day: 'Fri', height: 100 }, { day: 'Sat', height: 34 },
  { day: 'Sun', height: 34 },
];

type Task = { id: string; title: string; subtitle: string; kind: 'water' | 'mist' | 'feed' };

const TASKS: Task[] = [
  { id: 'water', title: 'Water Monstera', subtitle: '250 ml · 8:00 AM', kind: 'water' },
  { id: 'mist', title: 'Mist Fern', subtitle: 'Light mist · 9:30 AM', kind: 'mist' },
  { id: 'feed', title: 'Feed Pothos', subtitle: 'Liquid feed · 6:00 PM', kind: 'feed' },
  { id: 'check', title: 'Check soil moisture', subtitle: 'Quick check · Today', kind: 'water' },
];

export default function DashboardScreen() {
  const theme = useTheme();
  const { plants } = usePlants();
  const { unreadCount } = useNotifications();
  const [done, setDone] = useState<string[]>([]);
  const [fontsLoaded] = useFonts({ Manrope_500Medium, Manrope_600SemiBold, Manrope_700Bold, Manrope_800ExtraBold });
  const healthy = plants.filter((plant) => plant.status === 'Healthy').length;
  const health = plants.length ? Math.round((healthy / plants.length) * 100) : 86;
  const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 18 ? 'Good afternoon' : 'Good evening';
  const date = new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'short' });
  const toggleTask = (id: string) => setDone((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);

  if (!fontsLoaded) return <View style={styles.loader}><ThemedText>Loading...</ThemedText></View>;

  return (
    <Screen tabBarInset={false} style={styles.screen}>
      <View style={styles.top}>
        <View style={styles.userBlock} pointerEvents="box-none">
          <View style={styles.avatar}>
            <SymbolView
              name={{ ios: 'leaf.fill', android: 'eco', web: 'eco' }}
              tintColor={theme.onPrimary}
              size={18}
            />
          </View>
          <View style={styles.userCopy}>
            <ThemedText style={styles.date}>{date}</ThemedText>
            <ThemedText
              style={styles.greeting}
              numberOfLines={1}
              ellipsizeMode="tail">
              {greeting}
            </ThemedText>
          </View>
        </View>
        <View style={styles.topActions}>
          <Link href="/calendar" asChild>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open calendar"
              hitSlop={12}
              style={styles.bell}>
              <CalendarDays size={20} color={theme.text} strokeWidth={1.8} pointerEvents="none" />
            </Pressable>
          </Link>
          <Link href="/notifications" asChild>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open notifications"
              hitSlop={12}
              style={styles.bell}>
              <Bell size={20} color={theme.text} strokeWidth={1.8} pointerEvents="none" />
              {unreadCount > 0 ? <View style={styles.unread} pointerEvents="none" /> : null}
            </Pressable>
          </Link>
        </View>
      </View>

      <ScrollView
        style={styles.bodyScroll}
        contentContainerStyle={styles.bodyContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="always">
      <View style={styles.conditions}>
        <Condition icon={<Thermometer size={16} color={theme.primary} />} text="26°C Indoor" />
        <Condition icon={<Droplets size={16} color="#2F6F8F" />} text="68% Humidity" />
        <Condition icon={<Sun size={16} color="#8A6A12" />} text="Low Light" />
      </View>

      <View style={styles.hero}>
        <View style={styles.heroHeader}>
          <ThemedText style={styles.heroTitle}>Garden health</ThemedText>
          <Pill text="+4% this week" />
        </View>
        <View style={styles.heroContent}>
          <HealthRing score={health} />
          <View style={styles.healthRows}>
            <HealthRow label="Thriving" value={Math.max(healthy, 9)} />
            <HealthRow label="Needs care" value={plants.filter((plant) => plant.status === 'Needs Attention').length || 2} />
            <HealthRow label="At risk" value={plants.filter((plant) => plant.status === 'Overdue').length || 1} />
          </View>
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={() => router.push({ pathname: '/community', params: { segment: 'shop' } })}
        style={[styles.shopCard, { backgroundColor: theme.text }]}>
        <View style={styles.shopIcon}>
          <ShoppingBag size={22} color="#CFF27E" strokeWidth={1.8} />
        </View>
        <View style={styles.shopCopy}>
          <ThemedText style={styles.shopTitle}>Buy & sell plants</ThemedText>
          <ThemedText style={styles.shopSubtitle}>Community shop and PlantCare Store</ThemedText>
        </View>
        <ThemedText style={styles.shopCta}>Open</ThemedText>
      </Pressable>

      <SectionHeader title="Today's care" trailing={`${done.length} of ${TASKS.length} done`} />
      <View style={styles.taskList}>
        {TASKS.map((task) => <TaskRow key={task.id} task={task} complete={done.includes(task.id)} onPress={() => toggleTask(task.id)} />)}
      </View>

      <View style={styles.analytics}>
        <View style={styles.analyticsTop}>
          <View>
            <ThemedText style={styles.analyticsTitle}>Care completed</ThemedText>
            <View style={styles.analyticsValueRow}>
              <ThemedText style={styles.analyticsValue}>34</ThemedText>
              <ThemedText style={styles.analyticsSubtitle} numberOfLines={1}>tasks this week</ThemedText>
            </View>
          </View>
          <View style={styles.segment}>
            <View style={styles.segmentActive}><ThemedText style={styles.segmentText}>Week</ThemedText></View>
            <ThemedText style={styles.segmentMuted}>Month</ThemedText>
          </View>
        </View>
        <View style={styles.chart}>{WEEK.map((item, index) => {
          const { day, height } = item;
          const future = index > 4;
          return (
            <View key={day} style={styles.barColumn}>
              <View style={[
                styles.bar,
                future ? styles.futureBar : { backgroundColor: index === 4 ? theme.primary : '#DDE5DE' },
                { height },
              ]} />
              <ThemedText style={[styles.barLabel, index === 4 && styles.todayLabel]}>{day}</ThemedText>
            </View>
          );
        })}</View>
        <View style={styles.streak}><Flame size={18} color="#8A6A12" /><ThemedText style={styles.streakText}>12-day watering streak</ThemedText><ThemedText style={styles.best}>Best: 21</ThemedText></View>
      </View>

      <SectionHeader title="Environment" trailing="Last 24h" />
      <View style={styles.environment}>
        <Metric label="Soil moisture" value="64%" color="#2F6F8F" points="M2 28 C20 22 22 30 38 18 S62 20 76 10 S90 14 98 5" />
        <Metric label="Sunlight" value="5.2 h" color={theme.primary} points="M2 22 C18 8 30 28 42 19 S62 5 75 18 S88 16 98 10" />
        <Metric label="Temperature" value="26°" color="#8A6A12" points="M2 15 C16 20 25 8 39 16 S62 26 75 13 S88 14 98 9" />
      </View>

      <View style={styles.plantsHeader}>
        <View style={styles.plantsTitleRow}>
          <ThemedText style={styles.sectionTitle}>My plants</ThemedText>
          <ThemedText style={styles.totalPlants}>{plants.length || 12} total plants</ThemedText>
        </View>
        <Pressable onPress={() => router.push('/plants')}>
          <ThemedText style={styles.seeAll}>See all</ThemedText>
        </Pressable>
      </View>
      <View style={styles.plantScroller}>
        {(plants.length ? plants.slice(0, 3).map((plant, index) => ({ name: plant.name, image: plant.image || PLANTS[index % 3].image, status: plant.status })) : PLANTS).map((plant) => (
          <View key={plant.name} style={styles.plantCard}>
            <Image source={{ uri: plant.image }} style={styles.plantImage} resizeMode="cover" />
            <ThemedText style={styles.plantName} numberOfLines={1}>{plant.name}</ThemedText>
            <View style={styles.statusLine}>
              <View style={[styles.statusDot, { backgroundColor: plant.status === 'Healthy' ? theme.primary : '#8A6A12' }]} />
              <ThemedText style={styles.plantStatus} numberOfLines={1}>{plant.status}</ThemedText>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.tip}><View style={styles.tipIcon}><Sparkles size={20} color="#CFF27E" /></View><View style={styles.tipCopy}><ThemedText style={styles.tipTitle}>Smart tip</ThemedText><ThemedText style={styles.tipText}>Plants absorb more water in the morning. Try to finish watering before 10 AM.</ThemedText></View></View>
      </ScrollView>
    </Screen>
  );
}

function Condition({ icon, text }: { icon: ReactNode; text: string }) {
  const [value, ...labelParts] = text.split(' ');
  return (
    <View style={styles.condition}>
      <View style={styles.conditionIcon}>{icon}</View>
      <View style={styles.conditionCopy}>
        <ThemedText style={styles.conditionValue}>{value}</ThemedText>
        <ThemedText style={styles.conditionText}>{labelParts.join(' ')}</ThemedText>
      </View>
    </View>
  );
}

function Pill({ text }: { text: string }) { return <View style={styles.pill}><ThemedText style={styles.pillText}>{text}</ThemedText></View>; }

function HealthRing({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 48;
  return <View style={styles.ring}><Svg width={112} height={112} viewBox="0 0 112 112"><Circle cx="56" cy="56" r="48" stroke="#2B4A39" strokeWidth="10" fill="none" /><Circle cx="56" cy="56" r="48" stroke="#CFF27E" strokeWidth="10" fill="none" strokeDasharray={`${circumference}`} strokeDashoffset={`${circumference * (1 - score / 100)}`} strokeLinecap="round" rotation="-90" origin="56,56" /></Svg><View style={styles.ringText}><ThemedText style={styles.score}>{score}</ThemedText><ThemedText style={styles.outOf}>out of 100</ThemedText></View></View>;
}

function HealthRow({ label, value }: { label: string; value: number }) { return <View style={styles.healthRow}><ThemedText style={styles.healthLabel}>{label}</ThemedText><ThemedText style={styles.healthValue}>{value} {value === 1 ? 'plant' : 'plants'}</ThemedText></View>; }

function SectionHeader({ title, trailing }: { title: string; trailing: string }) { return <View style={styles.sectionHeader}><ThemedText style={styles.sectionTitle}>{title}</ThemedText><ThemedText style={styles.sectionTrailing}>{trailing}</ThemedText></View>; }

function TaskRow({ task, complete, onPress }: { task: Task; complete: boolean; onPress: () => void }) {
  const Icon = task.kind === 'water' ? Droplets : task.kind === 'mist' ? Leaf : FlaskConical;
  return <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: complete }} onPress={onPress} style={[styles.task, complete && styles.taskComplete]}><View style={[styles.taskIcon, { backgroundColor: task.kind === 'water' ? '#E3F0F5' : task.kind === 'mist' ? '#E5F2E6' : '#F7EEDB' }]}><Icon size={19} color={task.kind === 'water' ? '#2F6F8F' : task.kind === 'mist' ? '#1F6B45' : '#8A6A12'} strokeWidth={1.8} /></View><View style={styles.taskCopy}><ThemedText style={[styles.taskTitle, complete && styles.strike]}>{task.title}</ThemedText><ThemedText style={styles.taskSubtitle}>{task.subtitle}</ThemedText></View><View style={[styles.checkbox, complete && styles.checkboxDone]}>{complete ? <Check size={11} color="#FFFFFF" /> : null}</View></Pressable>;
}

function Metric({ label, value, color, points }: { label: string; value: string; color: string; points: string }) { return <View style={styles.metric}><ThemedText style={styles.metricLabel}>{label}</ThemedText><ThemedText style={styles.metricValue}>{value}</ThemedText><Svg width="100%" height={36} viewBox="0 0 100 36"><Path d={points} fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" /></Svg></View>; }

const styles = StyleSheet.create({
  screen: { backgroundColor: '#F3F5F1', flex: 1 },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F3F5F1' },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    zIndex: 10,
    elevation: 10,
  },
  userBlock: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 12, marginRight: 8 },
  userCopy: { flex: 1, width: 0, minWidth: 0 },
  avatar: { width: 48, height: 48, borderRadius: 14, backgroundColor: '#2F6F3E', alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-8deg' }] },
  date: { color: '#5B6B61', fontFamily: 'Manrope_500Medium', fontSize: 12 },
  greeting: { color: '#0E1D15', fontFamily: 'Manrope_800ExtraBold', fontSize: 19, lineHeight: 26, width: '100%' },
  topActions: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 0 },
  bell: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  unread: { position: 'absolute', top: 10, right: 10, width: 7, height: 7, borderRadius: 4, backgroundColor: '#1F6B45' },
  bodyScroll: { flex: 1 },
  bodyContent: { paddingBottom: BottomTabInset + Spacing.five },
  conditions: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  condition: { flex: 1, minHeight: 60, borderRadius: 16, backgroundColor: '#FFFFFF', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 9 },
  conditionIcon: { height: 20, justifyContent: 'center' },
  conditionCopy: { alignItems: 'center' },
  conditionValue: { fontFamily: 'Manrope_700Bold', fontSize: 15, lineHeight: 18, color: '#0E1D15' },
  conditionText: { fontFamily: 'Manrope_500Medium', fontSize: 10, lineHeight: 14, color: '#5B6B61' },
  hero: { backgroundColor: '#0F2A1D', borderRadius: CardRadius, paddingHorizontal: 22, paddingTop: 20, paddingBottom: 17, marginBottom: 22 },
  heroHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  heroTitle: { color: '#FFFFFF', fontFamily: 'Manrope_600SemiBold', fontSize: 14 },
  heroContent: { flexDirection: 'row', alignItems: 'center', gap: 22 },
  pill: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, backgroundColor: '#CFF27E' },
  pillText: { color: '#0F2A1D', fontFamily: 'Manrope_700Bold', fontSize: 10 },
  ring: { width: 112, height: 112, alignItems: 'center', justifyContent: 'center' },
  ringText: { position: 'absolute', alignItems: 'center' },
  score: { color: '#FFFFFF', fontFamily: 'Manrope_800ExtraBold', fontSize: 28, lineHeight: 30 },
  outOf: { color: '#B9C7BD', fontFamily: 'Manrope_500Medium', fontSize: 9 },
  healthRows: { flex: 1 },
  healthRow: { flexDirection: 'row', alignItems: 'center', minHeight: 39, borderTopWidth: 1, borderTopColor: '#294637' },
  healthLabel: { flex: 1, color: '#FFFFFF', fontFamily: 'Manrope_600SemiBold', fontSize: 12 },
  healthValue: { color: '#B9C7BD', fontFamily: 'Manrope_500Medium', fontSize: 12 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  sectionTitle: { color: '#0E1D15', fontFamily: 'Manrope_700Bold', fontSize: 17 },
  sectionTrailing: { color: '#1F6B45', fontFamily: 'Manrope_600SemiBold', fontSize: 11 },
  shopCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: CardRadius,
    padding: 16,
    marginBottom: 22,
  },
  shopIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#1F4A32',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shopCopy: { flex: 1, gap: 2 },
  shopTitle: { color: '#FFFFFF', fontFamily: 'Manrope_700Bold', fontSize: 15 },
  shopSubtitle: { color: '#B9C7BD', fontFamily: 'Manrope_500Medium', fontSize: 11 },
  shopCta: { color: '#CFF27E', fontFamily: 'Manrope_700Bold', fontSize: 12 },
  taskList: { gap: 8, marginBottom: 22 },
  task: { minHeight: 70, borderRadius: CardRadius, backgroundColor: '#FFFFFF', padding: 12, flexDirection: 'row', alignItems: 'center', gap: 11 },
  taskComplete: { opacity: 0.6 },
  taskIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  taskCopy: { flex: 1 },
  taskTitle: { color: '#0E1D15', fontFamily: 'Manrope_700Bold', fontSize: 13 },
  strike: { textDecorationLine: 'line-through' },
  taskSubtitle: { color: '#5B6B61', fontFamily: 'Manrope_500Medium', fontSize: 11, marginTop: 3 },
  checkbox: { width: 18, height: 18, borderRadius: 9, borderWidth: 1.5, borderColor: '#B8C5BA', alignItems: 'center', justifyContent: 'center' },
  checkboxDone: { backgroundColor: '#1F6B45', borderColor: '#1F6B45' },
  analytics: { backgroundColor: '#FFFFFF', borderRadius: CardRadius, padding: 20, marginBottom: 22 },
  analyticsTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  analyticsTitle: { color: '#0E1D15', fontFamily: 'Manrope_600SemiBold', fontSize: 14 },
  analyticsValueRow: { flexDirection: 'row', alignItems: 'baseline', gap: 7, marginTop: 2 },
  analyticsValue: { color: '#0E1D15', fontFamily: 'Manrope_800ExtraBold', fontSize: 32, lineHeight: 38 },
  analyticsSubtitle: { color: '#0E1D15', fontFamily: 'Manrope_500Medium', fontSize: 12 },
  segment: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F3EF', borderRadius: 999, padding: 3 },
  segmentActive: { backgroundColor: '#0F2A1D', borderRadius: 999, paddingHorizontal: 13, paddingVertical: 6 },
  segmentText: { color: '#FFFFFF', fontFamily: 'Manrope_600SemiBold', fontSize: 10 },
  segmentMuted: { color: '#5B6B61', fontFamily: 'Manrope_600SemiBold', fontSize: 10, paddingHorizontal: 10 },
  chart: { height: 142, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 18 },
  barColumn: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: 142, gap: 7 },
  bar: { width: 34, maxWidth: '78%', borderRadius: 9 },
  futureBar: { backgroundColor: 'transparent', borderWidth: 1, borderStyle: 'dashed', borderColor: '#B8C8BB' },
  barLabel: { color: '#8A968D', fontFamily: 'Manrope_500Medium', fontSize: 9 },
  todayLabel: { color: '#1F6B45', fontFamily: 'Manrope_700Bold' },
  streak: { marginTop: 16, borderRadius: CardRadius, padding: 11, backgroundColor: '#F7F4E9', flexDirection: 'row', alignItems: 'center', gap: 8 },
  streakText: { flex: 1, color: '#0E1D15', fontFamily: 'Manrope_600SemiBold', fontSize: 11 },
  best: { color: '#8A6A12', fontFamily: 'Manrope_600SemiBold', fontSize: 10 },
  environment: { flexDirection: 'row', gap: 8, marginBottom: 22 },
  metric: { flex: 1, borderRadius: CardRadius, backgroundColor: '#FFFFFF', padding: 11 },
  metricLabel: { color: '#5B6B61', fontFamily: 'Manrope_500Medium', fontSize: 9 },
  metricValue: { color: '#0E1D15', fontFamily: 'Manrope_800ExtraBold', fontSize: 17, marginTop: 4 },
  plantsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  plantsTitleRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  totalPlants: { color: '#5B6B61', fontFamily: 'Manrope_600SemiBold', fontSize: 10 },
  seeAll: { color: '#1F6B45', fontFamily: 'Manrope_600SemiBold', fontSize: 11 },
  plantScroller: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, paddingBottom: 22 },
  plantCard: { width: '31.8%', borderRadius: CardRadius, padding: 8, backgroundColor: '#FFFFFF' },
  plantImage: { width: '100%', height: 108, borderRadius: 15, backgroundColor: '#E1EBDD' },
  plantName: { color: '#0E1D15', fontFamily: 'Manrope_700Bold', fontSize: 13, marginTop: 8 },
  statusLine: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 5 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  plantStatus: { color: '#5B6B61', fontFamily: 'Manrope_500Medium', fontSize: 10 },
  tip: { flexDirection: 'row', gap: 11, padding: 16, borderRadius: CardRadius, backgroundColor: '#E1EBDD', marginBottom: 8 },
  tipIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#0F2A1D', alignItems: 'center', justifyContent: 'center' },
  tipCopy: { flex: 1 },
  tipTitle: { color: '#0F2A1D', fontFamily: 'Manrope_700Bold', fontSize: 13 },
  tipText: { color: '#5B6B61', fontFamily: 'Manrope_500Medium', fontSize: 11, lineHeight: 16, marginTop: 3 },
});
