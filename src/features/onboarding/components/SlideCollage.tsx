import { useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import { useTheme } from '@/theme';
import type { SlideKey } from '../slides';
import { LabelChip, Polaroid, Sparkle, Stamp, Sticker } from './Scrapbook';

const photos = {
  kyoto: require('@/assets/images/onboarding/kyoto.jpg'),
  paris: require('@/assets/images/onboarding/paris.jpg'),
  santorini: require('@/assets/images/onboarding/santorini.jpg'),
  venice: require('@/assets/images/onboarding/venice.jpg'),
  bali: require('@/assets/images/onboarding/bali.jpg'),
  mountains: require('@/assets/images/onboarding/mountains.jpg'),
};

/** The decorative photo collage at the top of each onboarding slide. */
export function SlideCollage({ slide }: { slide: SlideKey }) {
  const { colors } = useTheme();
  // Photo sizes scale with the space the slide gives the collage, so
  // the layout fits small and large phones alike.
  const [base, setBase] = useState(0);
  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setBase(Math.min(width, height));
  };

  return (
    <View style={styles.canvas} pointerEvents="none" onLayout={onLayout}>
      <View style={{ width: base, height: base }}>
        {base > 0 && slide === 'discover' && (
          <>
            <Polaroid
              source={photos.kyoto}
              caption="Kyoto"
              size={base * 0.54}
              rotate={-7}
              tapeColor={colors.primaryMuted}
              style={pos.kyoto}
            />
            <Polaroid
              source={photos.paris}
              caption="Paris"
              size={base * 0.5}
              rotate={6}
              tapeColor={colors.accentYellow}
              style={pos.paris}
            />
            <LabelChip
              icon="map-pin"
              label="Japan"
              color={colors.primary}
              rotate={-4}
              style={pos.japanChip}
            />
            <Sticker
              icon="globe"
              color={colors.accentGreen}
              rotate={8}
              style={pos.globe}
            />
            <Sticker
              icon="navigation"
              color={colors.accentPurple}
              size={44}
              rotate={-10}
              style={pos.plane}
            />
            <Sparkle color={colors.primary} rotate={-20} style={pos.sparkle1} />
          </>
        )}

        {base > 0 && slide === 'save' && (
          <>
            <Polaroid
              source={photos.santorini}
              caption="Santorini"
              size={base * 0.6}
              rotate={-4}
              tapeColor={colors.accentPurple}
              style={pos.santorini}
            />
            <Polaroid
              source={photos.venice}
              caption="Venice"
              size={base * 0.42}
              rotate={8}
              tapeColor={colors.accentYellow}
              style={pos.venice}
            />
            <Sticker
              icon="heart"
              color={colors.accentPurple}
              size={60}
              rotate={-8}
              style={pos.heart}
            />
            <LabelChip
              icon="heart"
              label="Greece"
              color={colors.primary}
              rotate={6}
              style={pos.greeceChip}
            />
            <Sticker
              icon="bookmark"
              color={colors.primary}
              size={40}
              rotate={12}
              style={pos.bookmark}
            />
            <Sparkle
              color={colors.accentPurple}
              rotate={25}
              style={pos.sparkle2}
            />
          </>
        )}

        {base > 0 && slide === 'offline' && (
          <>
            <Polaroid
              source={photos.mountains}
              caption="Canada"
              size={base * 0.56}
              rotate={5}
              tapeColor={colors.accentGreen}
              style={pos.mountains}
            />
            <Polaroid
              source={photos.bali}
              caption="Bali"
              size={base * 0.4}
              rotate={-6}
              tapeColor={colors.primaryMuted}
              style={pos.bali}
            />
            <Sticker
              icon="wifi-off"
              color={colors.accentGreen}
              size={60}
              rotate={-6}
              style={pos.wifiOff}
            />
            <LabelChip
              icon="check-circle"
              label="Saved offline"
              color={colors.accentGreen}
              rotate={-3}
              style={pos.offlineChip}
            />
            <Stamp
              lines={['GO', 'ANYWHERE']}
              color={colors.accentPurple}
              rotate={12}
              style={pos.stamp}
            />
            <Sparkle
              color={colors.accentGreen}
              rotate={-15}
              style={pos.sparkle3}
            />
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  canvas: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 24,
    marginTop: 8,
  },
});

/** Where each piece sits in its collage (percent of the canvas). */
const pos = StyleSheet.create({
  kyoto: { top: '6%', left: '2%' },
  paris: { top: '24%', right: '2%' },
  japanChip: { bottom: '6%', left: '8%' },
  globe: { top: '0%', right: '10%' },
  plane: { bottom: '2%', right: '12%' },
  sparkle1: { top: '2%', left: '58%' },
  santorini: { top: '4%', left: '8%' },
  venice: { bottom: '4%', right: '2%' },
  heart: { bottom: '12%', left: '6%' },
  greeceChip: { top: '6%', right: '4%' },
  bookmark: { top: '40%', right: '12%' },
  sparkle2: { bottom: '36%', left: '4%' },
  mountains: { top: '8%', left: '4%' },
  bali: { top: '34%', right: '2%' },
  wifiOff: { bottom: '6%', left: '8%' },
  offlineChip: { bottom: '4%', right: '6%' },
  stamp: { top: '0%', right: '6%' },
  sparkle3: { top: '2%', left: '62%' },
});
