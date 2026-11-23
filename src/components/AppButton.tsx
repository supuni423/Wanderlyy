import {
  ActivityIndicator,
  Pressable,
  Text,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import {
  Feather,
  type FeatherIconName,
} from '@react-native-vector-icons/feather/static';
import { getButtonStyles, useTheme, type ButtonVariant } from '@/theme';

export interface AppButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  /** Optional Feather icon shown next to the title. */
  icon?: FeatherIconName;
  iconPosition?: 'left' | 'right';
  /** Shows a spinner and blocks presses (e.g. while signing in). */
  loading?: boolean;
  disabled?: boolean;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/** The one button used across the app: themed, 48dp+ tall, pill shaped. */
export function AppButton({
  title,
  onPress,
  variant = 'primary',
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  accessibilityLabel,
  style,
  testID,
}: AppButtonProps) {
  const theme = useTheme();
  const inactive = disabled || loading;
  const { container, label } = getButtonStyles(theme, variant, inactive);
  const iconNode = icon && !loading && (
    <Feather name={icon} size={theme.iconSize.md} color={label.color} />
  );

  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled: inactive, busy: loading }}
      testID={testID}
      style={({ pressed }) => [
        container,
        pressed && !inactive && { transform: [{ scale: 0.98 }] },
        style,
      ]}
    >
      {loading && (
        <ActivityIndicator
          color={label.color}
          testID={testID ? `${testID}-spinner` : 'button-spinner'}
        />
      )}
      {iconPosition === 'left' && iconNode}
      <Text style={label} numberOfLines={1}>
        {title}
      </Text>
      {iconPosition === 'right' && iconNode}
    </Pressable>
  );
}
