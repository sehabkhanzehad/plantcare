import { Alert, Image, Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import {
  Camera,
  ChevronRight,
  LogOut,
  Package,
  ShoppingBag,
  Store,
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
import { useSession } from '@/context/auth';
import { usePlants } from '@/context/plants';
import { CardRadius, Spacing } from '@/constants/theme';

const INK = '#0E1D15';
const MUTED = '#6B776F';
const SOFT = '#F3F5F1';
const SURFACE = '#FFFFFF';
const FOREST = '#0F2A1D';
const ACCENT = '#CFF27E';
const LINE = '#E6EBE6';
const DANGER = '#B42318';

export default function ProfileScreen() {
  const { user, signOut, updateProfile } = useSession();
  const { plants } = usePlants();
  const [fontsLoaded] = useFonts({
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });

  const total = plants.length;
  const healthy = plants.filter((p) => p.status === 'Healthy').length;
  const attention = plants.filter((p) => p.status !== 'Healthy').length;
  const initial = (user?.name?.charAt(0) ?? 'P').toUpperCase();

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
      <Screen padded style={styles.screen}>
        <ThemedText style={styles.loading}>Loading…</ThemedText>
      </Screen>
    );
  }

  return (
    <Screen scroll tabBarInset style={styles.screen}>
      <ThemedText style={styles.eyebrow}>Account</ThemedText>
      <ThemedText style={styles.title}>Profile</ThemedText>

      <View style={styles.identity}>
        <Pressable
          onPress={pickAvatar}
          accessibilityRole="button"
          accessibilityLabel="Change profile photo"
          style={styles.avatarPressable}>
          <View style={styles.avatarRing}>
            {user?.avatarUri ? (
              <Image source={{ uri: user.avatarUri }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarFallback}>
                <ThemedText style={styles.avatarInitial}>{initial}</ThemedText>
              </View>
            )}
          </View>
          <View style={styles.cameraBadge}>
            <Camera size={14} color={FOREST} strokeWidth={1.8} />
          </View>
        </Pressable>

        <ThemedText style={styles.name}>{user?.name ?? 'Plant Lover'}</ThemedText>
        <ThemedText style={styles.email}>{user?.email ?? '—'}</ThemedText>
        {user?.role === 'admin' ? (
          <View style={styles.rolePill}>
            <ThemedText style={styles.roleText}>Store manager</ThemedText>
          </View>
        ) : null}
        <Pressable onPress={pickAvatar} hitSlop={8}>
          <ThemedText style={styles.photoAction}>
            {user?.avatarUri ? 'Change photo' : 'Add profile photo'}
          </ThemedText>
        </Pressable>
      </View>

      <View style={styles.stats}>
        <Stat value={String(total)} label="Plants" />
        <View style={styles.statDivider} />
        <Stat value={String(healthy)} label="Healthy" />
        <View style={styles.statDivider} />
        <Stat value={String(attention)} label="Attention" />
      </View>

      <ThemedText style={styles.sectionLabel}>Shop</ThemedText>
      <View style={styles.menu}>
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
        style={styles.signOut}>
        <LogOut size={16} color={DANGER} strokeWidth={1.8} />
        <ThemedText style={styles.signOutText}>Sign out</ThemedText>
      </Pressable>
    </Screen>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.stat}>
      <ThemedText style={styles.statValue}>{value}</ThemedText>
      <ThemedText style={styles.statLabel}>{label}</ThemedText>
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
  return (
    <Pressable
      onPress={onPress}
      style={[styles.menuRow, !isLast && styles.menuRowBorder]}
      accessibilityRole="button"
      accessibilityLabel={label}>
      <View style={styles.menuIcon}>
        <Icon size={16} color={FOREST} strokeWidth={1.7} />
      </View>
      <ThemedText style={styles.menuLabel}>{label}</ThemedText>
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
  eyebrow: {
    color: MUTED,
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  title: {
    color: INK,
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
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: LINE,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 48,
  },
  avatarFallback: {
    flex: 1,
    borderRadius: 48,
    backgroundColor: FOREST,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    color: ACCENT,
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
    backgroundColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: SOFT,
  },
  name: {
    color: INK,
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 22,
    lineHeight: 28,
  },
  email: {
    color: MUTED,
    fontFamily: 'Manrope_500Medium',
    fontSize: 14,
    marginTop: 4,
  },
  rolePill: {
    marginTop: Spacing.two,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: `${FOREST}12`,
  },
  roleText: {
    color: FOREST,
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 11,
  },
  photoAction: {
    marginTop: Spacing.three,
    color: FOREST,
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 13,
  },
  stats: {
    flexDirection: 'row',
    backgroundColor: SURFACE,
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
    backgroundColor: LINE,
    marginVertical: 4,
  },
  statValue: {
    color: INK,
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 22,
  },
  statLabel: {
    color: MUTED,
    fontFamily: 'Manrope_500Medium',
    fontSize: 11,
  },
  sectionLabel: {
    color: MUTED,
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: Spacing.two,
  },
  menu: {
    backgroundColor: SURFACE,
    borderRadius: CardRadius,
    paddingHorizontal: 4,
    marginBottom: Spacing.five,
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
    borderBottomColor: LINE,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: SOFT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    flex: 1,
    color: INK,
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
    backgroundColor: SURFACE,
    marginBottom: Spacing.three,
  },
  signOutText: {
    color: DANGER,
    fontFamily: 'Manrope_700Bold',
    fontSize: 14,
  },
});
