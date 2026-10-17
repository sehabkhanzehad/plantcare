import { useMemo, useState } from 'react';
import { Image, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ShopBrowsePanel } from '@/components/shop-browse-panel';
import { BadgeCheck, Heart, MessageCircle, Plus, Search } from 'lucide-react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import {
  formatRelativeTime,
  POST_CATEGORIES,
  type CommunityPost,
  type PostCategory,
} from '@/constants/mock-community';
import { CardRadius, Spacing } from '@/constants/theme';
import { useCommunity } from '@/context/community';
import { useTheme } from '@/hooks/use-theme';

type FilterCategory = 'All' | PostCategory;
type ExploreSegment = 'community' | 'shop';

export default function CommunityScreen() {
  const theme = useTheme();
  const { segment } = useLocalSearchParams<{ segment?: string }>();
  const { posts, comments } = useCommunity();
  const [userSegment, setUserSegment] = useState<ExploreSegment>('community');
  const explore: ExploreSegment = segment === 'shop' ? 'shop' : userSegment;
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterCategory>('All');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts
      .filter((post) => {
        const matchesCategory = filter === 'All' || post.category === filter;
        const matchesQuery =
          !q ||
          `${post.title} ${post.body} ${post.authorName} ${post.category}`
            .toLowerCase()
            .includes(q);
        return matchesCategory && matchesQuery;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [filter, posts, query]);

  const commentCount = (postId: string) =>
    comments.filter((comment) => comment.postId === postId).length;

  return (
    <Screen scroll tabBarInset>
      <View style={styles.segmentRow}>
        {(['community', 'shop'] as ExploreSegment[]).map((item) => {
          const active = explore === item;
          const label = item === 'community' ? 'Community' : 'Shop';
          return (
            <Pressable
              key={item}
              onPress={() => {
                setUserSegment(item);
                if (segment === 'shop' && item === 'community') {
                  router.setParams({ segment: '' });
                }
              }}
              style={[
                styles.segment,
                {
                  backgroundColor: active ? theme.primary : '#FFFFFF',
                  borderColor: theme.border,
                },
              ]}>
              <ThemedText type="smallBold" style={{ color: active ? theme.onPrimary : theme.textSecondary }}>
                {label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      {explore === 'shop' ? (
        <ShopBrowsePanel />
      ) : (
      <>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={styles.titleCopy}>
            <ThemedText style={styles.title}>Community</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Ask for help and share plant knowledge
            </ThemedText>
          </View>
          <Pressable
            accessibilityLabel="Create post"
            onPress={() => router.push('/post/create')}
            style={[styles.fab, { backgroundColor: theme.primary }]}>
            <Plus size={22} color={theme.onPrimary} strokeWidth={2.2} />
          </Pressable>
        </View>

        <View style={[styles.searchBar, { borderColor: theme.border, backgroundColor: '#FFFFFF' }]}>
          <Search size={18} color={theme.textSecondary} strokeWidth={1.8} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search posts"
            placeholderTextColor={theme.textSecondary}
            style={[styles.searchInput, { color: theme.text }]}
          />
        </View>

        <View style={styles.filters}>
          {(['All', ...POST_CATEGORIES] as FilterCategory[]).map((item) => {
            const active = filter === item;
            return (
              <Pressable
                key={item}
                onPress={() => setFilter(item)}
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
      </View>

      <View style={styles.list}>
        {filtered.length === 0 ? (
          <ThemedView type="backgroundElement" style={[styles.empty, { backgroundColor: '#FFFFFF' }]}>
            <ThemedText type="smallBold">No posts yet</ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={styles.emptyCopy}>
              Be the first to ask a plant question or share a tip.
            </ThemedText>
            <Button title="Create post" onPress={() => router.push('/post/create')} />
          </ThemedView>
        ) : (
          filtered.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              commentCount={commentCount(post.id)}
              onPress={() =>
                router.push({ pathname: '/post/[id]', params: { id: post.id } })
              }
            />
          ))
        )}
      </View>
      </>
      )}
    </Screen>
  );
}

function PostCard({
  post,
  commentCount,
  onPress,
}: {
  post: CommunityPost;
  commentCount: number;
  onPress: () => void;
}) {
  const theme = useTheme();
  const snippet = post.body.length > 120 ? `${post.body.slice(0, 120).trim()}…` : post.body;

  return (
    <Pressable onPress={onPress}>
      <ThemedView type="backgroundElement" style={[styles.card, { backgroundColor: '#FFFFFF' }]}>
        <View style={styles.cardTop}>
          <View style={[styles.avatar, { backgroundColor: `${theme.primary}18` }]}>
            <ThemedText type="smallBold" style={{ color: theme.primary }}>
              {post.authorName.slice(0, 1).toUpperCase()}
            </ThemedText>
          </View>
          <View style={styles.meta}>
            <ThemedText type="smallBold">{post.authorName}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {formatRelativeTime(post.createdAt)}
            </ThemedText>
          </View>
          <View style={[styles.category, { backgroundColor: `${theme.primary}14` }]}>
            <ThemedText type="small" style={{ color: theme.primary }}>
              {post.category}
            </ThemedText>
          </View>
        </View>

        <ThemedText type="smallBold" style={styles.cardTitle}>
          {post.title}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {snippet}
        </ThemedText>

        {post.imageUri ? <Image source={{ uri: post.imageUri }} style={styles.cardImage} /> : null}

        <View style={styles.cardFooter}>
          <View style={styles.stat}>
            <Heart size={16} color={theme.textSecondary} strokeWidth={1.8} />
            <ThemedText type="small" themeColor="textSecondary">
              {post.likes.length}
            </ThemedText>
          </View>
          <View style={styles.stat}>
            <MessageCircle size={16} color={theme.textSecondary} strokeWidth={1.8} />
            <ThemedText type="small" themeColor="textSecondary">
              {commentCount}
            </ThemedText>
          </View>
          {post.acceptedAnswerId ? (
            <View style={styles.solved}>
              <BadgeCheck size={16} color={theme.primary} strokeWidth={1.8} />
              <ThemedText type="small" style={{ color: theme.primary }}>
                Solved
              </ThemedText>
            </View>
          ) : null}
        </View>
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  segmentRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginBottom: Spacing.three,
  },
  segment: {
    flex: 1,
    borderWidth: 1,
    borderRadius: CardRadius,
    paddingVertical: Spacing.two,
    alignItems: 'center',
  },
  header: {
    gap: Spacing.three,
    marginBottom: Spacing.three,
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
    gap: Spacing.two,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  meta: {
    flex: 1,
    gap: 2,
  },
  category: {
    borderRadius: 999,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
  },
  cardTitle: {
    fontSize: 16,
  },
  cardImage: {
    width: '100%',
    height: 160,
    borderRadius: Spacing.three,
    marginTop: Spacing.one,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    marginTop: Spacing.one,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  solved: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
});
