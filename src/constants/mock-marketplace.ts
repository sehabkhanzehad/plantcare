export type MarketplaceCurrency = 'BDT' | 'USD';

export type ListingCategory = 'Indoor' | 'Outdoor' | 'Seeds' | 'Pots' | 'Tools';

export type ListingCondition = 'Healthy' | 'Needs care' | 'New';

export type ListingStatus = 'active' | 'sold' | 'removed';

export type SellerType = 'user' | 'store';

export type MarketplaceListing = {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: MarketplaceCurrency;
  category: ListingCategory;
  condition: ListingCondition;
  imageUris: string[];
  sellerId: string;
  sellerName: string;
  sellerType: SellerType;
  isOfficialStore: boolean;
  plantId?: string;
  quantity: number;
  status: ListingStatus;
  createdAt: string;
  updatedAt: string;
};

export type OrderStatus = 'placed' | 'cancelled';

export type MarketplaceOrder = {
  id: string;
  listingId: string;
  title: string;
  price: number;
  currency: MarketplaceCurrency;
  imageUri?: string;
  sellerName: string;
  buyerId: string;
  buyerName: string;
  buyerEmail: string;
  status: OrderStatus;
  placedAt: string;
};

export const LISTING_CATEGORIES: ListingCategory[] = [
  'Indoor',
  'Outdoor',
  'Seeds',
  'Pots',
  'Tools',
];

export const LISTING_CONDITIONS: ListingCondition[] = ['Healthy', 'Needs care', 'New'];

export const PLANTCARE_STORE_ID = 'plantcare-store';
export const PLANTCARE_STORE_NAME = 'PlantCare Store';
export const ADMIN_DEMO_EMAIL = 'admin@plantcare.app';

const unsplash = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=480&q=80`;

export const SEED_MARKETPLACE_LISTINGS: MarketplaceListing[] = [
  {
    id: 'listing-store-1',
    title: 'Monstera deliciosa (medium)',
    description:
      'Nursery-grown Monstera with fenestrated leaves. Includes care card and 6-inch ceramic pot.',
    price: 1850,
    currency: 'BDT',
    category: 'Indoor',
    condition: 'New',
    imageUris: [unsplash('photo-1614594975525-e45190c55d0b')],
    sellerId: PLANTCARE_STORE_ID,
    sellerName: PLANTCARE_STORE_NAME,
    sellerType: 'store',
    isOfficialStore: true,
    quantity: 8,
    status: 'active',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
  },
  {
    id: 'listing-store-2',
    title: 'Organic potting mix (5 kg)',
    description: 'Chunky indoor blend with bark and perlite. Sealed bag, ready to use.',
    price: 650,
    currency: 'BDT',
    category: 'Tools',
    condition: 'New',
    imageUris: [unsplash('photo-1416879595882-3373a0480b5b')],
    sellerId: PLANTCARE_STORE_ID,
    sellerName: PLANTCARE_STORE_NAME,
    sellerType: 'store',
    isOfficialStore: true,
    quantity: 25,
    status: 'active',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
  {
    id: 'listing-store-3',
    title: 'Terracotta planter set (3)',
    description: 'Drainage holes included. Sizes: 4", 5", and 6".',
    price: 1200,
    currency: 'BDT',
    category: 'Pots',
    condition: 'New',
    imageUris: [unsplash('photo-1485955900006-10f4d24d2a0a')],
    sellerId: PLANTCARE_STORE_ID,
    sellerName: PLANTCARE_STORE_NAME,
    sellerType: 'store',
    isOfficialStore: true,
    quantity: 12,
    status: 'active',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
  },
  {
    id: 'listing-user-1',
    title: 'Snake plant cutting',
    description: 'Rooted Sansevieria pup. Easy beginner plant, pickup or meet-up in Dhaka.',
    price: 350,
    currency: 'BDT',
    category: 'Indoor',
    condition: 'Healthy',
    imageUris: [unsplash('photo-1593482892290-f54927ae2c78')],
    sellerId: 'maya@plantcare.app',
    sellerName: 'Maya',
    sellerType: 'user',
    isOfficialStore: false,
    quantity: 1,
    status: 'active',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
  },
  {
    id: 'listing-user-2',
    title: 'Golden pothos (hanging)',
    description: 'Full trailing plant, repotted two weeks ago. Moving sale.',
    price: 500,
    currency: 'BDT',
    category: 'Indoor',
    condition: 'Healthy',
    imageUris: [unsplash('photo-1585320806297-9794b3e4eeae')],
    sellerId: 'sam@plantcare.app',
    sellerName: 'Sam',
    sellerType: 'user',
    isOfficialStore: false,
    quantity: 1,
    status: 'active',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(),
  },
  {
    id: 'listing-user-3',
    title: 'Basil & mint seed packets',
    description: 'Unopened heirloom seeds. Bundle of two packets.',
    price: 120,
    currency: 'BDT',
    category: 'Seeds',
    condition: 'New',
    imageUris: [unsplash('photo-1464226184884-fa280b87c399')],
    sellerId: 'lee@plantcare.app',
    sellerName: 'Lee',
    sellerType: 'user',
    isOfficialStore: false,
    quantity: 3,
    status: 'active',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
  },
];

export const SEED_MARKETPLACE_ORDERS: MarketplaceOrder[] = [];

export function formatPrice(price: number, currency: MarketplaceCurrency) {
  if (currency === 'BDT') {
    return `৳${price.toLocaleString()}`;
  }
  return `$${price.toLocaleString()}`;
}

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
