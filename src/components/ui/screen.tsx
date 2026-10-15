import { ScrollView, StyleSheet, View, type ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

export type ScreenProps = ViewProps & {
  scroll?: boolean;
  padded?: boolean;
  tabBarInset?: boolean;
};

export function Screen({
  children,
  scroll = false,
  padded = true,
  tabBarInset = false,
  style,
  ...rest
}: ScreenProps) {
  const content = (
    <View
      style={[
        styles.content,
        padded && styles.padded,
        tabBarInset && { paddingBottom: BottomTabInset + Spacing.three },
        style,
      ]}
      {...rest}>
      {children}
    </View>
  );

  return (
    <ThemedView style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        {scroll ? (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            {content}
          </ScrollView>
        ) : (
          content
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  safe: {
    flex: 1,
    alignItems: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
  },
  content: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
  },
  padded: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
  },
});
