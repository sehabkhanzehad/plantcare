import { Alert, Image, Pressable, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, BadgeCheck } from 'lucide-react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { formatPrice } from '@/constants/mock-marketplace';
import { CardRadius, Spacing } from '@/constants/theme';
import { useSession } from '@/context/auth';
import { useMarketplace } from '@/context/marketplace';
import { useNotifications } from '@/context/notifications';
import { useTheme } from '@/hooks/use-theme';

export default function ShopListingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const { user } = useSession();
  const { listings, purchaseListing } = useMarketplace();
  const { addNotification } = useNotifications();
  const listing = listings.find((item) => item.id === id);

  if (!listing) {
    return (
      <Screen padded>
        <ThemedText type="subtitle">Listing not found</ThemedText>
        <Button title="Back to shop" onPress={() => router.replace({ pathname: '/community', params: { segment: 'shop' } })} />
      </Screen>
    );
  }

  const activeListing = listing;

  const isOwner =
    !!user &&
    (activeListing.sellerId === user.email ||
      (activeListing.isOfficialStore && user.role === 'admin'));
  const canBuy = activeListing.status === 'active' && activeListing.quantity > 0 && !isOwner;

  function onBuy() {
    if (!user?.email) {
      Alert.alert('Sign in required', 'You need an account to purchase.');
      return;
    }
    Alert.alert(
      'Confirm purchase',
      `Buy "${activeListing.title}" for ${formatPrice(activeListing.price, activeListing.currency)}?\n\nPayment is simulated — no real charge.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm order',
          onPress: () => {
            const result = purchaseListing(activeListing.id, {
              id: user.email,
              name: user.name || user.email.split('@')[0],
              email: user.email,
            });
            if (!result.ok) {
              Alert.alert('Could not purchase', result.error);
              return;
            }
            addNotification({
              title: 'Order placed',
              message: `Your order for ${activeListing.title} was confirmed (simulated payment).`,
              type: 'order',
            });
            router.replace({
              pathname: '/shop/orders',
              params: { highlight: result.orderId },
            });
          },
        },
      ],
    );
  }

  return (
    <Screen scroll padded>
      <View style={styles.topBar}>
        <Pressable accessibilityLabel="Go back" onPress={() => router.back()} style={styles.iconButton}>
          <ArrowLeft size={20} color={theme.text} strokeWidth={1.8} />
        </Pressable>
        {isOwner ? (
          <Pressable onPress={() => router.push({ pathname: '/shop/edit/[id]', params: { id: activeListing.id } })}>
            <ThemedText type="smallBold" themeColor="primary">Edit</ThemedText>
          </Pressable>
        ) : null}
      </View>

      {activeListing.imageUris[0] ? (
        <Image source={{ uri: activeListing.imageUris[0] }} style={styles.hero} />
      ) : null}

      <View style={styles.header}>
        <ThemedText type="subtitle">{activeListing.title}</ThemedText>
        <ThemedText type="title" style={{ color: theme.primary }}>
          {formatPrice(activeListing.price, activeListing.currency)}
        </ThemedText>
        <View style={styles.sellerRow}>
          <ThemedText type="small" themeColor="textSecondary">
            Sold by {activeListing.sellerName}
          </ThemedText>
          {activeListing.isOfficialStore ? (
            <View style={styles.storeBadge}>
              <BadgeCheck size={16} color={theme.primary} strokeWidth={1.8} />
              <ThemedText type="small" style={{ color: theme.primary }}>
                PlantCare Store
              </ThemedText>
            </View>
          ) : null}
        </View>
      </View>

      <ThemedView type="backgroundElement" style={styles.card}>
        <Info label="Category" value={activeListing.category} />
        <Info label="Condition" value={activeListing.condition} />
        <Info label="Available" value={activeListing.quantity > 0 ? String(activeListing.quantity) : 'Sold out'} />
        <Info label="Status" value={activeListing.status === 'active' ? 'Active' : activeListing.status} />
        <ThemedText type="smallBold" style={styles.section}>Description</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">{activeListing.description}</ThemedText>
      </ThemedView>

      {canBuy ? (
        <Button title="Buy now" onPress={onBuy} style={styles.buy} />
      ) : (
        <ThemedText type="small" themeColor="textSecondary" style={styles.hint}>
          {isOwner ? 'This is your listing.' : activeListing.status !== 'active' || activeListing.quantity < 1 ? 'This item is no longer available.' : ''}
        </ThemedText>
      )}
    </Screen>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <ThemedText type="small" themeColor="textSecondary">{label}</ThemedText>
      <ThemedText type="smallBold">{value}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.three,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: {
    width: '100%',
    height: 220,
    borderRadius: CardRadius,
    marginBottom: Spacing.three,
  },
  header: {
    gap: Spacing.two,
    marginBottom: Spacing.three,
  },
  sellerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    flexWrap: 'wrap',
  },
  storeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  card: {
    borderRadius: CardRadius,
    padding: Spacing.three,
    gap: Spacing.two,
    marginBottom: Spacing.four,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  section: {
    marginTop: Spacing.two,
  },
  buy: {
    marginBottom: Spacing.four,
  },
  hint: {
    marginBottom: Spacing.four,
  },
});
