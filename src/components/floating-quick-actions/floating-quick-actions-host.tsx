import { StyleSheet, View } from 'react-native';

import { DraggableOrb } from '@/components/floating-quick-actions/draggable-orb';
import { useFloatingQuickActions } from '@/context/floating-quick-actions';

export function FloatingQuickActionsHost() {
  useFloatingQuickActions();

  return (
    <View style={styles.layer} pointerEvents="box-none">
      <DraggableOrb />
    </View>
  );
}

const styles = StyleSheet.create({
  layer: {
    ...StyleSheet.absoluteFill,
    zIndex: 100,
  },
});
