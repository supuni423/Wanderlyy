import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  Feather,
  type FeatherIconName,
} from '@react-native-vector-icons/feather/static';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { useTheme } from '@/theme';
import {
  selectThemePreference,
  themePreferenceChanged,
  type ThemePreference,
} from '../themeSlice';

const OPTIONS: {
  value: ThemePreference;
  label: string;
  icon: FeatherIconName;
}[] = [
  { value: 'system', label: 'System', icon: 'smartphone' },
  { value: 'light', label: 'Light', icon: 'sun' },
  { value: 'dark', label: 'Dark', icon: 'moon' },
];

/** Three-way switch: follow the phone, or always light / always dark. */
export function ThemeSelector() {
  const { colors, typography, radius, touchTarget } = useTheme();
  const dispatch = useAppDispatch();
  const preference = useAppSelector(selectThemePreference);

  return (
    <View
      style={[
        styles.row,
        { backgroundColor: colors.surfaceMuted, borderRadius: radius.pill },
      ]}
      accessibilityRole="radiogroup"
      accessibilityLabel="Appearance"
    >
      {OPTIONS.map(option => {
        const selected = option.value === preference;
        return (
          <Pressable
            key={option.value}
            onPress={() => dispatch(themePreferenceChanged(option.value))}
            accessibilityRole="radio"
            accessibilityLabel={`${option.label} theme`}
            accessibilityState={{ checked: selected }}
            style={[
              styles.option,
              { minHeight: touchTarget, borderRadius: radius.pill },
              selected && { backgroundColor: colors.ink },
            ]}
          >
            <Feather
              name={option.icon}
              size={16}
              color={selected ? colors.onInk : colors.textMuted}
            />
            <Text
              style={[
                typography.label,
                { color: selected ? colors.onInk : colors.text },
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', padding: 4, gap: 4 },
  option: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
});
