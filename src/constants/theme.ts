/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#14261A',
    background: '#F3F5F1',
    backgroundElement: 'transparent',
    backgroundSelected: 'transparent',
    textSecondary: '#66706A',
    primary: '#2F6F3E',
    primaryMuted: '#D9E0DB',
    onPrimary: '#FFFFFF',
    statusHealthy: '#2F6F3E',
    statusAttention: '#C47E0A',
    statusOverdue: '#B42318',
    border: '#E1E5E2',
    danger: '#B42318',
    surface: '#FFFFFF',
    surfaceElevated: '#FFFFFF',
    accent: '#CFF27E',
    heroBackground: '#0F2A1D',
    heroMuted: '#B9C7BD',
  },
  dark: {
    text: '#EEF1EE',
    background: '#020302',
    backgroundElement: '#141916',
    backgroundSelected: '#1D2320',
    textSecondary: '#7B857D',
    primary: '#74C685',
    primaryMuted: '#152018',
    onPrimary: '#031006',
    statusHealthy: '#74C685',
    statusAttention: '#D9A855',
    statusOverdue: '#EB7A72',
    border: '#2A322C',
    danger: '#EB7A72',
    surface: '#121613',
    surfaceElevated: '#1B211E',
    accent: '#CBEE7C',
    heroBackground: '#0A110E',
    heroMuted: '#84948A',
  },
} as const;

export const Typography = {
  caption: 10,
  small: 11,
  body: 13,
  subtitle: 15,
  title: 17,
  display: 28,
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const CardRadius = 20;
export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
