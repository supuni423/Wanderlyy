import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Feather } from '@react-native-vector-icons/feather/static';
import { useTheme } from '@/theme';

export interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  /** Read by screen readers, e.g. "Search countries". */
  accessibilityLabel: string;
}

/** Rounded search field with a search icon and a clear (x) button. */
export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search',
  accessibilityLabel,
}: SearchBarProps) {
  const { colors, typography, radius, touchTarget, iconSize } = useTheme();
  const [focused, setFocused] = useState(false);

  return (
    <View
      style={[
        styles.field,
        {
          minHeight: touchTarget,
          borderRadius: radius.pill,
          backgroundColor: colors.surface,
          borderColor: focused ? colors.primary : colors.border,
        },
      ]}
    >
      <Feather
        name="search"
        size={iconSize.md}
        color={focused ? colors.primary : colors.textMuted}
      />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        accessibilityLabel={accessibilityLabel}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        clearButtonMode="never"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={[typography.body, styles.input, { color: colors.text }]}
      />
      {value.length > 0 && (
        <Pressable
          onPress={() => onChangeText('')}
          accessibilityRole="button"
          accessibilityLabel="Clear search"
          hitSlop={4}
          style={[
            styles.clear,
            { minWidth: touchTarget, minHeight: touchTarget },
          ]}
        >
          <Feather
            name="x-circle"
            size={iconSize.md}
            color={colors.textMuted}
          />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 16,
    paddingRight: 4,
    borderWidth: 1.5,
  },
  input: { flex: 1, paddingVertical: 8 },
  clear: { alignItems: 'center', justifyContent: 'center' },
});
