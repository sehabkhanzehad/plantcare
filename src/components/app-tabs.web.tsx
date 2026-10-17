import {
  Tabs,
  TabList,
  TabTrigger,
  TabSlot,
  TabTriggerSlotProps,
  TabListProps,
} from 'expo-router/ui';
import { Pressable, View, StyleSheet, Platform } from 'react-native';

import { House, Leaf, MessagesSquare, Plus, UserRound, type LucideIcon } from 'lucide-react-native';

import { CardRadius, Colors, MaxContentWidth } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

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
          <TabTrigger name="add-plant" href="/add-plant" asChild>
            <TabButton icon={Plus} label="Add plant" featured colors={colors} />
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
  colors: typeof Colors[keyof typeof Colors];
}) {
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
        <Icon
          size={featured ? 20 : 21}
          color={featured ? colors.onPrimary : isFocused ? colors.primary : colors.textSecondary}
          strokeWidth={1.8}
        />
      </View>
      {isFocused && !featured ? (
        <View style={[styles.activeDot, { backgroundColor: colors.primary }]} />
      ) : null}
    </Pressable>
  );
}

export function CustomTabList({ style, children, colors, ...props }: TabListProps & { colors: typeof Colors[keyof typeof Colors] }) {
  return (
    <View {...props} style={[style, styles.tabListContainer]} pointerEvents="box-none">
      <View
        style={[
          styles.innerContainer,
          { backgroundColor: colors.surface, borderColor: colors.border },
          Platform.OS === 'web'
            ? {
                boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
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
