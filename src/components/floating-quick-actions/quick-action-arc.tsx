import { Pressable, StyleSheet, View, type ViewStyle } from 'react-native';
import { router } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { resolveQuickActions } from '@/constants/quick-actions';
import { CardRadius } from '@/constants/theme';
import {
  HANDLE_EXPAND_INSET,
  HANDLE_HEIGHT,
  HANDLE_PEEK,
  HANDLE_WIDTH,
  isDockedRight,
  type OrbPosition,
} from '@/context/floating-quick-actions';
import { useTheme } from '@/hooks/use-theme';

const ARC_RADIUS = 72;
const ACTION_SIZE = 42;
const ICON_SIZE = 17;

type QuickActionArcProps = {
  anchor: OrbPosition;
  onClose: () => void;
};

function arcOffset(index: number, total: number, dockRight: boolean) {
  const start = dockRight ? Math.PI / 2 : -Math.PI / 2;
  const end = dockRight ? (3 * Math.PI) / 2 : Math.PI / 2;
  const t = total <= 1 ? 0.5 : index / (total - 1);
  const angle = start + (end - start) * t;
  const x = ARC_RADIUS * Math.cos(angle);
  const y = -ARC_RADIUS * Math.sin(angle);
  return dockRight ? { x, y } : { x: -x, y };
}

export function QuickActionArc({ anchor, onClose }: QuickActionArcProps) {
  const theme = useTheme();
  const actions = resolveQuickActions(theme);
  const dockRight = isDockedRight(anchor.x);
  const pivotX = dockRight ? anchor.x - HANDLE_WIDTH / 2 : anchor.x + HANDLE_WIDTH / 2;

  function go(route: (typeof actions)[number]['route']) {
    onClose();
    router.push(route as never);
  }

  return (
    <View style={styles.arcLayer} pointerEvents="box-none">
      {actions.map((action, index) => {
        const { x, y } = arcOffset(index, actions.length, dockRight);
        const Icon = action.icon;
        return (
          <Pressable
            key={action.key}
            onPress={() => go(action.route)}
            accessibilityRole="button"
            accessibilityLabel={action.label}
            style={[
              styles.action,
              theme.card,
              {
                left: pivotX + x - ACTION_SIZE / 2,
                top: anchor.y + y - ACTION_SIZE / 2,
              },
            ]}>
            <View style={[styles.iconBadge, { backgroundColor: action.color }]}>
              <Icon size={ICON_SIZE} color="#FFFFFF" strokeWidth={2} />
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

export function QuickHandleTab({
  open,
  dockRight,
}: {
  open: boolean;
  dockRight: boolean;
}) {
  const theme = useTheme();
  const tuckedOutside = HANDLE_WIDTH - HANDLE_PEEK;
  const edgeInset = open ? HANDLE_EXPAND_INSET : -tuckedOutside;
  const innerRadius = CardRadius + 2;
  const outerRadius = 0;
  const chrome: ViewStyle = open
    ? theme.card
    : {
        backgroundColor: theme.surface,
        borderColor: theme.border,
        borderWidth: StyleSheet.hairlineWidth,
      };

  return (
    <View
      accessibilityRole="button"
      accessibilityLabel={open ? 'Close actions' : 'Open actions'}
      accessibilityState={{ expanded: open }}
      style={[
        styles.tab,
        chrome,
        open ? styles.tabShadow : styles.tabFlat,
        dockRight ? { right: edgeInset } : { left: edgeInset },
        {
          width: HANDLE_WIDTH,
          borderTopLeftRadius: dockRight ? innerRadius : outerRadius,
          borderBottomLeftRadius: dockRight ? innerRadius : outerRadius,
          borderTopRightRadius: dockRight ? outerRadius : innerRadius,
          borderBottomRightRadius: dockRight ? outerRadius : innerRadius,
        },
      ]}>
      <ThemedText
        style={[styles.tabText, { color: theme.text }]}
        numberOfLines={1}>
        {open ? 'Action' : ' '}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  arcLayer: {
    ...StyleSheet.absoluteFill,
    zIndex: 2,
  },
  action: {
    position: 'absolute',
    width: ACTION_SIZE,
    height: ACTION_SIZE,
    borderRadius: ACTION_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  iconBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tab: {
    position: 'absolute',
    top: 0,
    height: HANDLE_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  tabShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 8,
    elevation: 6,
  },
  tabFlat: {
    shadowOpacity: 0,
    elevation: 0,
  },
  tabText: {
    width: '100%',
    fontFamily: 'Manrope_700Bold',
    fontSize: 11,
    textAlign: 'center',
  },
});
