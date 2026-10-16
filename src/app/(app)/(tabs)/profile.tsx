import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { useSession } from '@/context/auth';
import { usePlants } from '@/context/plants';
import { useTheme } from '@/hooks/use-theme';
import { CardRadius, Spacing } from '@/constants/theme';

export default function ProfileScreen() {
  const theme = useTheme();
  const { user, signOut } = useSession();
  const { plants } = usePlants();

  const total = plants.length;
  const healthy = plants.filter((p) => p.status === 'Healthy').length;
  const attention = plants.filter((p) => p.status !== 'Healthy').length;

  return (
    <Screen scroll tabBarInset>
      <View style={styles.header}>
        <ThemedText type="subtitle">Profile</ThemedText>
        <ThemedText type="default" themeColor="textSecondary">
          Your PlantCare account
        </ThemedText>
      </View>

      <ThemedView type="backgroundElement" style={styles.card}>
        <View style={styles.avatarRow}>
          <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
            <ThemedText type="title" style={styles.avatarText}>
              {user?.name?.charAt(0) ?? '?'}
            </ThemedText>
          </View>
          <View style={styles.avatarInfo}>
            <ThemedText type="title" style={styles.displayName}>
              {user?.name ?? 'Plant Lover'}
            </ThemedText>
            <ThemedText type="default" themeColor="textSecondary" style={styles.email}>
              {user?.email ?? '—'}
            </ThemedText>
          </View>
        </View>
        <ThemedView type="border" style={styles.divider} />
        <InfoRow label="Member since" value="Today" />
        <InfoRow label="Plants tracked" value={String(total)} />
        <InfoRow label="Healthy" value={String(healthy)} />
        <InfoRow label="Needs attention" value={String(attention)} />
      </ThemedView>

      <View style={styles.actions}>
        <Button
          title="Edit profile"
          variant="secondary"
          style={styles.editBtn}
          onPress={() => {}}
        />
        <Button title="Sign out" variant="danger" onPress={signOut} style={styles.signOut} />
      </View>
    </Screen>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
      <ThemedText type="smallBold">{value}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: Spacing.two,
    marginBottom: Spacing.four,
  },
  card: {
    padding: Spacing.three,
    borderRadius: CardRadius,
    gap: Spacing.three,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    marginBottom: Spacing.two,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 24,
    lineHeight: 28,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  avatarInfo: {
    gap: Spacing.one,
  },
  displayName: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '600' as const,
  },
  email: {
    fontSize: 14,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    marginVertical: Spacing.two,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.one,
    paddingVertical: Spacing.one,
  },
  actions: {
    gap: Spacing.two,
    marginTop: Spacing.five,
  },
  editBtn: {
    minHeight: 48,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
  },
  signOut: {
    minHeight: 48,
    borderRadius: Spacing.three,
  },
});
