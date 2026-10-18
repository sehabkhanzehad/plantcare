import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TAB_BAR_BOTTOM_INSET, TAB_BAR_HEIGHT } from '@/constants/tab-bar';
import { useStorageState } from '@/hooks/use-storage-state';

const STORAGE_KEY = 'floating_quick_actions_pos';
export const HANDLE_HEIGHT = 32;
/** Fixed width so expanded “Action” label stays evenly padded. */
export const HANDLE_WIDTH = 76;
/** How much of the handle stays visible on screen when collapsed. */
export const HANDLE_PEEK = 22;
/** Expanded handle sits flush on the screen edge (no inset). */
export const HANDLE_EXPAND_INSET = 0;
const EDGE_MARGIN = 8;

export type OrbPosition = { x: number; y: number };

export type SafeInsets = { top: number; bottom: number };

export function computeHandleBounds(insets: SafeInsets) {
  const { width, height } = Dimensions.get('window');
  const tabClearance = TAB_BAR_HEIGHT + TAB_BAR_BOTTOM_INSET + insets.bottom;
  const minY = insets.top + EDGE_MARGIN + HANDLE_HEIGHT / 2;
  const maxY = height - tabClearance - EDGE_MARGIN - HANDLE_HEIGHT / 2;
  const minX = EDGE_MARGIN + HANDLE_PEEK / 2;
  const maxX = width - EDGE_MARGIN - HANDLE_PEEK / 2;
  return { minY, maxY, minX, maxX, width };
}

export function snapHandleX(x: number, width: number) {
  return x < width / 2 ? HANDLE_PEEK / 2 : width - HANDLE_PEEK / 2;
}

function defaultPosition(insets: SafeInsets): OrbPosition {
  const { width } = Dimensions.get('window');
  const { minY, maxY } = computeHandleBounds(insets);
  return clampOrbPosition(
    {
      x: width - HANDLE_PEEK / 2,
      y: (minY + maxY) / 2,
    },
    insets,
  );
}

function parsePosition(raw: string | null): OrbPosition | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as OrbPosition;
    if (typeof parsed.x === 'number' && typeof parsed.y === 'number') return parsed;
  } catch {
    return null;
  }
  return null;
}

export function clampOrbPosition(pos: OrbPosition, insets: SafeInsets): OrbPosition {
  const { minY, maxY, minX, maxX } = computeHandleBounds(insets);
  return {
    x: Math.min(maxX, Math.max(minX, pos.x)),
    y: Math.min(maxY, Math.max(minY, pos.y)),
  };
}

export function isDockedRight(x: number) {
  return x >= Dimensions.get('window').width / 2;
}

type FloatingQuickActionsContextValue = {
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
  toggleMenu: () => void;
  position: OrbPosition;
  setPosition: (pos: OrbPosition) => void;
  persistPosition: (pos: OrbPosition) => void;
};

const FloatingQuickActionsContext = createContext<FloatingQuickActionsContextValue | null>(null);

export function FloatingQuickActionsProvider({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  const [[loading, stored], setStored] = useStorageState(STORAGE_KEY);
  const [menuOpen, setMenuOpen] = useState(false);
  const safeInsets = useMemo(
    () => ({ top: insets.top, bottom: insets.bottom }),
    [insets.bottom, insets.top],
  );
  const [rawPosition, setRawPosition] = useState<OrbPosition>(() => defaultPosition(safeInsets));
  const position = useMemo(
    () => clampOrbPosition(rawPosition, safeInsets),
    [rawPosition, safeInsets],
  );
  const hydrated = useRef(false);

  useEffect(() => {
    if (loading || hydrated.current) return;
    hydrated.current = true;
    const parsed = parsePosition(stored);
    if (parsed) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate persisted handle position once
      setRawPosition(clampOrbPosition(parsed, safeInsets));
    }
  }, [loading, safeInsets, stored]);

  const setPosition = useCallback((pos: OrbPosition) => {
    setRawPosition(pos);
  }, []);

  const persistPosition = useCallback(
    (pos: OrbPosition) => {
      const clamped = clampOrbPosition(pos, safeInsets);
      setRawPosition(clamped);
      setStored(JSON.stringify(clamped));
    },
    [safeInsets, setStored],
  );

  const toggleMenu = useCallback(() => setMenuOpen((v) => !v), []);

  const value = useMemo(
    () => ({
      menuOpen,
      setMenuOpen,
      toggleMenu,
      position,
      setPosition,
      persistPosition,
    }),
    [menuOpen, persistPosition, position, setPosition, toggleMenu],
  );

  return (
    <FloatingQuickActionsContext.Provider value={value}>{children}</FloatingQuickActionsContext.Provider>
  );
}

export function useFloatingQuickActions() {
  const ctx = useContext(FloatingQuickActionsContext);
  if (!ctx) {
    throw new Error('useFloatingQuickActions must be used within FloatingQuickActionsProvider');
  }
  return ctx;
}

/** Kept for imports that referenced orb size. */
export const ORB_SIZE = HANDLE_HEIGHT;
