import type { FeatherIconName } from '@react-native-vector-icons/feather/static';
import { useTheme } from '@/theme';
import { AppButton } from './AppButton';
import { StateMessage } from './StateMessage';

export interface EmptyStateProps {
  title: string;
  message?: string;
  icon?: FeatherIconName;
  /** Optional call to action, e.g. "Explore countries". */
  actionLabel?: string;
  onAction?: () => void;
}

/** Shown when a list has nothing in it (no favourites, no search results). */
export function EmptyState({
  title,
  message,
  icon = 'compass',
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const { colors } = useTheme();
  return (
    <StateMessage
      icon={icon}
      tone={colors.accentPurple}
      title={title}
      message={message}
      testID="empty-state"
    >
      {actionLabel && onAction && (
        <AppButton
          title={actionLabel}
          icon="arrow-right"
          iconPosition="right"
          variant="outline"
          onPress={onAction}
        />
      )}
    </StateMessage>
  );
}
