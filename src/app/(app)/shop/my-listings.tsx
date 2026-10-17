import { Image, Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, BadgeCheck } from 'lucide-react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import {
  formatPrice,
  PLANTCARE_STORE_ID,
  PLANTCARE_STORE_NAME,
} from '@/constants/mock-marketplace';
import { CardRadius, Spacing } from '@/constants/theme';
import { useSession } from '@/context/auth';
import { useMarketplace } from '@/context/marketplace';
import { useTheme } from '@/hooks/use-theme';

export default function MyShopListingsScreen() {
  const theme = useTheme();
  const { user } = useSession();
  const { getListingsForSeller } = useMarketplace();

  const sellerKey =
    user?.role === 'admin' ? PLANTCARE_STORE_ID : user?.email ?? '';
  const listings = sellerKey ? getListingsForSeller(sellerKey) : [];
  const isStoreManager = user?.role === 'admin';

  return (
    <Screen scroll padded tabBarInset>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={[styles.back, { backgroundColor: theme.surface }]}>
          <ArrowLeft size={20} color={theme.text} strokeWidth={1.8} />
        </Pressable>
        <View style={styles.headerCopy}>
          <ThemedText type="subtitle">My listings</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {isStoreManager
              ? `Managing ${PLANTCARE_STORE_NAME} inventory`
              : 'Plants you are selling'}
          </ThemedText>
        </View>
      </View>

      <Button
        title={isStoreManager ? 'Add store product' : 'Sell a plant'}
        onPress={() => router.push('/shop/create')}
        style={styles.add}
      />

      {listings.length === 0 ? (
        <ThemedView type="backgroundElement" style={styles.empty}>
          <ThemedText type="smallBold">No active listings</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Create a listing to show it in the shop.
          </ThemedText>
        </ThemedView>
      ) : (
        <View style={styles.list}>
          {listings.map((listing) => (
            <Pressable
              key={listing.id}
              onPress={() => router.push({ pathname: '/shop/[id]', params: { id: listing.id } })}>
              <ThemedView type="backgroundElement" style={styles.card}>
                <View style={styles.row}>
                  {listing.imageUris[0] ? (
                    <Image source={{ uri: listing.imageUris[0] }} style={styles.thumb} />
                  ) : null}
                  <View style={styles.meta}>
                    <ThemedText type="smallBold">{listing.title}</ThemedText>
                    <ThemedText type="smallBold" style={{ color: theme.primary }}>
                      {formatPrice(listing.price, listing.currency)}
                    </ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      {listing.status} · Qty {listing.quantity}
                    </ThemedText>
                    {listing.isOfficialStore ? (
                      <View style={styles.badge}>
                        <BadgeCheck size={14} color={theme.primary} strokeWidth={1.8} />
                        <ThemedText type="small" style={{ color: theme.primary }}>Store</ThemedText>
                      </View>
                    ) : null}
                  </View>
                </View>
                <Pressable
                  onPress={() =>
                    router.push({ pathname: '/shop/edit/[id]', params: { id: listing.id } })
                  }>
                  <ThemedText type="smallBold" themeColor="primary">Edit</ThemedText>
                </Pressable>
              </ThemedView>
            </Pressable>
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    marginBottom: Spacing.three,
  },
  back: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCopy: { flex: 1, gap: 4 },
  add: { marginBottom: Spacing.three },
  empty: {
    borderRadius: CardRadius,
    padding: Spacing.four,
    gap: Spacing.two,
  },
  list: { gap: Spacing.three, paddingBottom: Spacing.four },
  card: {
    borderRadius: CardRadius,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  row: { flexDirection: 'row', gap: Spacing.three },
  thumb: {
    width: 72,
    height: 72,
    borderRadius: Spacing.two,
  },
  meta: { flex: 1, gap: 4 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
});
