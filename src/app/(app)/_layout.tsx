import { Stack } from 'expo-router';

export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
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
  );
}
