import { type ReactNode, useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';

import { StatusChip } from '@/components/status-chip';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { useSession } from '@/context/auth';
import { usePlants } from '@/context/plants';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import { useNotifications } from '@/context/notifications';

export default function DashboardScreen() {
  const theme = useTheme();
  const { user } = useSession();
  const { plants, waterPlant } = usePlants();
  const { unreadCount } = useNotifications();
  const firstName = user?.name?.split(' ')[0] || 'Plant Lover';

  const total = plants.length;
  const healthy = plants.filter((p) => p.status === 'Healthy').length;
  const attention = plants.filter((p) => p.status === 'Needs Attention').length;
  const overdue = plants.filter((p) => p.status === 'Overdue').length;

  const greeting = useMemo(() => {
    const now = new Date();
    const h = now.getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const nowStr = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const needsAttention = plants.filter((p) => p.status !== 'Healthy');

  return (
    <Screen scroll tabBarInset>
      <View style={styles.header}>
        <View style={styles.headerMain}>
          <View style={styles.brand}>
            <View style={[styles.logoMark, { backgroundColor: theme.primary }]}>
              <SymbolView
                name={{ ios: 'leaf.fill', android: 'eco', web: 'eco' }}
                tintColor={theme.onPrimary}
                size={18}
              />
            </View>
            <ThemedText type="subtitle" style={styles.brandText}>
              PlantCare
            </ThemedText>
          </View>
          <Pressable
            onPress={() => router.push('/notifications')}
            accessibilityLabel="Open notifications"
            style={[styles.notificationButton, { backgroundColor: `${theme.primary}12` }]}>
            <View style={[styles.notificationIcon, { backgroundColor: `${theme.primary}20` }]}>
              <SymbolView
                name={{
                  ios: unreadCount ? 'bell.badge.fill' : 'bell.badge',
                  android: 'notifications_active',
                  web: 'notifications_active',
                }}
                tintColor={theme.primary}
                size={18}
              />
            </View>
            {unreadCount > 0 ? (
              <View style={[styles.notificationBadge, { backgroundColor: theme.danger, borderColor: theme.background }]}>
                <ThemedText type="smallBold" style={styles.notificationBadgeText}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </ThemedText>
              </View>
            ) : null}
          </Pressable>
        </View>
        <ThemedText type="small" themeColor="textSecondary" style={styles.date}>
          {nowStr}
        </ThemedText>
      </View>

      <View style={styles.welcomeRow}>
        <ThemedText type="smallBold" themeColor="primary" style={styles.greeting}>
          {greeting}, {firstName}
        </ThemedText>
        <ThemedText type="default" themeColor="text" style={styles.welcome}>
          Welcome back to PlantCare
        </ThemedText>
      </View>

      <View style={styles.statsRow}>
        <StatCard label="Total Plants" value={total} icon="🌱" color={theme.primary} />
        <StatCard
          label="Healthy"
          value={healthy}
          icon="🍃"
          color={theme.statusHealthy}
        />
        <StatCard
          label="Needs Care"
          value={attention}
          icon="⚠"
          color={theme.statusAttention}
        />
        <StatCard label="Overdue" value={overdue} icon="⏰" color={theme.statusOverdue} />
      </View>

      <Section title="Today's tasks">
        {needsAttention.length === 0 ? (
          <Empty text="All plants look healthy today." />
        ) : (
          needsAttention.map((plant) => (
            <ThemedView
              key={plant.id}
              type="backgroundElement"
              style={styles.taskRow}
              pointerEvents="box-none">
              <View style={styles.taskText}>
                <ThemedText type="smallBold">{plant.name}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {plant.type} · Last watered {plant.lastWatered}
                </ThemedText>
              </View>
              <Button
                title="Watered"
                variant="ghost"
                onPress={() => waterPlant(plant.id)}
                style={styles.waterBtn}
              />
            </ThemedView>
          ))
        )}
      </Section>

      <Section title="Needs attention">
        {needsAttention.length === 0 ? (
          <Empty text="All your plants are doing great." />
        ) : (
          needsAttention.map((plant) => (
            <ThemedView
              key={plant.id}
              type="backgroundElement"
              style={styles.card}>
              <View style={styles.cardTop}>
                <View style={styles.cardText}>
                  <ThemedText type="smallBold">{plant.name}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {plant.type}
                  </ThemedText>
                </View>
                <StatusChip status={plant.status} />
              </View>
              <Button
                title="Mark as watered"
                variant="primary"
                onPress={() => waterPlant(plant.id)}
                style={styles.cardBtn}
              />
            </ThemedView>
          ))
        )}
      </Section>

      <View style={styles.addSection}>
        <Button
          title="Add Plant"
          icon="+"
          variant="primary"
          onPress={() => router.push('/add-plant')}
          style={styles.addBtn}
        />
      </View>
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

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon: string;
  color: string;
}) {
  return (
    <ThemedView type="backgroundElement" style={styles.statCard}>
      <View style={styles.statTop}>
        <ThemedText type="smallBold" themeColor="textSecondary" style={styles.statLabel}>
          {label}
        </ThemedText>
        <View style={[styles.iconBadge, { backgroundColor: `${color}22` }]}>
          <ThemedText type="small" style={{ color }}>
            {icon}
          </ThemedText>
        </View>
      </View>
      <ThemedText type="title" style={styles.statValue}>
        {value}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: Spacing.four,
  },
  headerMain: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  logoMark: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '-8deg' }],
  },
  brandText: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: 600,
  },
  welcomeRow: {
    alignItems: 'flex-start',
    gap: Spacing.half,
    marginBottom: Spacing.four,
  },
  greeting: {
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0.2,
  },
  welcome: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: 700,
  },
  date: {
    textAlign: 'right',
    fontSize: 14,
    lineHeight: 20,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationIcon: {
    width: 29,
    height: 29,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 5,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    lineHeight: 14,
  },
  iconBadge: {
    width: 28,
    height: 28,
    marginLeft: Spacing.two,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
    marginBottom: Spacing.four,
  },
  statCard: {
    flex: 1,
    minWidth: 150,
    padding: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.one,
  },
  statTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statLabel: {
    flex: 1,
    flexShrink: 1,
  },
  statValue: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: 700,
  },
  section: {
    gap: Spacing.two,
    marginBottom: Spacing.four,
  },
  sectionBody: {
    gap: Spacing.two,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Spacing.three,
  },
  taskText: {
    flex: 1,
    gap: 2,
  },
  waterBtn: {
    minHeight: 36,
    minWidth: 90,
    paddingHorizontal: Spacing.two,
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
  cardText: {
    flex: 1,
    gap: 2,
  },
  cardBtn: {
    minHeight: 40,
    paddingHorizontal: Spacing.three,
  },
  empty: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    alignItems: 'center',
  },
  addSection: {
    marginTop: Spacing.four,
  },
  addBtn: {
    minHeight: 56,
    borderRadius: Spacing.four,
  },
});
