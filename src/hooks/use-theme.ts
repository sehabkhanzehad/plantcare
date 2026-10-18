import { Platform, StyleSheet, useColorScheme, type ViewStyle } from 'react-native';

import { Colors, type ThemeColor } from '@/constants/theme';
import { useAppearanceOptional } from '@/context/appearance';

export function useResolvedColorScheme(): 'light' | 'dark' {
  const appearance = useAppearanceOptional();
  const system = useColorScheme();
  return appearance?.colorScheme ?? (system === 'dark' ? 'dark' : 'light');
}

function cardShadow(isDark: boolean): ViewStyle {
  if (!isDark) return {};
  return (
    Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.55,
        shadowRadius: 24,
      },
      android: { elevation: 8 },
      default: {},
    }) ?? {}
  );
}

function buildCardChrome(
  palette: (typeof Colors)['light'] | (typeof Colors)['dark'],
  isDark: boolean,
  elevated: boolean,
): ViewStyle {
  return {
    backgroundColor: elevated ? palette.surfaceElevated : palette.surface,
    borderColor: isDark ? 'rgba(255, 255, 255, 0.11)' : palette.border,
    borderWidth: isDark ? StyleSheet.hairlineWidth : StyleSheet.hairlineWidth,
    ...cardShadow(isDark),
  };
}

export type ThemePalette = (typeof Colors)['light'] | (typeof Colors)['dark'];

export type AppTheme = ThemePalette & {
  scheme: 'light' | 'dark';
  card: ViewStyle;
  cardElevated: ViewStyle;
};

export function useTheme(): AppTheme {
  const scheme = useResolvedColorScheme();
  const palette = Colors[scheme];
  const isDark = scheme === 'dark';

  return {
    ...palette,
    scheme,
    card: buildCardChrome(palette, isDark, false),
    cardElevated: buildCardChrome(palette, isDark, true),
  };
}

export type { ThemeColor };
