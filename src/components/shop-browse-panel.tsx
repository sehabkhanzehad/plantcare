import { useMemo, useState } from 'react';
import { Image, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { BadgeCheck, Plus, Search, ShoppingBag } from 'lucide-react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import {
  formatPrice,
  formatRelativeTime,
  LISTING_CATEGORIES,
  type ListingCategory,
  type MarketplaceListing,
} from '@/constants/mock-marketplace';
import { CardRadius, Spacing } from '@/constants/theme';
import { useMarketplace } from '@/context/marketplace';
import { useTheme } from '@/hooks/use-theme';

type SellerFilter = 'All' | 'Store' | 'Users';
type CategoryFilter = 'All' | ListingCategory;

export function ShopBrowsePanel() {
  const theme = useTheme();
  const { listings } = useMarketplace();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<CategoryFilter>('All');
  const [sellerFilter, setSellerFilter] = useState<SellerFilter>('All');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return listings
      .filter((listing) => listing.status === 'active')
      .filter((listing) => {
        if (category !== 'All' && listing.category !== category) return false;
        if (sellerFilter === 'Store' && !listing.isOfficialStore) return false;
        if (sellerFilter === 'Users' && listing.isOfficialStore) return false;
        if (!q) return true;
        return `${listing.title} ${listing.description} ${listing.sellerName} ${listing.category}`
          .toLowerCase()
          .includes(q);
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [category, listings, query, sellerFilter]);

  return (
    <View style={styles.wrap}>
      <View style={styles.titleRow}>
        <View style={styles.titleCopy}>
          <ThemedText style={styles.title}>Shop</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Buy and sell plants with the community
          </ThemedText>
        </View>
        <Pressable
          accessibilityLabel="Sell a plant"
          onPress={() => router.push('/shop/create')}
          style={[styles.fab, { backgroundColor: theme.primary }]}>
          <Plus size={22} color={theme.onPrimary} strokeWidth={2.2} />
        </Pressable>
      </View>

      <View style={[styles.searchBar, { borderColor: theme.border, backgroundColor: '#FFFFFF' }]}>
        <Search size={18} color={theme.textSecondary} strokeWidth={1.8} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search listings"
          placeholderTextColor={theme.textSecondary}
          style={[styles.searchInput, { color: theme.text }]}
        />
      </View>

      <View style={styles.filters}>
        {(['All', 'Store', 'Users'] as SellerFilter[]).map((item) => {
          const active = sellerFilter === item;
          const label = item === 'Users' ? 'From users' : item;
          return (
            <Pressable
              key={item}
              onPress={() => setSellerFilter(item)}
              style={[
                styles.chip,
                { backgroundColor: active ? theme.primary : '#FFFFFF', borderColor: theme.border },
              ]}>
              <ThemedText type="small" style={{ color: active ? theme.onPrimary : theme.textSecondary }}>
                {label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.filters}>
        {(['All', ...LISTING_CATEGORIES] as CategoryFilter[]).map((item) => {
          const active = category === item;
          return (
            <Pressable
              key={item}
              onPress={() => setCategory(item)}
              style={[
                styles.chip,
                { backgroundColor: active ? theme.primary : '#FFFFFF', borderColor: theme.border },
              ]}>
              <ThemedText type="small" style={{ color: active ? theme.onPrimary : theme.textSecondary }}>
                {item}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.list}>
        {filtered.length === 0 ? (
          <ThemedView type="backgroundElement" style={[styles.empty, { backgroundColor: '#FFFFFF' }]}>
            <ShoppingBag size={28} color={theme.textSecondary} strokeWidth={1.6} />
            <ThemedText type="smallBold">No listings found</ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={styles.emptyCopy}>
              Try another filter or list a plant for sale.
            </ThemedText>
            <Button title="Sell a plant" onPress={() => router.push('/shop/create')} />
          </ThemedView>
        ) : (
          filtered.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              onPress={() => router.push({ pathname: '/shop/[id]', params: { id: listing.id } })}
            />
          ))
        )}
      </View>
    </View>
  );
}

function ListingCard({ listing, onPress }: { listing: MarketplaceListing; onPress: () => void }) {
  const theme = useTheme();
  const imageUri = listing.imageUris[0];
  const snippet =
    listing.description.length > 90
      ? `${listing.description.slice(0, 90).trim()}…`
      : listing.description;

  return (
    <Pressable onPress={onPress}>
      <ThemedView type="backgroundElement" style={[styles.card, { backgroundColor: '#FFFFFF' }]}>
        <View style={styles.cardRow}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.thumb} />
          ) : (
            <View style={[styles.thumb, styles.thumbPlaceholder, { backgroundColor: `${theme.primary}14` }]}>
              <ShoppingBag size={22} color={theme.primary} strokeWidth={1.6} />
            </View>
          )}
          <View style={styles.cardBody}>
            <ThemedText type="smallBold" style={styles.cardTitle} numberOfLines={2}>
              {listing.title}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary" numberOfLines={2}>
              {snippet}
            </ThemedText>
            <View style={styles.sellerRow}>
              <ThemedText type="small" themeColor="textSecondary">
                {listing.sellerName}
              </ThemedText>
              {listing.isOfficialStore ? (
                <View style={styles.storeBadge}>
                  <BadgeCheck size={14} color={theme.primary} strokeWidth={1.8} />
                  <ThemedText type="small" style={{ color: theme.primary }}>
                    Store
                  </ThemedText>
                </View>
              ) : null}
            </View>
            <View style={styles.cardFooter}>
              <ThemedText type="smallBold" style={{ color: theme.primary }}>
                {formatPrice(listing.price, listing.currency)}
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {formatRelativeTime(listing.createdAt)}
              </ThemedText>
            </View>
          </View>
        </View>
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: Spacing.three,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  titleCopy: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  fab: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderWidth: 1,
    borderRadius: CardRadius,
    paddingHorizontal: Spacing.three,
    minHeight: 48,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: Spacing.two,
  },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  list: {
    gap: Spacing.three,
    paddingBottom: Spacing.four,
  },
  empty: {
    borderRadius: CardRadius,
    padding: Spacing.four,
    gap: Spacing.two,
    alignItems: 'flex-start',
  },
  emptyCopy: {
    marginBottom: Spacing.two,
  },
  card: {
    borderRadius: CardRadius,
    padding: Spacing.three,
  },
  cardRow: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  thumb: {
    width: 96,
    height: 96,
    borderRadius: Spacing.three,
  },
  thumbPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: {
    flex: 1,
    gap: 4,
  },
  cardTitle: {
    fontSize: 16,
  },
  sellerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    flexWrap: 'wrap',
    marginTop: 2,
  },
  storeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.one,
  },
});
