import {
  Tabs,
  TabList,
  TabTrigger,
  TabSlot,
  TabTriggerSlotProps,
  TabListProps,
} from 'expo-router/ui';
import { Pressable, View, StyleSheet, Platform } from 'react-native';

import { House, Leaf, MessagesSquare, Sparkles, UserRound, type LucideIcon } from 'lucide-react-native';

import { CardRadius, MaxContentWidth } from '@/constants/theme';
import { useTheme, type AppTheme } from '@/hooks/use-theme';

export default function AppTabs() {
  const colors = useTheme();

  return (
    <Tabs>
      <TabSlot style={{ height: '100%' }} />
      <TabList asChild>
        <CustomTabList colors={colors}>
          <TabTrigger name="dashboard" href="/" asChild>
            <TabButton icon={House} label="Dashboard" colors={colors} />
          </TabTrigger>
          <TabTrigger name="plants" href="/plants" asChild>
            <TabButton icon={Leaf} label="Plants" colors={colors} />
          </TabTrigger>
          <TabTrigger name="assistant" href="/assistant" asChild>
            <TabButton icon={Sparkles} label="AI Assistant" colors={colors} featured />
          </TabTrigger>
          <TabTrigger name="community" href="/community" asChild>
            <TabButton icon={MessagesSquare} label="Community" colors={colors} />
          </TabTrigger>
          <TabTrigger name="profile" href="/profile" asChild>
            <TabButton icon={UserRound} label="Profile" colors={colors} />
          </TabTrigger>
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}

export function TabButton({
  icon: Icon,
  label,
  featured = false,
  isFocused,
  colors,
  ...props
}: TabTriggerSlotProps & {
  icon: LucideIcon;
  label: string;
  featured?: boolean;
  colors: AppTheme;
}) {
  const tint = featured ? colors.onPrimary : isFocused ? colors.primary : colors.textSecondary;
  return (
    <Pressable
      {...props}
      accessibilityLabel={label}
      style={[styles.tabButton, featured && styles.featuredButton]}>
      <View
        style={[
          featured ? styles.featuredIcon : styles.iconWrap,
          featured && { backgroundColor: colors.primary },
        ]}>
        <Icon size={featured ? 22 : 21} color={tint} strokeWidth={1.8} />
      </View>
      {isFocused && !featured ? (
        <View style={[styles.activeDot, { backgroundColor: colors.primary }]} />
      ) : null}
    </Pressable>
  );
}

export function CustomTabList({ style, children, colors, ...props }: TabListProps & { colors: AppTheme }) {
  return (
    <View {...props} style={[style, styles.tabListContainer]} pointerEvents="box-none">
      <View
        style={[
          styles.innerContainer,
          colors.scheme === 'dark' ? colors.cardElevated : colors.card,
          Platform.OS === 'web'
            ? {
                boxShadow:
                  colors.scheme === 'dark'
                    ? '0 14px 40px rgba(0,0,0,0.62)'
                    : '0 8px 20px rgba(0,0,0,0.12)',
              }
            : {},
        ]}
        pointerEvents="auto">
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabListContainer: {
    position: 'absolute',
    width: '100%',
    bottom: 18,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  innerContainer: {
    height: 64,
    paddingHorizontal: 12,
    borderRadius: CardRadius,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    maxWidth: MaxContentWidth,
    elevation: 8,
  },
  tabButton: {
    width: 48,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    outlineWidth: 0,
    outlineColor: 'transparent',
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuredButton: {
    marginTop: -22,
  },
  featuredIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeDot: {
    position: 'absolute',
    bottom: 10,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});
