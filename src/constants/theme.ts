/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#14261A',
    background: '#F7FBF7',
    backgroundElement: '#E8F2E9',
    backgroundSelected: '#D4E8D6',
    textSecondary: '#5C6B60',
    primary: '#2F6F3E',
    primaryMuted: '#A8CDB0',
    onPrimary: '#FFFFFF',
    statusHealthy: '#2F6F3E',
    statusAttention: '#C47E0A',
    statusOverdue: '#B42318',
    border: '#C9D9CB',
    danger: '#B42318',
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
  },
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

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
