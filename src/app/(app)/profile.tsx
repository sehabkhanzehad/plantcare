import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { useSession } from '@/context/auth';
import { Spacing } from '@/constants/theme';

export default function ProfileScreen() {
  const { user, signOut } = useSession();

  return (
    <Screen tabBarInset>
      <View style={styles.header}>
        <ThemedText type="subtitle">Profile</ThemedText>
        <ThemedText type="default" themeColor="textSecondary">
          Your PlantCare account
        </ThemedText>
      </View>

      <ThemedView type="backgroundElement" style={styles.card}>
        <InfoRow label="Name" value={user?.name ?? '—'} />
        <InfoRow label="Email" value={user?.email ?? '—'} />
      </ThemedView>

      <Button title="Sign out" variant="danger" onPress={signOut} style={styles.signOut} />
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
    borderRadius: Spacing.three,
    gap: Spacing.three,
  },
  infoRow: {
    gap: Spacing.one,
  },
  signOut: {
    marginTop: Spacing.five,
  },
});
