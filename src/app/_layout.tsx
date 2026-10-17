import { useEffect } from 'react';
import { DefaultTheme, ThemeProvider as NavigationThemeProvider, Stack, router } from 'expo-router';
import { StatusBar, useColorScheme } from 'react-native';

import { CareNotificationSync } from '@/components/care-notification-sync';
import { SplashScreenController } from '@/components/splash-screen-controller';
import { AppearanceProvider, useAppearanceOptional } from '@/context/appearance';
import { SessionProvider, useSession } from '@/context/auth';
import { CarePreferencesProvider } from '@/context/care-preferences';
import { CommunityProvider } from '@/context/community';
import { MarketplaceProvider } from '@/context/marketplace';
import { PlantsProvider } from '@/context/plants';
import { NotificationsProvider } from '@/context/notifications';
import { Colors } from '@/constants/theme';
import { addNotificationResponseListener } from '@/lib/care-notifications';

export default function RootLayout() {
  return (
    <AppearanceProvider>
      <SessionProvider>
        <PlantsProvider>
          <CarePreferencesProvider>
            <CommunityProvider>
              <MarketplaceProvider>
                <NotificationsProvider>
                  <AppShell />
                </NotificationsProvider>
              </MarketplaceProvider>
            </CommunityProvider>
          </CarePreferencesProvider>
        </PlantsProvider>
      </SessionProvider>
    </AppearanceProvider>
  );
}

function AppShell() {
  const appearance = useAppearanceOptional();
  const systemScheme = useColorScheme();
  const colorScheme =
    appearance?.colorScheme ?? (systemScheme === 'dark' ? 'dark' : 'light');

  const navigationTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: Colors[colorScheme].primary,
      background: Colors[colorScheme].background,
      card: Colors[colorScheme].background,
      text: Colors[colorScheme].text,
      border: Colors[colorScheme].border,
    },
  };

  useEffect(() => {
    let removeListener: (() => void) | undefined;
    addNotificationResponseListener((plantId) => {
      router.push({ pathname: '/plant/[id]', params: { id: plantId } });
    }).then((remove) => {
      removeListener = remove;
    });
    return () => removeListener?.();
  }, []);

  return (
    <>
      <SplashScreenController />
      <CareNotificationSync />
      <StatusBar
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={Colors[colorScheme].background}
        translucent={false}
      />
      <NavigationThemeProvider value={navigationTheme}>
        <RootNavigator />
      </NavigationThemeProvider>
    </>
  );
}

function RootNavigator() {
  const { session, hasOnboarded, isLoading } = useSession();

  if (isLoading) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!session && !hasOnboarded}>
        <Stack.Screen name="(onboarding)" />
      </Stack.Protected>

      <Stack.Protected guard={!session && hasOnboarded}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>

      <Stack.Protected guard={!!session}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
    </Stack>
  );
}
