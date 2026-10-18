import {
  Bell,
  CalendarDays,
  Leaf,
  PenLine,
  ShoppingBag,
  Tag,
  type LucideIcon,
} from 'lucide-react-native';

import type { AppTheme } from '@/hooks/use-theme';

export type QuickActionRoute =
  | string
  | { pathname: string; params?: Record<string, string> };

export type QuickActionColorKey =
  | 'primary'
  | 'statusHealthy'
  | 'statusAttention'
  | 'statusOverdue'
  | 'fixed';

export type QuickActionDef = {
  key: string;
  label: string;
  icon: LucideIcon;
  colorKey: QuickActionColorKey;
  fixedColor?: string;
  route: QuickActionRoute;
};

export const QUICK_ACTION_DEFS: QuickActionDef[] = [
  {
    key: 'add-plant',
    label: 'Add plant',
    icon: Leaf,
    colorKey: 'primary',
    route: '/add-plant',
  },
  {
    key: 'sell',
    label: 'Sell a plant',
    icon: Tag,
    colorKey: 'statusHealthy',
    route: '/shop/create',
  },
  {
    key: 'shop',
    label: 'Buy plants',
    icon: ShoppingBag,
    colorKey: 'statusAttention',
    route: { pathname: '/community', params: { segment: 'shop' } },
  },
  {
    key: 'post',
    label: 'Create post',
    icon: PenLine,
    colorKey: 'fixed',
    fixedColor: '#2F6F8F',
    route: '/post/create',
  },
  {
    key: 'calendar',
    label: 'Care calendar',
    icon: CalendarDays,
    colorKey: 'fixed',
    fixedColor: '#6B5B95',
    route: '/calendar',
  },
  {
    key: 'notifications',
    label: 'Notifications',
    icon: Bell,
    colorKey: 'statusOverdue',
    route: '/notifications',
  },
];

export function quickActionColor(def: QuickActionDef, theme: AppTheme): string {
  if (def.colorKey === 'fixed' && def.fixedColor) return def.fixedColor;
  return theme[def.colorKey as keyof AppTheme] as string;
}

export type ResolvedQuickAction = QuickActionDef & { color: string };

export function resolveQuickActions(theme: AppTheme): ResolvedQuickAction[] {
  return QUICK_ACTION_DEFS.map((def) => ({
    ...def,
    color: quickActionColor(def, theme),
  }));
}
