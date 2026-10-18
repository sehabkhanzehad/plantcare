import { Stack } from 'expo-router';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { FloatingQuickActionsHost } from '@/components/floating-quick-actions/floating-quick-actions-host';
import { AppearanceProvider } from '@/context/appearance';
import { FloatingQuickActionsProvider } from '@/context/floating-quick-actions';

export default function AppLayout() {
  return (
    <AppearanceProvider>
      <GestureHandlerRootView style={styles.root}>
        <FloatingQuickActionsProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="add-plant" />
            <Stack.Screen name="plant/[id]" />
            <Stack.Screen name="post/create" />
            <Stack.Screen name="post/[id]" />
            <Stack.Screen name="calendar" />
            <Stack.Screen name="notifications" />
            <Stack.Screen name="shop/[id]" />
            <Stack.Screen name="shop/create" />
            <Stack.Screen name="shop/edit/[id]" />
            <Stack.Screen name="shop/orders" />
            <Stack.Screen name="shop/my-listings" />
          </Stack>
          <FloatingQuickActionsHost />
        </FloatingQuickActionsProvider>
      </GestureHandlerRootView>
    </AppearanceProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
