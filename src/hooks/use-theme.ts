import { useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';
import { useAppearanceOptional } from '@/context/appearance';

export function useTheme() {
  const appearance = useAppearanceOptional();
  const system = useColorScheme();
  const scheme =
    appearance?.colorScheme ?? (system === 'dark' ? 'dark' : 'light');
  return Colors[scheme];
}
