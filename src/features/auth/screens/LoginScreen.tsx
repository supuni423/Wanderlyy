import { useRef, useState, type ComponentRef } from 'react';
import { TextInput } from 'react-native';
import { AppButton, AppInput } from '@/components';
import { AuthHeader } from '../components/AuthHeader';
import { AuthLayout } from '../components/AuthLayout';
import { AuthSwitchLink } from '../components/AuthSwitchLink';
import { DemoAccountNote } from '../components/DemoAccountNote';
import { DEMO_ACCOUNT } from '../demoAccount';
import type { LoginValues } from '../types';

export interface LoginScreenProps {
  onSubmit: (values: LoginValues) => void;
  onGoToRegister: () => void;
  submitting?: boolean;
}

export function LoginScreen({
  onSubmit,
  onGoToRegister,
  submitting = false,
}: LoginScreenProps) {
  const [values, setValues] = useState<LoginValues>({
    username: '',
    password: '',
  });
  const passwordRef = useRef<ComponentRef<typeof TextInput>>(null);

  const set = (field: keyof LoginValues) => (text: string) =>
    setValues(v => ({ ...v, [field]: text }));

  const submit = () => onSubmit(values);

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

      <DemoAccountNote onUse={() => setValues({ ...DEMO_ACCOUNT })} />

      <AppInput
        label="Username"
        icon="user"
        placeholder="Your username"
        value={values.username}
        onChangeText={set('username')}
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="username"
        textContentType="username"
        returnKeyType="next"
        submitBehavior="submit"
        onSubmitEditing={() => passwordRef.current?.focus()}
      />
      <AppInput
        ref={passwordRef}
        label="Password"
        icon="lock"
        secure
        placeholder="Your password"
        value={values.password}
        onChangeText={set('password')}
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
