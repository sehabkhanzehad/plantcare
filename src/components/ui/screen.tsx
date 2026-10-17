import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type ViewProps,
} from 'react-native';
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
          <KeyboardAvoidingView
            style={styles.keyboardAvoiding}
            behavior="padding"
            keyboardVerticalOffset={0}>
            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="always"
              keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
              showsVerticalScrollIndicator={false}>
              {content}
            </ScrollView>
          </KeyboardAvoidingView>
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
    width: '100%',
    alignItems: 'stretch',
  },
  scroll: {
    width: '100%',
  },
  keyboardAvoiding: {
    flex: 1,
    width: '100%',
  },
  content: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  padded: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
  },
});
