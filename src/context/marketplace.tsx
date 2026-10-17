import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  type PropsWithChildren,
} from 'react';

import {
  PLANTCARE_STORE_ID,
  PLANTCARE_STORE_NAME,
  SEED_MARKETPLACE_LISTINGS,
  SEED_MARKETPLACE_ORDERS,
  type ListingCategory,
  type MarketplaceListing,
  type MarketplaceOrder,
  type SellerType,
} from '@/constants/mock-marketplace';
import { useStorageState } from '@/hooks/use-storage-state';

export type {
  ListingCategory,
  ListingCondition,
  ListingStatus,
  MarketplaceCurrency,
  MarketplaceListing,
  MarketplaceOrder,
  SellerType,
} from '@/constants/mock-marketplace';

export type CreateListingInput = {
  title: string;
  description: string;
  price: number;
  currency?: MarketplaceListing['currency'];
  category: ListingCategory;
  condition: MarketplaceListing['condition'];
  imageUris: string[];
  sellerId: string;
  sellerName: string;
  sellerType: SellerType;
  isOfficialStore: boolean;
  plantId?: string;
  quantity?: number;
};

export type UpdateListingInput = Partial<
  Pick<
    MarketplaceListing,
    | 'title'
    | 'description'
    | 'price'
    | 'currency'
    | 'category'
    | 'condition'
    | 'imageUris'
    | 'quantity'
    | 'status'
  >
>;

export type PurchaseBuyer = {
  id: string;
  name: string;
  email: string;
};

export type PurchaseResult = { ok: true; orderId: string } | { ok: false; error: string };

type MarketplaceContextValue = {
  listings: MarketplaceListing[];
  orders: MarketplaceOrder[];
  isLoading: boolean;
  createListing: (input: CreateListingInput) => string;
  updateListing: (id: string, input: UpdateListingInput, actorId: string, isAdmin: boolean) => boolean;
  removeListing: (id: string, actorId: string, isAdmin: boolean) => boolean;
  purchaseListing: (listingId: string, buyer: PurchaseBuyer) => PurchaseResult;
  getListing: (id: string) => MarketplaceListing | undefined;
  getOrdersForBuyer: (buyerId: string) => MarketplaceOrder[];
  getListingsForSeller: (sellerId: string) => MarketplaceListing[];
};

const MarketplaceContext = createContext<MarketplaceContextValue | null>(null);

const LISTINGS_KEY = 'plantcare_marketplace_listings';
const ORDERS_KEY = 'plantcare_marketplace_orders';

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

function canManageListing(listing: MarketplaceListing, actorId: string, isAdmin: boolean) {
  if (listing.sellerType === 'store') {
    return isAdmin;
  }
  return listing.sellerId === actorId;
}

export function useMarketplace() {
  const value = useContext(MarketplaceContext);
  if (!value) {
    throw new Error('useMarketplace must be wrapped in a <MarketplaceProvider />');
  }
  return value;
}

export function MarketplaceProvider({ children }: PropsWithChildren) {
  const [[isListingsLoading, listingsRaw], setListingsRaw] = useStorageState(LISTINGS_KEY);
  const [[isOrdersLoading, ordersRaw], setOrdersRaw] = useStorageState(ORDERS_KEY);

  const isLoading = isListingsLoading || isOrdersLoading;

  useEffect(() => {
    if (isListingsLoading) return;
    if (listingsRaw == null) {
      setListingsRaw(JSON.stringify(SEED_MARKETPLACE_LISTINGS));
    }
  }, [isListingsLoading, listingsRaw, setListingsRaw]);

  useEffect(() => {
    if (isOrdersLoading) return;
    if (ordersRaw == null) {
      setOrdersRaw(JSON.stringify(SEED_MARKETPLACE_ORDERS));
    }
  }, [isOrdersLoading, ordersRaw, setOrdersRaw]);

  const listings: MarketplaceListing[] = useMemo(() => {
    const parsed = parseList<MarketplaceListing>(listingsRaw);
    if (parsed == null) return SEED_MARKETPLACE_LISTINGS;
    return parsed;
  }, [listingsRaw]);

  const orders: MarketplaceOrder[] = useMemo(() => {
    const parsed = parseList<MarketplaceOrder>(ordersRaw);
    if (parsed == null) return SEED_MARKETPLACE_ORDERS;
    return parsed;
  }, [ordersRaw]);

  const setListings = useCallback(
    (next: MarketplaceListing[]) => {
      setListingsRaw(JSON.stringify(next));
    },
    [setListingsRaw],
  );

  const setOrders = useCallback(
    (next: MarketplaceOrder[]) => {
      setOrdersRaw(JSON.stringify(next));
    },
    [setOrdersRaw],
  );

  const createListing = useCallback(
    (input: CreateListingInput) => {
      const id = `listing-${Date.now()}`;
      const quantity = input.quantity ?? 1;
      const next: MarketplaceListing = {
        id,
        title: input.title.trim(),
        description: input.description.trim(),
        price: input.price,
        currency: input.currency ?? 'BDT',
        category: input.category,
        condition: input.condition,
        imageUris: input.imageUris,
        sellerId: input.isOfficialStore ? PLANTCARE_STORE_ID : input.sellerId,
        sellerName: input.isOfficialStore ? PLANTCARE_STORE_NAME : input.sellerName,
        sellerType: input.isOfficialStore ? 'store' : input.sellerType,
        isOfficialStore: input.isOfficialStore,
        plantId: input.plantId,
        quantity,
        status: 'active',
        createdAt: nowISO(),
        updatedAt: nowISO(),
      };
      setListings([next, ...listings]);
      return id;
    },
    [listings, setListings],
  );

  const updateListing = useCallback(
    (id: string, input: UpdateListingInput, actorId: string, isAdmin: boolean) => {
      const listing = listings.find((item) => item.id === id);
      if (!listing || !canManageListing(listing, actorId, isAdmin)) return false;

      setListings(
        listings.map((item) => {
          if (item.id !== id) return item;
          return {
            ...item,
            ...input,
            title: input.title?.trim() ?? item.title,
            description: input.description?.trim() ?? item.description,
            updatedAt: nowISO(),
          };
        }),
      );
      return true;
    },
    [listings, setListings],
  );

  const removeListing = useCallback(
    (id: string, actorId: string, isAdmin: boolean) => {
      const listing = listings.find((item) => item.id === id);
      if (!listing || !canManageListing(listing, actorId, isAdmin)) return false;
      setListings(
        listings.map((item) =>
          item.id === id ? { ...item, status: 'removed', updatedAt: nowISO() } : item,
        ),
      );
      return true;
    },
    [listings, setListings],
  );

  const purchaseListing = useCallback(
    (listingId: string, buyer: PurchaseBuyer): PurchaseResult => {
      const listing = listings.find((item) => item.id === listingId);
      if (!listing) return { ok: false, error: 'Listing not found.' };
      if (listing.status !== 'active') return { ok: false, error: 'This listing is no longer available.' };
      if (listing.quantity < 1) return { ok: false, error: 'Out of stock.' };
      if (listing.sellerId === buyer.id && listing.sellerType === 'user') {
        return { ok: false, error: 'You cannot buy your own listing.' };
      }
      if (listing.isOfficialStore && buyer.id === PLANTCARE_STORE_ID) {
        return { ok: false, error: 'Store cannot purchase its own inventory.' };
      }

      const orderId = `order-${Date.now()}`;
      const order: MarketplaceOrder = {
        id: orderId,
        listingId: listing.id,
        title: listing.title,
        price: listing.price,
        currency: listing.currency,
        imageUri: listing.imageUris[0],
        sellerName: listing.sellerName,
        buyerId: buyer.id,
        buyerName: buyer.name,
        buyerEmail: buyer.email,
        status: 'placed',
        placedAt: nowISO(),
      };

      const nextQuantity = listing.quantity - 1;
      setListings(
        listings.map((item) => {
          if (item.id !== listingId) return item;
          return {
            ...item,
            quantity: nextQuantity,
            status: nextQuantity <= 0 ? 'sold' : item.status,
            updatedAt: nowISO(),
          };
        }),
      );
      setOrders([order, ...orders]);
      return { ok: true, orderId };
    },
    [listings, orders, setListings, setOrders],
  );

  const getListing = useCallback((id: string) => listings.find((item) => item.id === id), [listings]);

  const getOrdersForBuyer = useCallback(
    (buyerId: string) =>
      orders
        .filter((order) => order.buyerId === buyerId)
        .sort((a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime()),
    [orders],
  );

  const getListingsForSeller = useCallback(
    (sellerId: string) =>
      listings
        .filter(
          (listing) =>
            listing.status !== 'removed' &&
            (listing.sellerId === sellerId ||
              (sellerId === PLANTCARE_STORE_ID && listing.isOfficialStore)),
        )
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [listings],
  );

  return (
    <MarketplaceContext.Provider
      value={{
        listings,
        orders,
        isLoading,
        createListing,
        updateListing,
        removeListing,
        purchaseListing,
        getListing,
        getOrdersForBuyer,
        getListingsForSeller,
      }}>
      {children}
    </MarketplaceContext.Provider>
  );
}
