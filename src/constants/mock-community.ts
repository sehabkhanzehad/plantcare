export type PostCategory = 'Problem' | 'Tip' | 'Question';

export type CommunityPost = {
  id: string;
  authorId: string;
  authorName: string;
  title: string;
  body: string;
  category: PostCategory;
  imageUri?: string;
  likes: string[];
  acceptedAnswerId?: string;
  createdAt: string;
  reported?: boolean;
};

export type CommunityComment = {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  body: string;
  createdAt: string;
};

export const POST_CATEGORIES: PostCategory[] = ['Problem', 'Tip', 'Question'];

export const SEED_COMMUNITY_POSTS: CommunityPost[] = [
  {
    id: 'post-1',
    authorId: 'maya@plantcare.app',
    authorName: 'Maya',
    title: 'Yellow leaves on my Peace Lily',
    body: 'The tips turned yellow last week. I water every 4 days. Is this overwatering or low light?',
    category: 'Problem',
    likes: ['sam@plantcare.app'],
    acceptedAnswerId: 'comment-1',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
  },
  {
    id: 'post-2',
    authorId: 'sam@plantcare.app',
    authorName: 'Sam',
    title: 'Best soil mix for Monsteras?',
    body: 'Looking for a chunky mix that drains well. What ratios do you use for bark, perlite, and potting soil?',
    category: 'Question',
    likes: ['maya@plantcare.app', 'lee@plantcare.app'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
  },
  {
    id: 'post-3',
    authorId: 'lee@plantcare.app',
    authorName: 'Lee',
    title: 'Tip: water in the morning',
    body: 'I switched to morning watering and my ferns stopped getting crispy edges. Less overnight dampness on leaves.',
    category: 'Tip',
    likes: [],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
  },
];

export const SEED_COMMUNITY_COMMENTS: CommunityComment[] = [
  {
    id: 'comment-1',
    postId: 'post-1',
    authorId: 'sam@plantcare.app',
    authorName: 'Sam',
    body: 'Usually overwatering. Let the top inch dry, and check if the pot has drainage holes.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
  },
  {
    id: 'comment-2',
    postId: 'post-1',
    authorId: 'lee@plantcare.app',
    authorName: 'Lee',
    body: 'Also move it closer to a bright window — Peace Lilies droop when thirsty but yellow tips often mean wet soil.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
  },
  {
    id: 'comment-3',
    postId: 'post-2',
    authorId: 'maya@plantcare.app',
    authorName: 'Maya',
    body: 'I use 40% potting mix, 30% orchid bark, 20% perlite, 10% charcoal. Repot yearly.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
];

export function formatRelativeTime(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}
