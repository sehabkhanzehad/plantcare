import {
  TabList,
  TabSlot,
  TabTrigger,
  Tabs,
  type TabListProps,
  type TabTriggerSlotProps,
} from 'expo-router/ui';
import { Pressable, StyleSheet, View } from 'react-native';
import { House, Leaf, MessagesSquare, Sparkles, UserRound, type LucideIcon } from 'lucide-react-native';

import { CardRadius } from '@/constants/theme';
import { useTheme, type AppTheme } from '@/hooks/use-theme';

export default function AppTabs() {
  const colors = useTheme();

  return (
    <Tabs>
      <TabSlot style={styles.slot} />
      <TabList asChild>
        <CustomTabList>
          <TabTrigger name="index" href="/" asChild>
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

function TabButton({
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

function CustomTabList({ style, children, ...props }: TabListProps) {
  const colors = useTheme();

  return (
    <View {...props} style={[style, styles.tabList]} pointerEvents="box-none">
      <View
        style={[
          styles.bar,
          colors.scheme === 'dark' ? colors.cardElevated : colors.card,
        ]}
        pointerEvents="auto">
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  slot: {
    height: '100%',
  },
  tabList: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 18,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  bar: {
    width: '100%',
    maxWidth: 520,
    height: 64,
    paddingHorizontal: 10,
    borderRadius: CardRadius,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tabButton: {
    width: 48,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
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
