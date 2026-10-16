import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';

export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' || scheme == null ? 'light' : scheme];

  return (
    <NativeTabs
      backgroundColor={colors.background}
      indicatorColor="transparent"
      rippleColor="transparent"
      iconColor={{ default: colors.textSecondary, selected: colors.primary }}
      labelStyle={{ selected: { color: colors.primary } }}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Dashboard</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'house', selected: 'house.fill' }}
          md={{ default: 'home', selected: 'home' }}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="plants">
        <NativeTabs.Trigger.Label>Plants</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'leaf', selected: 'leaf.fill' }}
          md={{ default: 'eco', selected: 'eco' }}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="add-plant">
        <NativeTabs.Trigger.Label>Add Plant</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'plus.circle', selected: 'plus.circle.fill' }}
          md={{ default: 'add_circle_outline', selected: 'add_circle' }}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="notifications">
        <NativeTabs.Trigger.Label>Alerts</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'bell', selected: 'bell.fill' }}
          md={{ default: 'notifications_none', selected: 'notifications' }}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="profile">
        <NativeTabs.Trigger.Label>Profile</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'person', selected: 'person.fill' }}
          md={{ default: 'person_outline', selected: 'person' }}
          renderingMode="template"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
