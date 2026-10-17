import { Image, Pressable, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { formatPrice, formatRelativeTime } from '@/constants/mock-marketplace';
import { CardRadius, Spacing } from '@/constants/theme';
import { useSession } from '@/context/auth';
import { useMarketplace } from '@/context/marketplace';
import { useTheme } from '@/hooks/use-theme';

export default function ShopOrdersScreen() {
  const theme = useTheme();
  const { user } = useSession();
  const { getOrdersForBuyer } = useMarketplace();
  const { highlight } = useLocalSearchParams<{ highlight?: string }>();
  const orders = user?.email ? getOrdersForBuyer(user.email) : [];

  return (
    <Screen scroll padded tabBarInset>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={[styles.back, { backgroundColor: theme.surface }]}>
          <ArrowLeft size={20} color={theme.text} strokeWidth={1.8} />
        </Pressable>
        <View style={styles.headerCopy}>
          <ThemedText type="subtitle">My orders</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Simulated purchases — no real payment
          </ThemedText>
        </View>
      </View>

      {orders.length === 0 ? (
        <ThemedView type="backgroundElement" style={styles.empty}>
          <ThemedText type="smallBold">No orders yet</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Browse the shop and tap Buy now to place a simulated order.
          </ThemedText>
          <Button
            title="Browse shop"
            onPress={() => router.replace({ pathname: '/community', params: { segment: 'shop' } })}
          />
        </ThemedView>
      ) : (
        <View style={styles.list}>
          {orders.map((order) => {
            const emphasized = order.id === highlight;
            return (
              <ThemedView
                key={order.id}
                type="backgroundElement"
                style={[
                  styles.card,
                  emphasized && { borderWidth: 2, borderColor: theme.primary },
                ]}>
                <View style={styles.row}>
                  {order.imageUri ? (
                    <Image source={{ uri: order.imageUri }} style={styles.thumb} />
                  ) : null}
                  <View style={styles.meta}>
                    <ThemedText type="smallBold">{order.title}</ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      {order.sellerName}
                    </ThemedText>
                    <ThemedText type="smallBold" style={{ color: theme.primary }}>
                      {formatPrice(order.price, order.currency)}
                    </ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      {formatRelativeTime(order.placedAt)} · {order.status}
                    </ThemedText>
                  </View>
                </View>
              </ThemedView>
            );
          })}
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
    marginBottom: Spacing.four,
  },
  back: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCopy: { flex: 1, gap: 4 },
  empty: {
    borderRadius: CardRadius,
    padding: Spacing.four,
    gap: Spacing.two,
  },
  list: { gap: Spacing.three, paddingBottom: Spacing.four },
  card: {
    borderRadius: CardRadius,
    padding: Spacing.three,
  },
  row: { flexDirection: 'row', gap: Spacing.three },
  thumb: {
    width: 72,
    height: 72,
    borderRadius: Spacing.two,
  },
  meta: { flex: 1, gap: 4 },
});
