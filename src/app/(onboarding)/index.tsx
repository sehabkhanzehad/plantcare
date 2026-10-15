import { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { useSession } from '@/context/auth';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    key: 'track',
    title: 'Track your plants',
    body: 'Keep every plant in one place with care notes, types, and photos.',
  },
  {
    key: 'reminders',
    title: 'Never miss care',
    body: 'Watering and fertilizer reminders help you stay on schedule.',
  },
  {
    key: 'dashboard',
    title: 'See what needs you',
    body: 'A simple dashboard shows today’s tasks and plants that need attention.',
  },
];

export default function OnboardingScreen() {
  const theme = useTheme();
  const { completeOnboarding } = useSession();
  const [index, setIndex] = useState(0);
  const listRef = useRef<FlatList<(typeof SLIDES)[number]>>(null);

  const isLast = index === SLIDES.length - 1;

  function goNext() {
    if (isLast) {
      completeOnboarding();
      return;
    }
    listRef.current?.scrollToIndex({ index: index + 1, animated: true });
  }

  return (
    <Screen padded={false}>
      <View style={styles.brandRow}>
        <ThemedText type="smallBold" style={{ color: theme.primary }}>
          PlantCare
        </ThemedText>
        {!isLast ? (
          <Button title="Skip" variant="ghost" onPress={completeOnboarding} />
        ) : null}
      </View>

      <FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={(item) => item.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e: NativeSyntheticEvent<NativeScrollEvent>) => {
          const next = Math.round(e.nativeEvent.contentOffset.x / width);
          if (next !== index) setIndex(next);
        }}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <ThemedView type="backgroundElement" style={styles.hero}>
              <ThemedText type="subtitle" style={{ color: theme.primary, textAlign: 'center' }}>
                {item.title}
              </ThemedText>
            </ThemedView>
            <ThemedText type="default" themeColor="textSecondary" style={styles.body}>
              {item.body}
            </ThemedText>
          </View>
        )}
      />

      <View style={styles.footer}>
        <View style={styles.dots}>
          {SLIDES.map((slide, i) => (
            <View
              key={slide.key}
              style={[
                styles.dot,
                {
                  backgroundColor: i === index ? theme.primary : theme.primaryMuted,
                  width: i === index ? 20 : 8,
                },
              ]}
            />
          ))}
        </View>
        <Button title={isLast ? 'Get started' : 'Next'} onPress={goNext} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
  },
  slide: {
    paddingHorizontal: Spacing.four,
    justifyContent: 'center',
    gap: Spacing.four,
  },
  hero: {
    minHeight: 220,
    borderRadius: Spacing.four,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
  },
  body: {
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.five,
    gap: Spacing.three,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.two,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
});
