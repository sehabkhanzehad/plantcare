import {
  Tabs,
  TabList,
  TabTrigger,
  TabSlot,
  TabTriggerSlotProps,
  TabListProps,
} from 'expo-router/ui';
import { Pressable, useColorScheme, View, StyleSheet } from 'react-native';

import { SymbolView } from 'expo-symbols';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

import { Colors, MaxContentWidth, Spacing } from '@/constants/theme';

export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={{ height: '100%' }} />
      <TabList asChild>
        <CustomTabList>
          <TabTrigger name="dashboard" href="/" asChild>
            <TabButton iconName="house.fill">Dashboard</TabButton>
          </TabTrigger>
          <TabTrigger name="plants" href="/plants" asChild>
            <TabButton iconName="leaf.fill">Plants</TabButton>
          </TabTrigger>
          <TabTrigger name="add-plant" href="/add-plant" asChild>
            <TabButton iconName="plus.circle.fill">Add Plant</TabButton>
          </TabTrigger>
          <TabTrigger name="notifications" href="/notifications" asChild>
            <TabButton iconName="bell.fill">Alerts</TabButton>
          </TabTrigger>
          <TabTrigger name="profile" href="/profile" asChild>
            <TabButton iconName="person.fill">Profile</TabButton>
          </TabTrigger>
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}

export function TabButton({
  children,
  iconName,
  isFocused,
  ...props
}: TabTriggerSlotProps & { iconName: string }) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' || scheme == null ? 'light' : scheme];

  return (
    <Pressable {...props} style={styles.tabButtonView}>
      <ThemedView
        type={isFocused ? 'backgroundSelected' : 'backgroundElement'}
        style={styles.tabButtonFill}>
        <SymbolView
          name={iconName as any}
          size={16}
          tintColor={isFocused ? colors.primary : colors.textSecondary}
        />
        <ThemedText type="small" themeColor={isFocused ? 'primary' : 'textSecondary'}>
          {children}
        </ThemedText>
      </ThemedView>
    </Pressable>
  );
}

export function CustomTabList(props: TabListProps) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' || scheme == null ? 'light' : scheme];

  return (
    <View {...props} style={styles.tabListContainer}>
      <ThemedView type="backgroundElement" style={styles.innerContainer}>
        <ThemedText type="smallBold" style={[styles.brandText, { color: colors.primary }]}>
          PlantCare
        </ThemedText>
        {props.children}
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  tabListContainer: {
    position: 'absolute',
    width: '100%',
    padding: Spacing.three,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  innerContainer: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.five,
    borderRadius: Spacing.five,
    flexDirection: 'row',
    alignItems: 'center',
    flexGrow: 1,
    gap: Spacing.two,
    maxWidth: MaxContentWidth,
  },
  brandText: {
    marginRight: 'auto',
  },
  tabButtonView: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
    backgroundColor: 'transparent',
    outlineWidth: 0,
    outlineColor: 'transparent',
  },
  tabButtonFill: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: Spacing.one,
  },
});
