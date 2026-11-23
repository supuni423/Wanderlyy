import { useRef, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@react-native-vector-icons/feather/static';
import { useTheme } from '@/theme';
import { ONBOARDING_SLIDES, type OnboardingSlide } from '../slides';
import { PageDots } from '../components/PageDots';
import { SlideCollage } from '../components/SlideCollage';

interface Props {
  /** Called when the user taps Skip or finishes the last slide. */
  onDone: () => void;
}

export function OnboardingScreen({ onDone }: Props) {
  const theme = useTheme();
  const { colors, typography, spacing, touchTarget } = theme;
  const { width } = useWindowDimensions();
  const listRef = useRef<FlatList<OnboardingSlide>>(null);
  const [index, setIndex] = useState(0);

  const isLast = index === ONBOARDING_SLIDES.length - 1;

  const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setIndex(Math.round(e.nativeEvent.contentOffset.x / width));
  };

  const goNext = () => {
    if (isLast) {
      onDone();
      return;
    }
    const next = index + 1;
    listRef.current?.scrollToIndex({ index: next, animated: true });
    setIndex(next);
  };

  const renderSlide = ({ item }: { item: OnboardingSlide }) => (
    <View style={[styles.slide, { width }]}>
      <SlideCollage slide={item.key} />
      <View style={[styles.copy, { paddingHorizontal: spacing.lg }]}>
        <Text
          style={[typography.display, { color: colors.text }]}
          accessibilityRole="header"
        >
          {item.title}
          {'\n'}
          <Text style={[typography.accent, { color: colors[item.accent] }]}>
            {item.highlight}
          </Text>
        </Text>
        <Text
          style={[
            typography.body,
            { color: colors.textMuted, marginTop: spacing.sm },
          ]}
        >
          {item.description}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: colors.background }]}
      edges={['top', 'bottom']}
    >
      <View style={[styles.topBar, { paddingHorizontal: spacing.sm }]}>
        {!isLast && (
          <Pressable
            onPress={onDone}
            accessibilityRole="button"
            accessibilityLabel="Skip intro"
            hitSlop={8}
            style={[
              styles.skip,
              { minHeight: touchTarget, minWidth: touchTarget },
            ]}
          >
            <Text style={[typography.label, { color: colors.text }]}>Skip</Text>
          </Pressable>
        )}
      </View>

      <FlatList
        ref={listRef}
        data={ONBOARDING_SLIDES}
        keyExtractor={item => item.key}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScrollEnd}
        getItemLayout={(_, i) => ({
          length: width,
          offset: width * i,
          index: i,
        })}
      />

      <View
        style={[
          styles.bottomBar,
          { paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
        ]}
      >
        <PageDots count={ONBOARDING_SLIDES.length} active={index} />
        <Pressable
          onPress={goNext}
          accessibilityRole="button"
          accessibilityLabel={isLast ? "Let's begin" : 'Next slide'}
          style={({ pressed }) => [
            isLast ? styles.beginButton : styles.nextButton,
            { backgroundColor: colors.ink, opacity: pressed ? 0.85 : 1 },
          ]}
        >
          {isLast && (
            <Text
              style={[
                typography.label,
                styles.beginText,
                { color: colors.onInk },
              ]}
            >
              Let's begin
            </Text>
          )}
          <Feather name="arrow-right" size={22} color={colors.onInk} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const NEXT_SIZE = 56;

const styles = StyleSheet.create({
  screen: { flex: 1 },
  topBar: {
    height: 48,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  skip: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  slide: { flex: 1 },
  copy: { paddingTop: 16, paddingBottom: 8 },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: NEXT_SIZE,
  },
  nextButton: {
    width: NEXT_SIZE,
    height: NEXT_SIZE,
    borderRadius: NEXT_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  beginButton: {
    height: NEXT_SIZE,
    borderRadius: NEXT_SIZE / 2,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  beginText: { fontSize: 16 },
});
