import { useRef, useState, type ComponentRef } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { AppButton, AppInput } from '@/components';
import { useTheme } from '@/theme';
import { AuthHeader } from '../components/AuthHeader';
import { AuthLayout } from '../components/AuthLayout';
import { AuthSwitchLink } from '../components/AuthSwitchLink';
import type { RegisterValues } from '../types';

export interface RegisterScreenProps {
  onSubmit: (values: RegisterValues) => void;
  onGoToLogin: () => void;
  submitting?: boolean;
}

type Field = keyof RegisterValues;
type InputRef = ComponentRef<typeof TextInput>;

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
}: RegisterScreenProps) {
  const { spacing } = useTheme();
  const [values, setValues] = useState<RegisterValues>(EMPTY);

  // One ref per field so "next" on the keyboard moves down the form.
  const refs = {
    lastName: useRef<InputRef>(null),
    email: useRef<InputRef>(null),
    username: useRef<InputRef>(null),
    password: useRef<InputRef>(null),
    confirmPassword: useRef<InputRef>(null),
  };
  const focus = (field: keyof typeof refs) => () =>
    refs[field].current?.focus();

  const set = (field: Field) => (text: string) =>
    setValues(v => ({ ...v, [field]: text }));

  const submit = () => onSubmit(values);

  const common = {
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
        <AppInput
          {...common}
          containerStyle={styles.half}
          label="First name"
          placeholder="Emily"
          value={values.firstName}
          onChangeText={set('firstName')}
          autoCapitalize="words"
          autoComplete="given-name"
          onSubmitEditing={focus('lastName')}
        />
        <AppInput
          {...common}
          ref={refs.lastName}
          containerStyle={styles.half}
          label="Last name"
          placeholder="Johnson"
          value={values.lastName}
          onChangeText={set('lastName')}
          autoCapitalize="words"
          autoComplete="family-name"
          onSubmitEditing={focus('email')}
        />
      </View>
      <AppInput
        {...common}
        ref={refs.email}
        label="Email"
        icon="mail"
        placeholder="you@example.com"
        value={values.email}
        onChangeText={set('email')}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        onSubmitEditing={focus('username')}
      />
      <AppInput
        {...common}
        ref={refs.username}
        label="Username"
        icon="user"
        placeholder="Pick a username"
        value={values.username}
        onChangeText={set('username')}
        autoCapitalize="none"
        autoComplete="username-new"
        onSubmitEditing={focus('password')}
      />
      <AppInput
        {...common}
        ref={refs.password}
        label="Password"
        icon="lock"
        secure
        placeholder="At least 6 characters"
        value={values.password}
        onChangeText={set('password')}
        autoCapitalize="none"
        autoComplete="password-new"
        onSubmitEditing={focus('confirmPassword')}
      />
      <AppInput
        ref={refs.confirmPassword}
        label="Confirm password"
        icon="lock"
        secure
        placeholder="Type it again"
        value={values.confirmPassword}
        onChangeText={set('confirmPassword')}
        autoCapitalize="none"
        returnKeyType="go"
        onSubmitEditing={submit}
      />

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
