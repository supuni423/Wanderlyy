import type { ReactNode } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  Feather,
  type FeatherIconName,
} from '@react-native-vector-icons/feather/static';
import { useTheme } from '@/theme';
import type { CountrySummary } from '../types';

/**
 * Building blocks of the Country Details screen, kept small so the
 * screen file reads as a simple layout.
 */

/** Big taped polaroid with the flag, like a photo stuck in a journal. */
export function FlagHero({
  country,
  description,
}: {
  country: CountrySummary;
  description?: string | null;
}) {
  const { colors, typography } = useTheme();
  const label = `Flag of ${country.name}${
    description ? `. ${description}` : ''
  }`;
  return (
    <View style={styles.heroWrap}>
      <View
        style={[
          styles.polaroid,
          { backgroundColor: colors.paper, shadowColor: colors.shadow },
        ]}
        accessible
        accessibilityRole="image"
        accessibilityLabel={label}
      >
        {country.flagUrl ? (
          <Image
            source={{ uri: country.flagUrl }}
            style={styles.heroFlag}
            resizeMode="contain"
            accessibilityIgnoresInvertColors
          />
        ) : (
          <Text style={styles.heroEmoji}>{country.flagEmoji || '🏳️'}</Text>
        )}
        <Text
          style={[typography.h2, typography.accent, styles.caption]}
          numberOfLines={1}
        >
          {country.name}
        </Text>
        <View style={[styles.tape, { backgroundColor: colors.accentYellow }]} />
      </View>
    </View>
  );
}

/** Small "sticky note" with one headline number. */
export function StatTile({
  icon,
  label,
  value,
  tone,
}: {
  icon: FeatherIconName;
  label: string;
  value: string;
  tone: string;
}) {
  const { colors, typography, radius } = useTheme();
  return (
    <View
      style={[
        styles.tile,
        {
          backgroundColor: colors.surface,
          borderColor: tone,
          borderRadius: radius.md,
        },
      ]}
      accessible
      accessibilityLabel={`${label}: ${value}`}
    >
      <Feather name={icon} size={18} color={tone} />
      <Text
        style={[typography.h2, { color: colors.text }]}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {value}
      </Text>
      <Text style={[typography.caption, { color: colors.textMuted }]}>
        {label}
      </Text>
    </View>
  );
}

/** A titled card that groups fact rows. */
export function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const { colors, typography, radius, spacing } = useTheme();
  return (
    <View style={{ gap: spacing.sm }}>
      <Text
        style={[typography.h2, typography.accent, { color: colors.text }]}
        accessibilityRole="header"
      >
        {title}
      </Text>
      <View
        style={[
          styles.section,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderRadius: radius.lg,
          },
        ]}
      >
        {children}
      </View>
    </View>
  );
}

/** One "label: value" line with an icon, read as a single sentence. */
export function FactRow({
  icon,
  label,
  value,
  last = false,
}: {
  icon: FeatherIconName;
  label: string;
  value: string;
  last?: boolean;
}) {
  const { colors, typography } = useTheme();
  return (
    <View
      style={[
        styles.fact,
        !last && [styles.divider, { borderBottomColor: colors.border }],
      ]}
      accessible
      accessibilityLabel={`${label}: ${value}`}
    >
      <Feather name={icon} size={18} color={colors.primary} />
      <Text
        style={[
          typography.label,
          styles.factLabel,
          { color: colors.textMuted },
        ]}
      >
        {label}
      </Text>
      <Text style={[typography.body, styles.factValue, { color: colors.text }]}>
        {value}
      </Text>
    </View>
  );
}

/** Tappable chip for a neighbouring country. */
export function NeighbourChip({
  label,
  onPress,
  savedOffline = false,
}: {
  label: string;
  onPress: () => void;
  /** Its page is saved, so it opens offline. */
  savedOffline?: boolean;
}) {
  const { colors, typography, touchTarget } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Open ${label}${
        savedOffline ? ', saved for offline' : ''
      }`}
      style={({ pressed }) => [
        styles.neighbour,
        {
          minHeight: touchTarget,
          borderColor: colors.border,
          backgroundColor: pressed ? colors.primaryMuted : colors.surface,
        },
      ]}
    >
      <Text style={[typography.label, { color: colors.text }]}>{label}</Text>
      <Feather
        name={savedOffline ? 'download-cloud' : 'arrow-up-right'}
        size={14}
        color={savedOffline ? colors.accentGreen : colors.primary}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  heroWrap: { alignItems: 'center', paddingTop: 12, paddingBottom: 4 },
  polaroid: {
    width: 260,
    padding: 10,
    paddingBottom: 8,
    borderRadius: 4,
    transform: [{ rotate: '-2deg' }],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
  },
  heroFlag: { width: '100%', height: 160, backgroundColor: '#F2EEE8' },
  heroEmoji: { fontSize: 110, textAlign: 'center' },
  caption: { color: '#2B241D', textAlign: 'center', marginTop: 8 },
  tape: {
    position: 'absolute',
    top: -10,
    left: '35%',
    width: '30%',
    height: 22,
    opacity: 0.75,
    transform: [{ rotate: '3deg' }],
  },
  tile: {
    flex: 1,
    minHeight: 96,
    padding: 12,
    gap: 2,
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },
  section: { borderWidth: 1, paddingHorizontal: 16 },
  fact: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 14,
  },
  divider: { borderBottomWidth: 1 },
  factLabel: { width: 104, paddingTop: 2 },
  factValue: { flex: 1 },
  neighbour: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderRadius: 999,
  },
});
