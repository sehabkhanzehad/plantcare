import { useMemo, useState } from 'react';
import { Alert, Image, Modal, Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import {
  Bell,
  CalendarDays,
  Camera,
  ChevronRight,
  Droplets,
  Flame,
  HeartPulse,
  LogOut,
  Package,
  Palette,
  ShoppingBag,
  Sprout,
  Store,
  X,
} from 'lucide-react-native';
import {
  useFonts,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from '@expo-google-fonts/manrope';

import { ThemedText } from '@/components/themed-text';
import { Screen } from '@/components/ui/screen';
import { useAppearanceOptional, type AppearanceMode } from '@/context/appearance';
import { useCarePreferences } from '@/context/care-preferences';
import { useSession } from '@/context/auth';
import { useMarketplace } from '@/context/marketplace';
import { usePlants } from '@/context/plants';
import { CardRadius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { buildTodayTasks, dateKey, wateringStreak, weeklyCareTotal } from '@/lib/care';
import { ensureNotificationPermissions } from '@/lib/care-notifications';

const REMINDER_HOURS = [7, 8, 9, 12, 18, 20];

export default function ProfileScreen() {
  const theme = useTheme();
  const { user, signOut, updateProfile } = useSession();
  const { plants, careLogs } = usePlants();
  const { listings } = useMarketplace();
  const appearance = useAppearanceOptional();
  const mode = appearance?.mode ?? 'system';
  const setMode = appearance?.setMode ?? (() => undefined);
  const { reminderHour, setReminderTime } = useCarePreferences();
  const [appearanceOpen, setAppearanceOpen] = useState(false);
  const [reminderOpen, setReminderOpen] = useState(false);
  const [fontsLoaded] = useFonts({
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });

  const total = plants.length;
  const healthy = plants.filter((p) => p.status === 'Healthy').length;
  const attention = plants.filter((p) => p.status !== 'Healthy').length;
  const health = total ? Math.round((healthy / total) * 100) : 0;
  const initial = (user?.name?.charAt(0) ?? 'P').toUpperCase();
  const modeLabel = mode === 'system' ? 'System' : mode === 'light' ? 'Light' : 'Dark';

  const analytics = useMemo(() => {
    const today = dateKey(new Date());
    return {
      dueToday: buildTodayTasks(plants, today).length,
      weekTotal: weeklyCareTotal(careLogs),
      streak: wateringStreak(careLogs),
      activeListings: listings.filter((l) => l.status === 'active').length,
    };
  }, [plants, careLogs, listings]);

  async function pickAvatar() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Allow photo access to set a profile picture.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      updateProfile({ avatarUri: result.assets[0].uri });
    }
  }

  function confirmSignOut() {
    Alert.alert('Sign out', 'Leave your PlantCare session?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: signOut },
    ]);
  }

  if (!fontsLoaded) {
    return (
      <Screen padded>
        <ThemedText style={[styles.loading, { color: theme.textSecondary }]}>Loading…</ThemedText>
      </Screen>
    );
  }

  return (
    <Screen scroll tabBarInset>
      <ThemedText style={[styles.eyebrow, { color: theme.textSecondary }]}>Account</ThemedText>
      <ThemedText style={[styles.title, { color: theme.text }]}>Profile</ThemedText>

      <View style={styles.identity}>
        <Pressable
          onPress={pickAvatar}
          accessibilityRole="button"
          accessibilityLabel="Change profile photo"
          style={styles.avatarPressable}>
          <View style={[styles.avatarRing, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            {user?.avatarUri ? (
              <Image source={{ uri: user.avatarUri }} style={styles.avatarImage} />
            ) : (
              <View style={[styles.avatarFallback, { backgroundColor: theme.heroBackground }]}>
                <ThemedText style={[styles.avatarInitial, { color: theme.accent }]}>{initial}</ThemedText>
              </View>
            )}
          </View>
          <View style={[styles.cameraBadge, { backgroundColor: theme.accent, borderColor: theme.background }]}>
            <Camera size={14} color={theme.heroBackground} strokeWidth={1.8} />
          </View>
        </Pressable>

        <ThemedText style={[styles.name, { color: theme.text }]}>{user?.name ?? 'Plant Lover'}</ThemedText>
        <ThemedText style={[styles.email, { color: theme.textSecondary }]}>{user?.email ?? '—'}</ThemedText>
        {user?.role === 'admin' ? (
          <View style={[styles.rolePill, { backgroundColor: `${theme.primary}18` }]}>
            <ThemedText style={[styles.roleText, { color: theme.primary }]}>Store manager</ThemedText>
          </View>
        ) : null}
        <Pressable onPress={pickAvatar} hitSlop={8}>
          <ThemedText style={[styles.photoAction, { color: theme.primary }]}>
            {user?.avatarUri ? 'Change photo' : 'Add profile photo'}
          </ThemedText>
        </Pressable>
      </View>

      <View style={[styles.stats, { backgroundColor: theme.surface }]}>
        <Stat value={String(total)} label="Plants" />
        <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
        <Stat value={String(healthy)} label="Healthy" />
        <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
        <Stat value={String(attention)} label="Attention" />
      </View>

      <ThemedText style={[styles.sectionLabel, { color: theme.textSecondary }]}>Analytics</ThemedText>
      <View style={[styles.analytics, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={styles.metricGrid}>
          <Metric icon={Sprout} label="Total plants" value={String(total)} color={theme.primary} theme={theme} />
          <Metric icon={HeartPulse} label="Garden health" value={`${health}%`} color={theme.statusHealthy} theme={theme} />
          <Metric icon={CalendarDays} label="Due today" value={String(analytics.dueToday)} color={theme.statusAttention} theme={theme} />
          <Metric icon={Flame} label="Care this week" value={String(analytics.weekTotal)} color={theme.statusAttention} theme={theme} />
          <Metric icon={ShoppingBag} label="Listings" value={String(analytics.activeListings)} color={theme.primary} theme={theme} />
          <Metric icon={Droplets} label="Water streak" value={`${analytics.streak.current}d`} color="#2F6F8F" theme={theme} />
        </View>
      </View>

      <ThemedText style={[styles.sectionLabel, { color: theme.textSecondary }]}>Preferences</ThemedText>
      <View style={[styles.menu, { backgroundColor: theme.surface }]}>
        <SettingRow
          icon={Palette}
          label="Appearance"
          value={modeLabel}
          onPress={() => setAppearanceOpen(true)}
        />
        <SettingRow
          icon={Bell}
          label="Reminders"
          value={formatHour(reminderHour)}
          onPress={() => setReminderOpen(true)}
          isLast
        />
      </View>

      <ThemedText style={[styles.sectionLabel, { color: theme.textSecondary }]}>Shop</ThemedText>
      <View style={[styles.menu, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <MenuRow
          icon={Store}
          label="My listings"
          onPress={() => router.push('/shop/my-listings')}
        />
        <MenuRow
          icon={Package}
          label="My orders"
          onPress={() => router.push('/shop/orders')}
        />
        <MenuRow
          icon={ShoppingBag}
          label="Browse shop"
          onPress={() => router.push({ pathname: '/community', params: { segment: 'shop' } })}
          isLast
        />
      </View>

      <Pressable
        onPress={confirmSignOut}
        accessibilityRole="button"
        accessibilityLabel="Sign out"
        style={[styles.signOut, { backgroundColor: theme.surface }]}>
        <LogOut size={16} color={theme.danger} strokeWidth={1.8} />
        <ThemedText style={[styles.signOutText, { color: theme.danger }]}>Sign out</ThemedText>
      </Pressable>

      <RadioModal
        visible={appearanceOpen}
        title="Appearance"
        subtitle="Choose how PlantCare looks"
        options={[
          { label: 'System', value: 'system' },
          { label: 'Light', value: 'light' },
          { label: 'Dark', value: 'dark' },
        ]}
        selected={mode}
        onSelect={(value) => setMode(value as AppearanceMode)}
        onClose={() => setAppearanceOpen(false)}
      />
      <RadioModal
        visible={reminderOpen}
        title="Reminder time"
        subtitle="When we should nudge you to water"
        options={REMINDER_HOURS.map((hour) => ({ label: formatHour(hour), value: String(hour) }))}
        selected={String(reminderHour)}
        onSelect={async (value) => {
          setReminderTime(Number(value), 0);
          await ensureNotificationPermissions();
        }}
        onClose={() => setReminderOpen(false)}
      />
    </Screen>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  const theme = useTheme();
  return (
    <View style={styles.stat}>
      <ThemedText style={[styles.statValue, { color: theme.text }]}>{value}</ThemedText>
      <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>{label}</ThemedText>
    </View>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  color,
  theme,
}: {
  icon: typeof Store;
  label: string;
  value: string;
  color: string;
  theme: ReturnType<typeof useTheme>;
}) {
  return (
    <View style={styles.metric}>
      <View style={[styles.metricIcon, { backgroundColor: `${color}18` }]}>
        <Icon size={14} color={color} strokeWidth={1.9} />
      </View>
      <ThemedText style={[styles.metricValue, { color: theme.text }]}>{value}</ThemedText>
      <ThemedText style={[styles.metricLabel, { color: theme.textSecondary }]} numberOfLines={1}>
        {label}
      </ThemedText>
    </View>
  );
}

function MenuRow({
  icon: Icon,
  label,
  onPress,
  isLast = false,
}: {
  icon: typeof Store;
  label: string;
  onPress: () => void;
  isLast?: boolean;
}) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.menuRow,
        !isLast && styles.menuRowBorder,
        !isLast && { borderBottomColor: theme.border },
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}>
      <View style={[styles.menuIcon, { backgroundColor: theme.background }]}>
        <Icon size={16} color={theme.primary} strokeWidth={1.7} />
      </View>
      <ThemedText style={[styles.menuLabel, { color: theme.text }]}>{label}</ThemedText>
      <ChevronRight size={16} color={theme.textSecondary} strokeWidth={1.7} />
    </Pressable>
  );
}

function SettingRow({
  icon: Icon,
  label,
  value,
  onPress,
  isLast = false,
}: {
  icon: typeof Store;
  label: string;
  value: string;
  onPress: () => void;
  isLast?: boolean;
}) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${label}, ${value}`}
      style={[
        styles.settingRow,
        !isLast && styles.menuRowBorder,
        !isLast && { borderBottomColor: theme.border },
      ]}>
      <Icon size={20} color={theme.primary} strokeWidth={1.9} />
      <ThemedText style={[styles.settingLabel, { color: theme.text }]}>{label}</ThemedText>
      <ThemedText style={[styles.settingValue, { color: theme.textSecondary }]}>{value}</ThemedText>
      <ChevronRight size={18} color={theme.textSecondary} strokeWidth={1.7} />
    </Pressable>
  );
}

function RadioModal({
  visible,
  title,
  subtitle,
  options,
  selected,
  onSelect,
  onClose,
}: {
  visible: boolean;
  title: string;
  subtitle?: string;
  options: { label: string; value: string }[];
  selected: string;
  onSelect: (value: string) => void;
  onClose: () => void;
}) {
  const theme = useTheme();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <Pressable
          style={[styles.modalCard, { backgroundColor: theme.background }]}
          onPress={() => undefined}>
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderCopy}>
              <ThemedText style={[styles.modalTitle, { color: theme.text }]}>{title}</ThemedText>
              {subtitle ? (
                <ThemedText type="small" themeColor="textSecondary">
                  {subtitle}
                </ThemedText>
              ) : null}
            </View>
            <Pressable onPress={onClose} accessibilityLabel="Close" hitSlop={8}>
              <X size={20} color={theme.textSecondary} strokeWidth={1.9} />
            </Pressable>
          </View>
          <View style={styles.radioList} accessibilityRole="radiogroup">
            {options.map((option) => {
              const active = option.value === selected;
              return (
                <Pressable
                  key={option.value}
                  onPress={() => {
                    onSelect(option.value);
                    onClose();
                  }}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: active }}
                  style={[
                    styles.radioRow,
                    {
                      borderColor: active ? theme.primary : theme.border,
                      backgroundColor: active ? `${theme.primary}10` : 'transparent',
                    },
                  ]}>
                  <View
                    style={[
                      styles.radioOuter,
                      { borderColor: active ? theme.primary : theme.textSecondary },
                    ]}>
                    {active ? (
                      <View style={[styles.radioInner, { backgroundColor: theme.primary }]} />
                    ) : null}
                  </View>
                  <ThemedText style={[styles.radioLabel, { color: theme.text }]}>
                    {option.label}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function formatHour(hour: number) {
  const period = hour >= 12 ? 'PM' : 'AM';
  const h = hour % 12 === 0 ? 12 : hour % 12;
  return `${h}:00 ${period}`;
}

const styles = StyleSheet.create({
  loading: {
    fontFamily: 'Manrope_500Medium',
  },
  eyebrow: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  title: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 34,
    lineHeight: 40,
    letterSpacing: -0.6,
    marginBottom: Spacing.five,
  },
  identity: {
    alignItems: 'center',
    marginBottom: Spacing.five,
  },
  avatarPressable: {
    marginBottom: Spacing.three,
  },
  avatarRing: {
    width: 104,
    height: 104,
    borderRadius: 52,
    padding: 4,
    borderWidth: 1,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 48,
  },
  avatarFallback: {
    flex: 1,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 36,
    lineHeight: 40,
  },
  cameraBadge: {
    position: 'absolute',
    right: 2,
    bottom: 2,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
  },
  name: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 22,
    lineHeight: 28,
  },
  email: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 14,
    marginTop: 4,
  },
  rolePill: {
    marginTop: Spacing.two,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  roleText: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 11,
  },
  photoAction: {
    marginTop: Spacing.three,
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 13,
  },
  stats: {
    flexDirection: 'row',
    borderRadius: CardRadius,
    paddingVertical: 18,
    marginBottom: Spacing.five,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statDivider: {
    width: StyleSheet.hairlineWidth,
    marginVertical: 4,
  },
  statValue: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 22,
  },
  statLabel: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 11,
  },
  analytics: {
    borderRadius: CardRadius,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 18,
    marginBottom: Spacing.five,
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 18,
  },
  metric: {
    width: '33.333%',
    alignItems: 'center',
    gap: 5,
  },
  metricIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricValue: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 15,
  },
  metricLabel: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 10,
  },
  sectionLabel: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: Spacing.two,
  },
  menu: {
    borderRadius: CardRadius,
    paddingHorizontal: 4,
    marginBottom: Spacing.five,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  settingLabel: {
    flex: 1,
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 16,
  },
  settingValue: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 15,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 22, 17, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    borderRadius: CardRadius,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  modalHeaderCopy: {
    flex: 1,
    gap: 2,
  },
  modalTitle: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 20,
  },
  radioList: {
    gap: Spacing.two,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderRadius: 14,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  radioLabel: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 15,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  menuRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    flex: 1,
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 15,
  },
  signOut: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 52,
    borderRadius: CardRadius,
    marginBottom: Spacing.three,
  },
  signOutText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 14,
  },
});
