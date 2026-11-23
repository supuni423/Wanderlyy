import {
  Image,
  StyleSheet,
  Text,
  View,
  type ImageSourcePropType,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import {
  Feather,
  type FeatherIconName,
} from '@react-native-vector-icons/feather/static';
import { useTheme } from '@/theme';

/**
 * Small "scrapbook" building blocks used to decorate the onboarding
 * collages: taped polaroid photos, round icon stickers, label chips,
 * a dashed travel stamp and sparkle marks.
 */

interface PlacedProps {
  /** Absolute position inside the collage (top/left/right/bottom). */
  style?: StyleProp<ViewStyle>;
  /** Tilt in degrees, so pieces look hand-placed. */
  rotate?: number;
}

const tilt = (deg = 0) => ({ transform: [{ rotate: `${deg}deg` }] });

export function Polaroid({
  source,
  caption,
  size,
  tapeColor,
  rotate,
  style,
}: PlacedProps & {
  source: ImageSourcePropType;
  caption: string;
  /** Outer width of the frame in dp; the photo is square inside it. */
  size: number;
  tapeColor: string;
}) {
  const { colors, typography } = useTheme();
  return (
    <View
      style={[
        styles.polaroid,
        styles.shadow,
        {
          width: size,
          backgroundColor: colors.paper,
          shadowColor: colors.shadow,
        },
        tilt(rotate),
        style,
      ]}
    >
      <Image
        source={source}
        style={[
          styles.photo,
          { width: size - FRAME * 2, height: size - FRAME * 2 },
        ]}
        resizeMode="cover"
      />
      <Text
        style={[typography.label, typography.accent, styles.caption]}
        numberOfLines={1}
      >
        {caption}
      </Text>
      <View style={[styles.tape, { backgroundColor: tapeColor }]} />
    </View>
  );
}

export function Sticker({
  icon,
  color,
  size = 52,
  rotate,
  style,
}: PlacedProps & { icon: FeatherIconName; color: string; size?: number }) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.sticker,
        styles.shadow,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderColor: color,
          backgroundColor: colors.paper,
          shadowColor: colors.shadow,
        },
        tilt(rotate),
        style,
      ]}
    >
      <Feather name={icon} size={size * 0.46} color={color} />
    </View>
  );
}

export function LabelChip({
  icon,
  label,
  color,
  rotate,
  style,
}: PlacedProps & { icon: FeatherIconName; label: string; color: string }) {
  const { colors, typography } = useTheme();
  return (
    <View
      style={[
        styles.chip,
        styles.shadow,
        { backgroundColor: colors.paper, shadowColor: colors.shadow },
        tilt(rotate),
        style,
      ]}
    >
      <Feather name={icon} size={14} color={color} />
      <Text
        style={[typography.label, typography.accent, styles.chipText]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
}

export function Stamp({
  lines,
  color,
  rotate,
  style,
}: PlacedProps & { lines: [string, string]; color: string }) {
  return (
    <View style={[styles.stamp, { borderColor: color }, tilt(rotate), style]}>
      <Feather name="send" size={14} color={color} />
      {lines.map(line => (
        <Text key={line} style={[styles.stampText, { color }]}>
          {line}
        </Text>
      ))}
    </View>
  );
}

/** Three short strokes, like the "shine" marks drawn around a doodle. */
export function Sparkle({
  color,
  rotate,
  style,
}: PlacedProps & { color: string }) {
  return (
    <View style={[styles.sparkle, tilt(rotate), style]}>
      {[-35, 0, 35].map(angle => (
        <View
          key={angle}
          style={[styles.stroke, { backgroundColor: color }, tilt(angle)]}
        />
      ))}
    </View>
  );
}

const PHOTO_INK = '#2B241D';
const FRAME = 8;

const styles = StyleSheet.create({
  shadow: {
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 6,
  },
  polaroid: {
    position: 'absolute',
    padding: FRAME,
    paddingBottom: 6,
    borderRadius: 4,
  },
  photo: {
    borderRadius: 2,
  },
  caption: {
    color: PHOTO_INK,
    textAlign: 'center',
    marginTop: 6,
  },
  tape: {
    position: 'absolute',
    top: -9,
    left: '32%',
    width: '36%',
    height: 18,
    opacity: 0.75,
    transform: [{ rotate: '-4deg' }],
  },
  sticker: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  chip: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  chipText: {
    color: PHOTO_INK,
    flexShrink: 0,
    // Italic serif glyphs lean right; a little room stops the last letter clipping.
    paddingRight: 2,
  },
  stamp: {
    position: 'absolute',
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stampText: {
    fontSize: 9,
    lineHeight: 13,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  sparkle: {
    position: 'absolute',
    width: 28,
    height: 22,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  stroke: {
    width: 3,
    height: 14,
    borderRadius: 2,
  },
});
