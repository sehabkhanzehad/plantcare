import {
  Tabs,
  TabList,
  TabTrigger,
  TabSlot,
  TabTriggerSlotProps,
  TabListProps,
} from 'expo-router/ui';
import { Pressable, View, StyleSheet } from 'react-native';

import { House, Leaf, MessagesSquare, Plus, UserRound, type LucideIcon } from 'lucide-react-native';

import { CardRadius, Colors, MaxContentWidth } from '@/constants/theme';

export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={{ height: '100%' }} />
      <TabList asChild>
        <CustomTabList>
          <TabTrigger name="dashboard" href="/" asChild>
            <TabButton icon={House} label="Dashboard" />
          </TabTrigger>
          <TabTrigger name="plants" href="/plants" asChild>
            <TabButton icon={Leaf} label="Plants" />
          </TabTrigger>
          <TabTrigger name="add-plant" href="/add-plant" asChild>
            <TabButton icon={Plus} label="Add plant" featured />
          </TabTrigger>
          <TabTrigger name="community" href="/community" asChild>
            <TabButton icon={MessagesSquare} label="Community" />
          </TabTrigger>
          <TabTrigger name="profile" href="/profile" asChild>
            <TabButton icon={UserRound} label="Profile" />
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
  ...props
}: TabTriggerSlotProps & {
  icon: LucideIcon;
  label: string;
  featured?: boolean;
}) {
  const colors = Colors.light;

  return (
    <Pressable
      {...props}
      accessibilityLabel={label}
      style={[styles.tabButton, featured && styles.featuredButton]}>
      <View
        style={[
          featured ? styles.featuredIcon : styles.iconWrap,
          featured && { backgroundColor: colors.text },
        ]}>
        <Icon
          size={featured ? 20 : 21}
          color={featured ? '#CFF27E' : isFocused ? colors.primary : colors.textSecondary}
          strokeWidth={1.8}
        />
      </View>
      {isFocused && !featured ? (
        <View style={[styles.activeDot, { backgroundColor: colors.primary }]} />
      ) : null}
    </Pressable>
  );
}

export function CustomTabList({ style, children, ...props }: TabListProps) {
  return (
    <View {...props} style={[style, styles.tabListContainer]} pointerEvents="box-none">
      <View style={styles.innerContainer} pointerEvents="auto">
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
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    maxWidth: MaxContentWidth,
    shadowColor: '#0E1D15',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
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
