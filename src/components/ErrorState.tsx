import type { FeatherIconName } from '@react-native-vector-icons/feather/static';
import { useTheme } from '@/theme';
import { AppButton } from './AppButton';
import { StateMessage } from './StateMessage';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  icon?: FeatherIconName;
  /** Shows a "Try again" button when provided. */
  onRetry?: () => void;
  retrying?: boolean;
}

/** Shown when something failed to load, with an optional retry button. */
export function ErrorState({
  title = 'Something went wrong',
  message = 'We could not load this right now. Check your connection and try again.',
  icon = 'cloud-off',
  onRetry,
  retrying = false,
}: ErrorStateProps) {
  const { colors } = useTheme();
  return (
    <StateMessage
      icon={icon}
      tone={colors.danger}
      title={title}
      message={message}
      testID="error-state"
    >
      {onRetry && (
        <AppButton
          title="Try again"
          icon="refresh-cw"
          variant="ink"
          onPress={onRetry}
          loading={retrying}
        />
      )}
    </StateMessage>
  );
}
