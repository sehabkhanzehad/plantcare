import { useRef, useState } from 'react';
import {
  FlatList,
  Pressable,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { useSession } from '@/context/auth';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const SLIDES = [
  {
    key: 'care',
    eyebrow: 'SMART PLANT CARE',
    title: 'Care, right on time.',
    body: 'Watering, feeding, and every small act of care - personalized reminders keep every plant thriving.',
    image:
      'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1200&q=90',
    icon: { ios: 'drop.fill', android: 'water_drop', web: 'water_drop' },
  },
  {
    key: 'diagnostics',
    eyebrow: 'DISEASE DETECTION',
    title: 'Spot issues early.',
    body: 'Scan any leaf and get instant diagnostics - catch disease early and keep your garden healthy.',
    image:
      'https://images.unsplash.com/photo-1593691509543-c55fb32e5cee?auto=format&fit=crop&w=1200&q=90',
    icon: { ios: 'leaf.arrow.circlepath', android: 'scatter_plot', web: 'scatter_plot' },
  },
  {
    key: 'growth',
    eyebrow: 'GROWTH TRACKER',
    title: 'Track every milestone.',
    body: 'Track growth, log care history, and celebrate each new leaf with beautiful progress insights.',
    image:
      'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=1200&q=90',
    icon: { ios: 'chart.line.uptrend.xyaxis', android: 'trending_up', web: 'trending_up' },
  },
  {
    key: 'community',
    eyebrow: 'EXPERT COMMUNITY',
    title: 'Grow with experts.',
    body: 'Connect with botanists and fellow plant lovers - ask questions, share tips, and learn together.',
    image:
      'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=1200&q=90',
    icon: { ios: 'person.2.fill', android: 'people', web: 'people' },
  },
] as const;

export default function OnboardingScreen() {
  const theme = useTheme();
  const { completeOnboarding } = useSession();
  const { width, height } = useWindowDimensions();
  const isCompact = height < 720;
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
      <View style={styles.topBar}>
        <View style={styles.wordmark}>
          <View style={[styles.wordmarkMark, { backgroundColor: theme.primary }]}>
            <SymbolView
              name={{ ios: 'leaf.fill', android: 'eco', web: 'eco' }}
              tintColor={theme.onPrimary}
              size={15}
            />
          </View>
          <ThemedText type="smallBold" style={styles.wordmarkText}>
            PlantCare
          </ThemedText>
        </View>
      </View>

      <FlatList
        ref={listRef}
        style={styles.list}
        data={SLIDES}
        keyExtractor={(item) => item.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onMomentumScrollEnd={(e: NativeSyntheticEvent<NativeScrollEvent>) => {
          const next = Math.round(e.nativeEvent.contentOffset.x / width);
          if (next !== index) setIndex(next);
        }}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <View
              style={[
                styles.imageFrame,
                { height: isCompact ? height * 0.22 : Math.min(height * 0.28, 240) },
              ]}>
              <Image
                source={{ uri: item.image }}
                style={StyleSheet.absoluteFill}
                contentFit="cover"
                transition={500}
                cachePolicy="memory-disk"
              />
              <View style={styles.imageShade} />
              <View style={styles.imageIcon}>
                <SymbolView name={item.icon} tintColor="#F6EBD4" size={22} type="hierarchical" />
              </View>
            </View>

            <View style={styles.copy}>
              <ThemedText type="smallBold" style={{ color: theme.primary, letterSpacing: 1.5 }}>
                {item.eyebrow}
              </ThemedText>
              <ThemedText
                type="title"
                numberOfLines={1}
                style={[
                  styles.title,
                  isCompact && styles.compactTitle,
                  styles.singleLineTitle,
                ]}>
                {item.title}
              </ThemedText>
              <ThemedText type="default" themeColor="textSecondary" style={styles.body}>
                {item.body}
              </ThemedText>
            </View>
          </View>
        )}
      />

      <View style={styles.footer}>
        <View style={styles.dots}>
          {SLIDES.map((slide, slideIndex) => (
            <View
              key={slide.key}
              style={[
                styles.dot,
                {
                  backgroundColor: slideIndex === index ? theme.primary : theme.primaryMuted,
                  width: slideIndex === index ? 24 : 7,
                },
              ]}
            />
          ))}
        </View>
        <View style={styles.actionRow}>
          {!isLast ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Skip onboarding"
              onPress={completeOnboarding}
              style={({ pressed }) => [
                styles.skipButton,
                { borderColor: theme.border },
                pressed && styles.pressed,
              ]}>
              <ThemedText type="smallBold" themeColor="textSecondary">
                Skip
              </ThemedText>
            </Pressable>
          ) : null}
          <Button
            title={isLast ? 'Get started' : 'Next'}
            onPress={goNext}
            style={styles.cta}
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.two,
  },
  wordmark: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  wordmarkMark: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '-8deg' }],
  },
  wordmarkText: {
    fontSize: 18,
    lineHeight: 22,
    letterSpacing: 0.2,
  },
  slide: {
    paddingHorizontal: Spacing.four,
    paddingTop: 96,
    gap: Spacing.four,
  },
  imageFrame: {
    width: '78%',
    alignSelf: 'center',
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: '#183D2B',
  },
  imageShade: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(13, 40, 27, 0.25)',
  },
  imageIcon: {
    position: 'absolute',
    top: Spacing.three,
    right: Spacing.three,
    width: 46,
    height: 46,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(24, 61, 43, 0.72)',
    borderWidth: 1,
    borderColor: 'rgba(246, 235, 212, 0.35)',
  },
  copy: {
    gap: Spacing.one,
    paddingHorizontal: Spacing.two,
  },
  title: {
    fontSize: 36,
    lineHeight: 40,
    letterSpacing: -0.8,
    maxWidth: 380,
  },
  compactTitle: {
    fontSize: 32,
    lineHeight: 36,
  },
  singleLineTitle: {
    fontSize: 28,
    lineHeight: 32,
    letterSpacing: -0.5,
  },
  body: {
    lineHeight: 24,
    maxWidth: 360,
    textAlign: 'justify',
  },
  list: {
    flexGrow: 0,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: Spacing.four,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.three,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    marginBottom: Spacing.two,
  },
  dot: {
    height: 7,
    borderRadius: 4,
  },
  cta: {
    flex: 1,
    minHeight: 52,
    borderRadius: 14,
    paddingHorizontal: Spacing.two,
  },
  skipButton: {
    minHeight: 52,
    minWidth: 80,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.two,
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  pressed: {
    opacity: 0.65,
  },
});
