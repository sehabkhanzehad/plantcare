import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  type PropsWithChildren,
} from 'react';

import {
  SEED_COMMUNITY_COMMENTS,
  SEED_COMMUNITY_POSTS,
  type CommunityComment,
  type CommunityPost,
  type PostCategory,
} from '@/constants/mock-community';
import { useStorageState } from '@/hooks/use-storage-state';

export type { CommunityComment, CommunityPost, PostCategory };

type CreatePostInput = {
  authorId: string;
  authorName: string;
  title: string;
  body: string;
  category: PostCategory;
  imageUri?: string;
};

type AddCommentInput = {
  postId: string;
  authorId: string;
  authorName: string;
  body: string;
};

type CommunityContextValue = {
  posts: CommunityPost[];
  comments: CommunityComment[];
  isLoading: boolean;
  createPost: (input: CreatePostInput) => string;
  addComment: (input: AddCommentInput) => void;
  toggleLike: (postId: string, userId: string) => void;
  acceptAnswer: (postId: string, commentId: string, authorId: string) => void;
  reportPost: (postId: string) => void;
  getCommentsForPost: (postId: string) => CommunityComment[];
};

const CommunityContext = createContext<CommunityContextValue | null>(null);

const POSTS_KEY = 'plantcare_community_posts';
const COMMENTS_KEY = 'plantcare_community_comments';

function nowISO() {
  return new Date().toISOString();
}

function parseList<T>(raw: string | null): T[] | null {
  if (raw == null) return null;
  try {
    return JSON.parse(raw) as T[];
  } catch {
    return [];
  }
}

export function useCommunity() {
  const value = useContext(CommunityContext);
  if (!value) {
    throw new Error('useCommunity must be wrapped in a <CommunityProvider />');
  }
  return value;
}

export function CommunityProvider({ children }: PropsWithChildren) {
  const [[isPostsLoading, postsRaw], setPostsRaw] = useStorageState(POSTS_KEY);
  const [[isCommentsLoading, commentsRaw], setCommentsRaw] = useStorageState(COMMENTS_KEY);

  const isLoading = isPostsLoading || isCommentsLoading;

  useEffect(() => {
    if (isPostsLoading) return;
    if (postsRaw == null) {
      setPostsRaw(JSON.stringify(SEED_COMMUNITY_POSTS));
    }
  }, [isPostsLoading, postsRaw, setPostsRaw]);

  useEffect(() => {
    if (isCommentsLoading) return;
    if (commentsRaw == null) {
      setCommentsRaw(JSON.stringify(SEED_COMMUNITY_COMMENTS));
    }
  }, [isCommentsLoading, commentsRaw, setCommentsRaw]);

  const posts: CommunityPost[] = useMemo(() => {
    const parsed = parseList<CommunityPost>(postsRaw);
    if (parsed == null) return SEED_COMMUNITY_POSTS;
    return parsed;
  }, [postsRaw]);

  const comments: CommunityComment[] = useMemo(() => {
    const parsed = parseList<CommunityComment>(commentsRaw);
    if (parsed == null) return SEED_COMMUNITY_COMMENTS;
    return parsed;
  }, [commentsRaw]);

  const setPosts = useCallback(
    (next: CommunityPost[]) => {
      setPostsRaw(JSON.stringify(next));
    },
    [setPostsRaw],
  );

  const setComments = useCallback(
    (next: CommunityComment[]) => {
      setCommentsRaw(JSON.stringify(next));
    },
    [setCommentsRaw],
  );

  const createPost = useCallback(
    (input: CreatePostInput) => {
      const id = `post-${Date.now()}`;
      const next: CommunityPost = {
        id,
        authorId: input.authorId,
        authorName: input.authorName,
        title: input.title.trim(),
        body: input.body.trim(),
        category: input.category,
        imageUri: input.imageUri,
        likes: [],
        createdAt: nowISO(),
      };
      setPosts([next, ...posts]);
      return id;
    },
    [posts, setPosts],
  );

  const addComment = useCallback(
    (input: AddCommentInput) => {
      const next: CommunityComment = {
        id: `comment-${Date.now()}`,
        postId: input.postId,
        authorId: input.authorId,
        authorName: input.authorName,
        body: input.body.trim(),
        createdAt: nowISO(),
      };
      setComments([...comments, next]);
    },
    [comments, setComments],
  );

  const toggleLike = useCallback(
    (postId: string, userId: string) => {
      setPosts(
        posts.map((post) => {
          if (post.id !== postId) return post;
          const liked = post.likes.includes(userId);
          return {
            ...post,
            likes: liked ? post.likes.filter((id) => id !== userId) : [...post.likes, userId],
          };
        }),
      );
    },
    [posts, setPosts],
  );

  const acceptAnswer = useCallback(
    (postId: string, commentId: string, authorId: string) => {
      setPosts(
        posts.map((post) => {
          if (post.id !== postId || post.authorId !== authorId) return post;
          return { ...post, acceptedAnswerId: commentId };
        }),
      );
    },
    [posts, setPosts],
  );

  const reportPost = useCallback(
    (postId: string) => {
      setPosts(posts.map((post) => (post.id === postId ? { ...post, reported: true } : post)));
    },
    [posts, setPosts],
  );

  const getCommentsForPost = useCallback(
    (postId: string) =>
      comments
        .filter((comment) => comment.postId === postId)
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    [comments],
  );

  return (
    <CommunityContext.Provider
      value={{
        posts,
        comments,
        isLoading,
        createPost,
        addComment,
        toggleLike,
        acceptAnswer,
        reportPost,
        getCommentsForPost,
      }}>
      {children}
    </CommunityContext.Provider>
  );
}
