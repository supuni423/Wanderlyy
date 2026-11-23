import { StyleSheet, View } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AppButton } from '@/components';
import { useTheme } from '@/theme';
import { AuthHeader } from '../components/AuthHeader';
import { AuthLayout } from '../components/AuthLayout';
import { AuthSwitchLink } from '../components/AuthSwitchLink';
import { FormError } from '../components/FormError';
import { FormInput } from '../components/FormInput';
import { registerSchema, type RegisterValues } from '../validation';

export interface RegisterScreenProps {
  /** Only called with values that passed validation (already trimmed). */
  onSubmit: (values: RegisterValues) => void;
  onGoToLogin: () => void;
  submitting?: boolean;
  /** Server or network error from the last attempt. */
  errorMessage?: string;
}

const EMPTY: RegisterValues = {
  firstName: '',
  lastName: '',
  email: '',
  username: '',
  password: '',
  confirmPassword: '',
};

export function RegisterScreen({
  onSubmit,
  onGoToLogin,
  submitting = false,
  errorMessage,
}: RegisterScreenProps) {
  const { spacing } = useTheme();
  const { control, handleSubmit, setFocus, trigger, formState } =
    useForm<RegisterValues>({
      resolver: zodResolver(registerSchema),
      defaultValues: EMPTY,
      mode: 'onTouched',
    });

  // Called without the native event: handleSubmit expects a web-style event.
  const submit = () => handleSubmit(onSubmit)();
  const next = (field: keyof RegisterValues) => () => setFocus(field);

  const common = {
    control,
    autoCorrect: false,
    returnKeyType: 'next' as const,
    submitBehavior: 'submit' as const,
  };

  return (
    <AuthLayout>
      <AuthHeader
        photo={require('@/assets/images/onboarding/santorini.jpg')}
        caption="Santorini"
        chip="First trip?"
        icon="user-plus"
        accent="accentPurple"
        title="Start your"
        highlight="journey"
        subtitle="Create an account to save the countries you love."
      />

      <View style={[styles.row, { gap: spacing.sm }]}>
        <FormInput
          {...common}
          name="firstName"
          containerStyle={styles.half}
          label="First name"
          placeholder="Emily"
          autoCapitalize="words"
          autoComplete="given-name"
          onSubmitEditing={next('lastName')}
        />
        <FormInput
          {...common}
          name="lastName"
          containerStyle={styles.half}
          label="Last name"
          placeholder="Johnson"
          autoCapitalize="words"
          autoComplete="family-name"
          onSubmitEditing={next('email')}
        />
      </View>
      <FormInput
        {...common}
        name="email"
        label="Email"
        icon="mail"
        placeholder="you@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        onSubmitEditing={next('username')}
      />
      <FormInput
        {...common}
        name="username"
        label="Username"
        icon="user"
        placeholder="Pick a username"
        autoCapitalize="none"
        autoComplete="username-new"
        onSubmitEditing={next('password')}
      />
      <FormInput
        {...common}
        name="password"
        label="Password"
        icon="lock"
        secure
        placeholder="6+ letters and numbers"
        autoCapitalize="none"
        autoComplete="password-new"
        onSubmitEditing={next('confirmPassword')}
        onValueChange={() => {
          // Keep "Passwords do not match" in sync when the first password changes.
          if (formState.touchedFields.confirmPassword) {
            trigger('confirmPassword');
          }
        }}
      />
      <FormInput
        control={control}
        name="confirmPassword"
        label="Confirm password"
        icon="lock"
        secure
        placeholder="Type it again"
        autoCapitalize="none"
        returnKeyType="go"
        onSubmitEditing={submit}
      />

      <FormError message={errorMessage} />
      <AppButton
        title="Create account"
        icon="arrow-right"
        iconPosition="right"
        variant="ink"
        onPress={submit}
        loading={submitting}
      />
      <AuthSwitchLink
        prompt="Already have an account?"
        action="Sign in"
        onPress={onGoToLogin}
      />
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row' },
  half: { flex: 1 },
});
