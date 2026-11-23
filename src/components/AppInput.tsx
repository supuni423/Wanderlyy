import { useState, type ComponentRef, type Ref } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import {
  Feather,
  type FeatherIconName,
} from '@react-native-vector-icons/feather/static';
import { getInputStyles, useTheme } from '@/theme';

export interface AppInputProps extends Omit<TextInputProps, 'style'> {
  label: string;
  /** Validation message; turns the border red and is read by screen readers. */
  error?: string;
  /** Optional Feather icon at the start of the field. */
  icon?: FeatherIconName;
  /** Password field: hides the text and adds a show/hide eye button. */
  secure?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  ref?: Ref<ComponentRef<typeof TextInput>>;
}

/** Labelled text field with focus, error and password-visibility states. */
export function AppInput({
  label,
  error,
  icon,
  secure = false,
  containerStyle,
  onFocus,
  onBlur,
  ref,
  ...inputProps
}: AppInputProps) {
  const theme = useTheme();
  const { colors, iconSize, touchTarget } = theme;
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(secure);
  const styles = getInputStyles(theme, { focused, hasError: !!error });

  return (
    <View style={containerStyle}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.field}>
        {icon && (
          <Feather
            name={icon}
            size={iconSize.md}
            color={focused ? colors.primary : colors.textMuted}
          />
        )}
        <TextInput
          ref={ref}
          style={styles.input}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={hidden}
          accessibilityLabel={label}
          accessibilityHint={error}
          onFocus={e => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={e => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...inputProps}
        />
        {secure && (
          <Pressable
            onPress={() => setHidden(h => !h)}
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Show password' : 'Hide password'}
            hitSlop={4}
            style={[
              local.eye,
              { minWidth: touchTarget, minHeight: touchTarget },
            ]}
          >
            <Feather
              name={hidden ? 'eye' : 'eye-off'}
              size={iconSize.md}
              color={colors.textMuted}
            />
          </Pressable>
        )}
      </View>
      {!!error && (
        <Text style={styles.error} accessibilityLiveRegion="polite">
          {error}
        </Text>
      )}
    </View>
  );
}

const local = StyleSheet.create({
  eye: { alignItems: 'center', justifyContent: 'center', marginRight: -8 },
});
