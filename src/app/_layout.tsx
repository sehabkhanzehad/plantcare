import { DefaultTheme, ThemeProvider, Stack } from 'expo-router';
import { StatusBar } from 'react-native';

import { SplashScreenController } from '@/components/splash-screen-controller';
import { SessionProvider, useSession } from '@/context/auth';
import { CommunityProvider } from '@/context/community';
import { MarketplaceProvider } from '@/context/marketplace';
import { PlantsProvider } from '@/context/plants';
import { NotificationsProvider } from '@/context/notifications';
import { Colors } from '@/constants/theme';

export default function RootLayout() {
  const scheme = 'light';

  const navigationTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: Colors[scheme].primary,
      background: Colors[scheme].background,
      card: Colors[scheme].background,
      text: Colors[scheme].text,
      border: Colors[scheme].border,
    },
  };

  return (
    <SessionProvider>
      <PlantsProvider>
        <CommunityProvider>
          <MarketplaceProvider>
          <NotificationsProvider>
            <SplashScreenController />
            <StatusBar
              barStyle="dark-content"
              backgroundColor={Colors.light.background}
              translucent={false}
            />
            <ThemeProvider value={navigationTheme}>
              <RootNavigator />
            </ThemeProvider>
          </NotificationsProvider>
          </MarketplaceProvider>
        </CommunityProvider>
      </PlantsProvider>
    </SessionProvider>
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
