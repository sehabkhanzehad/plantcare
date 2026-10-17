import { useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';
import { useAppearanceOptional } from '@/context/appearance';

export function useResolvedColorScheme(): 'light' | 'dark' {
  const appearance = useAppearanceOptional();
  const system = useColorScheme();
  return appearance?.colorScheme ?? (system === 'dark' ? 'dark' : 'light');
}

export function useTheme() {
  return Colors[useResolvedColorScheme()];
}
