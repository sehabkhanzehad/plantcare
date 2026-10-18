/* eslint-disable react-hooks/immutability -- Reanimated shared values are updated in gesture worklets */
import { useCallback, useEffect, useMemo } from 'react';
import { Dimensions, Pressable, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { QuickActionArc, QuickHandleTab } from '@/components/floating-quick-actions/quick-action-arc';
import {
  computeHandleBounds,
  HANDLE_HEIGHT,
  HANDLE_PEEK,
  HANDLE_WIDTH,
  isDockedRight,
  snapHandleX,
  useFloatingQuickActions,
  type OrbPosition,
} from '@/context/floating-quick-actions';

export function DraggableOrb() {
  const insets = useSafeAreaInsets();
  const { menuOpen, toggleMenu, setMenuOpen, position, persistPosition } = useFloatingQuickActions();

  const windowW = useSharedValue(Dimensions.get('window').width);
  const minY = useSharedValue(0);
  const maxY = useSharedValue(Dimensions.get('window').height);
  const minX = useSharedValue(0);
  const maxX = useSharedValue(Dimensions.get('window').width);
  const translateY = useSharedValue(position.y - HANDLE_HEIGHT / 2);
  const anchorX = useSharedValue(position.x);
  const anchorY = useSharedValue(position.y);
  const dragStartY = useSharedValue(0);
  const dragStartX = useSharedValue(0);

  const syncBounds = useCallback(() => {
    const { width } = Dimensions.get('window');
    const bounds = computeHandleBounds({ top: insets.top, bottom: insets.bottom });
    windowW.value = width;
    minY.value = bounds.minY;
    maxY.value = bounds.maxY;
    minX.value = bounds.minX;
    maxX.value = bounds.maxX;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- shared values are stable handles
  }, [insets.bottom, insets.top]);

  useEffect(() => {
    syncBounds();
    const sub = Dimensions.addEventListener('change', () => syncBounds());
    return () => sub.remove();
  }, [syncBounds]);

  useEffect(() => {
    translateY.value = position.y - HANDLE_HEIGHT / 2;
    anchorX.value = position.x;
    anchorY.value = position.y;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync persisted position into shared values
  }, [position.x, position.y]);

  const closeMenuIfOpen = useCallback(() => {
    setMenuOpen((open) => (open ? false : open));
  }, [setMenuOpen]);

  const finishDrag = useCallback(
    (snapped: OrbPosition) => {
      persistPosition(snapped);
    },
    [persistPosition],
  );

  const handleTap = useCallback(() => {
    toggleMenu();
  }, [toggleMenu]);

  const pan = useMemo(
    () =>
      Gesture.Pan()
        .minDistance(6)
        .onBegin(() => {
          dragStartY.value = anchorY.value;
          dragStartX.value = anchorX.value;
        })
        .onStart(() => {
          runOnJS(closeMenuIfOpen)();
        })
        .onUpdate((e) => {
          const nextY = Math.min(maxY.value, Math.max(minY.value, dragStartY.value + e.translationY));
          translateY.value = nextY - HANDLE_HEIGHT / 2;
        })
        .onEnd((e) => {
          const centerY = Math.min(
            maxY.value,
            Math.max(minY.value, dragStartY.value + e.translationY),
          );
          const centerX = Math.min(
            maxX.value,
            Math.max(minX.value, dragStartX.value + e.translationX),
          );
          const snappedX = snapHandleX(centerX, windowW.value);
          const snapped = { x: snappedX, y: centerY };
          anchorX.value = snappedX;
          anchorY.value = centerY;
          translateY.value = snapped.y - HANDLE_HEIGHT / 2;
          runOnJS(finishDrag)(snapped);
        }),
    [
      anchorX,
      anchorY,
      closeMenuIfOpen,
      dragStartX,
      dragStartY,
      finishDrag,
      maxX,
      maxY,
      minX,
      minY,
      translateY,
      windowW,
    ],
  );

  const tap = useMemo(
    () =>
      Gesture.Tap().onEnd(() => {
        runOnJS(handleTap)();
      }),
    [handleTap],
  );

  const gesture = useMemo(() => Gesture.Exclusive(pan, tap), [pan, tap]);

  const dockRight = isDockedRight(position.x);
  const anchor: OrbPosition = { x: position.x, y: position.y };

  const handleStyle = useAnimatedStyle(() => ({
    top: translateY.value,
  }));

  const touchWidth = menuOpen ? HANDLE_WIDTH + 10 : HANDLE_PEEK + 14;

  return (
    <>
      {menuOpen ? (
        <Pressable
          style={styles.backdrop}
          onPress={() => setMenuOpen(false)}
          accessibilityLabel="Close quick actions"
        />
      ) : null}
      {menuOpen ? <QuickActionArc anchor={anchor} onClose={() => setMenuOpen(false)} /> : null}
      <Animated.View style={[styles.handleTrack, handleStyle]} pointerEvents="box-none">
        <GestureDetector gesture={gesture}>
          <Animated.View
            style={[
              styles.touchStrip,
              dockRight ? { right: 0, width: touchWidth } : { left: 0, width: touchWidth },
            ]}>
            <QuickHandleTab open={menuOpen} dockRight={dockRight} />
          </Animated.View>
        </GestureDetector>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15, 22, 17, 0.34)',
    zIndex: 1,
  },
  handleTrack: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: HANDLE_HEIGHT,
    zIndex: 3,
    overflow: 'hidden',
  },
  touchStrip: {
    position: 'absolute',
    top: 0,
    height: HANDLE_HEIGHT,
    overflow: 'visible',
  },
});
