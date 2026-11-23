import { useRef } from 'react';
import { Animated, Pressable, StyleSheet } from 'react-native';
import { Feather } from '@react-native-vector-icons/feather/static';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import type { CountrySummary } from '@/features/countries';
import { countriesApi } from '@/features/countries/countriesApi';
import { selectIsOffline } from '@/features/offline/networkSlice';
import { useTheme } from '@/theme';
import { selectIsFavourite, toggleFavourite } from '../favouritesSlice';

interface FavouriteButtonProps {
  country: CountrySummary;
  /** "card": round sticker on list cards. "header": plain icon in a nav bar. */
  variant?: 'card' | 'header';
  /** Called after a tap with the new state (true = now saved). */
  onChange?: (saved: boolean) => void;
}

/**
 * Heart toggle. Feather has no filled heart, so a saved country shows a
 * white heart on a coral circle; an unsaved one shows an outline heart.
 * Gives a small "pop" when tapped.
 */
export function FavouriteButton({
  country,
  variant = 'card',
  onChange,
}: FavouriteButtonProps) {
  const { colors, touchTarget } = useTheme();
  const dispatch = useAppDispatch();
  const saved = useAppSelector(state => selectIsFavourite(state, country.code));
  const offline = useAppSelector(selectIsOffline);
  const scale = useRef(new Animated.Value(1)).current;

  const onPress = () => {
    dispatch(toggleFavourite(country));
    if (!saved && !offline) {
      // Saving a favourite also keeps its full page for offline use
      // (one request; skipped if it is already in RTK Query's cache).
      dispatch(
        countriesApi.util.prefetch('getCountryByCode', country.code, {
          ifOlderThan: 60 * 60,
        }),
      );
    }
    onChange?.(!saved);
    scale.setValue(0.7);
    Animated.spring(scale, {
      toValue: 1,
      friction: 3,
      tension: 160,
      useNativeDriver: true,
    }).start();
  };

  const circle = variant === 'card' ? 36 : 34;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={
        saved
          ? `Remove ${country.name} from favourites`
          : `Save ${country.name} to favourites`
      }
      accessibilityState={{ selected: saved }}
      hitSlop={4}
      style={[styles.target, { minWidth: touchTarget, minHeight: touchTarget }]}
      testID={`favourite-${country.code}`}
    >
      <Animated.View
        style={[
          styles.circle,
          {
            width: circle,
            height: circle,
            borderRadius: circle / 2,
            backgroundColor: saved ? colors.primary : colors.surface,
            borderColor: saved ? colors.primary : colors.border,
            transform: [{ scale }],
          },
        ]}
      >
        <Feather
          name="heart"
          size={18}
          color={saved ? colors.onPrimary : colors.textMuted}
        />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  target: { alignItems: 'center', justifyContent: 'center' },
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
});
