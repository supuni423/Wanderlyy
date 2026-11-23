import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AppButton } from '@/components';
import { AuthHeader } from '../components/AuthHeader';
import { AuthLayout } from '../components/AuthLayout';
import { AuthSwitchLink } from '../components/AuthSwitchLink';
import { DemoAccountNote } from '../components/DemoAccountNote';
import { FormInput } from '../components/FormInput';
import { DEMO_ACCOUNT } from '../demoAccount';
import { loginSchema, type LoginValues } from '../validation';

export interface LoginScreenProps {
  /** Only called with values that passed validation (already trimmed). */
  onSubmit: (values: LoginValues) => void;
  onGoToRegister: () => void;
  submitting?: boolean;
}

export function LoginScreen({
  onSubmit,
  onGoToRegister,
  submitting = false,
}: LoginScreenProps) {
  const { control, handleSubmit, reset, setFocus } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' },
    // Errors appear once a field is left, then update while typing.
    mode: 'onTouched',
  });

  // Called without the native event: handleSubmit expects a web-style event.
  const submit = () => handleSubmit(onSubmit)();

  return (
    <AuthLayout>
      <AuthHeader
        photo={require('@/assets/images/onboarding/paris.jpg')}
        caption="Paris"
        chip="Next stop?"
        icon="compass"
        accent="primary"
        title="Welcome"
        highlight="back"
        subtitle="Sign in to keep exploring the world."
      />

      <DemoAccountNote onUse={() => reset({ ...DEMO_ACCOUNT })} />

      <FormInput
        control={control}
        name="username"
        label="Username"
        icon="user"
        placeholder="Your username"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="username"
        textContentType="username"
        returnKeyType="next"
        submitBehavior="submit"
        onSubmitEditing={() => setFocus('password')}
      />
      <FormInput
        control={control}
        name="password"
        label="Password"
        icon="lock"
        secure
        placeholder="Your password"
        autoCapitalize="none"
        autoComplete="password"
        textContentType="password"
        returnKeyType="go"
        onSubmitEditing={submit}
      />

      <AppButton
        title="Sign in"
        icon="arrow-right"
        iconPosition="right"
        variant="ink"
        onPress={submit}
        loading={submitting}
      />
      <AuthSwitchLink
        prompt="New to Wanderlyy?"
        action="Create account"
        onPress={onGoToRegister}
      />
    </AuthLayout>
  );
}
