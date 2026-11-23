import { StyleSheet, Text, View, type ImageSourcePropType } from 'react-native';
import type { FeatherIconName } from '@react-native-vector-icons/feather/static';
import { LabelChip, Polaroid, Sparkle, Sticker } from '@/components';
import { useTheme, type ThemeColors } from '@/theme';

type Accent = keyof Pick<
  ThemeColors,
  'primary' | 'accentPurple' | 'accentGreen'
>;

interface AuthHeaderProps {
  photo: ImageSourcePropType;
  caption: string;
  chip: string;
  icon: FeatherIconName;
  accent: Accent;
  title: string;
  /** Italic serif word(s) after the title, in the accent colour. */
  highlight: string;
  subtitle: string;
}

/** Scrapbook-style top of the login / register screens. */
export function AuthHeader({
  photo,
  caption,
  chip,
  icon,
  accent,
  title,
  highlight,
  subtitle,
}: AuthHeaderProps) {
  const { colors, typography, spacing } = useTheme();
  const tone = colors[accent];
  return (
    <View>
      <View style={styles.art} pointerEvents="none">
        <Sticker icon={icon} color={tone} rotate={-8} style={styles.sticker} />
        <Sparkle color={tone} rotate={-20} style={styles.sparkle} />
        <Polaroid
          source={photo}
          caption={caption}
          size={136}
          rotate={6}
          tapeColor={colors.accentYellow}
          style={styles.polaroid}
        />
        <LabelChip
          icon="map-pin"
          label={chip}
          color={tone}
          rotate={-5}
          style={styles.chip}
        />
      </View>
      <Text
        style={[typography.display, { color: colors.text }]}
        accessibilityRole="header"
      >
        {title}{' '}
        <Text style={[typography.accent, { color: tone }]}>{highlight}</Text>
      </Text>
      <Text
        style={[
          typography.body,
          { color: colors.textMuted, marginTop: spacing.xs },
        ]}
      >
        {subtitle}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  art: { height: 190, marginBottom: 8 },
  sticker: { left: 6, top: 34 },
  sparkle: { left: 74, top: 18 },
  polaroid: { right: 10, top: 10 },
  chip: { left: 60, bottom: 22 },
});
