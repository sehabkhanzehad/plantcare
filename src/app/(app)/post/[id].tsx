import { useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, BadgeCheck, Flag, Heart } from 'lucide-react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { formatRelativeTime } from '@/constants/mock-community';
import { CardRadius, Spacing } from '@/constants/theme';
import { useSession } from '@/context/auth';
import { useCommunity } from '@/context/community';
import { useTheme } from '@/hooks/use-theme';

export default function CommunityPostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const { user } = useSession();
  const {
    posts,
    getCommentsForPost,
    toggleLike,
    addComment,
    acceptAnswer,
    reportPost,
  } = useCommunity();
  const [answer, setAnswer] = useState('');
  const post = posts.find((item) => item.id === id);
  const comments = post ? getCommentsForPost(post.id) : [];
  const userId = user?.email ?? '';
  const liked = post ? post.likes.includes(userId) : false;
  const isOwner = !!post && !!userId && post.authorId === userId;

  if (!post) {
    return (
      <Screen padded>
        <ThemedText type="subtitle">Post not found</ThemedText>
        <Button title="Back to community" onPress={() => router.replace('/community')} />
      </Screen>
    );
  }

  const currentPost = post;

  function onReport() {
    Alert.alert('Report post', 'Mark this post for review?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Report',
        style: 'destructive',
        onPress: () => {
          reportPost(currentPost.id);
          Alert.alert('Reported', 'Thanks — moderators can review this later.');
        },
      },
    ]);
  }

  function onSubmitAnswer() {
    if (!user?.email) {
      Alert.alert('Sign in required', 'You need an account to reply.');
      return;
    }
    if (!answer.trim()) return;
    addComment({
      postId: currentPost.id,
      authorId: user.email,
      authorName: user.name || user.email.split('@')[0],
      body: answer,
    });
    setAnswer('');
  }

  return (
    <Screen scroll padded>
      <View style={styles.topBar}>
        <Pressable accessibilityLabel="Go back" onPress={() => router.back()} style={[styles.iconButton, { backgroundColor: theme.surface }]}>
          <ArrowLeft size={20} color={theme.text} strokeWidth={1.8} />
        </Pressable>
        <Pressable accessibilityLabel="Report post" onPress={onReport} style={[styles.iconButton, { backgroundColor: theme.surface }]}>
          <Flag size={18} color={post.reported ? theme.danger : theme.textSecondary} strokeWidth={1.8} />
        </Pressable>
      </View>

      <ThemedView type="backgroundElement" style={styles.card}>
        <View style={styles.metaRow}>
          <View style={[styles.avatar, { backgroundColor: `${theme.primary}18` }]}>
            <ThemedText type="smallBold" style={{ color: theme.primary }}>
              {post.authorName.slice(0, 1).toUpperCase()}
            </ThemedText>
          </View>
          <View style={styles.metaCopy}>
            <ThemedText type="smallBold">{post.authorName}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {formatRelativeTime(post.createdAt)} · {post.category}
            </ThemedText>
          </View>
        </View>

        <ThemedText type="subtitle" style={styles.title}>
          {post.title}
        </ThemedText>
        <ThemedText type="default" themeColor="textSecondary">
          {post.body}
        </ThemedText>
        {post.imageUri ? <Image source={{ uri: post.imageUri }} style={styles.image} /> : null}

        <View style={styles.actions}>
          <Pressable
            onPress={() => userId && toggleLike(post.id, userId)}
            style={styles.likeButton}
            accessibilityLabel={liked ? 'Unlike post' : 'Like post'}>
            <Heart
              size={18}
              color={liked ? theme.danger : theme.textSecondary}
              fill={liked ? theme.danger : 'transparent'}
              strokeWidth={1.8}
            />
            <ThemedText type="small" themeColor="textSecondary">
              {post.likes.length}
            </ThemedText>
          </Pressable>
          {post.reported ? (
            <ThemedText type="small" style={{ color: theme.danger }}>
              Reported
            </ThemedText>
          ) : null}
          {post.acceptedAnswerId ? (
            <View style={styles.solved}>
              <BadgeCheck size={16} color={theme.primary} />
              <ThemedText type="small" style={{ color: theme.primary }}>
                Solved
              </ThemedText>
            </View>
          ) : null}
        </View>
      </ThemedView>

      <ThemedText type="smallBold" style={styles.sectionTitle}>
        Answers ({comments.length})
      </ThemedText>

      <View style={styles.comments}>
        {comments.length === 0 ? (
          <ThemedView type="backgroundElement" style={styles.empty}>
            <ThemedText type="small" themeColor="textSecondary">
              No answers yet. Share what has worked for you.
            </ThemedText>
          </ThemedView>
        ) : (
          comments.map((comment) => {
            const accepted = post.acceptedAnswerId === comment.id;
            return (
              <ThemedView
                key={comment.id}
                type="backgroundElement"
                style={[
                  styles.comment,
                  { backgroundColor: theme.surface, borderColor: accepted ? theme.primary : 'transparent' },
                  accepted && styles.acceptedComment,
                ]}>
                <View style={styles.commentTop}>
                  <ThemedText type="smallBold">{comment.authorName}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {formatRelativeTime(comment.createdAt)}
                  </ThemedText>
                </View>
                <ThemedText type="small">{comment.body}</ThemedText>
                {accepted ? (
                  <View style={styles.acceptedBadge}>
                    <BadgeCheck size={14} color={theme.primary} />
                    <ThemedText type="small" style={{ color: theme.primary }}>
                      Accepted answer
                    </ThemedText>
                  </View>
                ) : null}
                {isOwner && !post.acceptedAnswerId ? (
                  <Button
                    title="Accept answer"
                    variant="secondary"
                    onPress={() => acceptAnswer(post.id, comment.id, userId)}
                    style={styles.acceptButton}
                  />
                ) : null}
              </ThemedView>
            );
          })
        )}
      </View>

      <ThemedView type="backgroundElement" style={styles.composer}>
        <ThemedText type="smallBold">Your answer</ThemedText>
        <TextInput
          value={answer}
          onChangeText={setAnswer}
          placeholder="Write a helpful reply…"
          placeholderTextColor={theme.textSecondary}
          multiline
          style={[
            styles.composerInput,
            { color: theme.text, borderColor: theme.border, backgroundColor: theme.background },
          ]}
        />
        <Button title="Post answer" onPress={onSubmitAnswer} disabled={!answer.trim()} />
      </ThemedView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.three,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    borderRadius: CardRadius,
    padding: Spacing.three,
    gap: Spacing.two,
    marginBottom: Spacing.four,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaCopy: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 26,
    lineHeight: 32,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: Spacing.three,
    marginTop: Spacing.two,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    marginTop: Spacing.two,
  },
  likeButton: {
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
  sectionTitle: {
    marginBottom: Spacing.two,
  },
  comments: {
    gap: Spacing.two,
    marginBottom: Spacing.four,
  },
  empty: {
    borderRadius: CardRadius,
    padding: Spacing.three,
  },
  comment: {
    borderRadius: CardRadius,
    padding: Spacing.three,
    gap: Spacing.two,
    borderWidth: 1.5,
  },
  acceptedComment: {
    borderWidth: 1.5,
  },
  commentTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  acceptedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  acceptButton: {
    alignSelf: 'flex-start',
    minHeight: 40,
    paddingHorizontal: Spacing.three,
  },
  composer: {
    borderRadius: CardRadius,
    padding: Spacing.three,
    gap: Spacing.two,
    marginBottom: Spacing.five,
  },
  composerInput: {
    minHeight: 96,
    borderWidth: 1,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    textAlignVertical: 'top',
    fontSize: 16,
  },
});
