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
    text: '#E8F2E9',
    background: '#0F1611',
    backgroundElement: '#1A241C',
    backgroundSelected: '#243028',
    textSecondary: '#9AAB9E',
    primary: '#6FBF7E',
    primaryMuted: '#2A4A32',
    onPrimary: '#0F1611',
    statusHealthy: '#6FBF7E',
    statusAttention: '#E0A43A',
    statusOverdue: '#F97066',
    border: '#2E3D31',
    danger: '#F97066',
    surface: '#1A241C',
    surfaceElevated: '#243028',
    accent: '#CFF27E',
    heroBackground: '#0A120D',
    heroMuted: '#9AAB9E',
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
