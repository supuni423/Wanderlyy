import { useMemo } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAppSelector } from '@/app/hooks';
import { selectAuthStatus } from '@/features/auth';
import { useTheme } from '@/theme';
import { AuthNavigator } from './AuthNavigator';
import { MainTabs } from './MainTabs';
import { toNavigationTheme } from './navigationTheme';
import type { RootStackParamList } from './types';

const Root = createNativeStackNavigator<RootStackParamList>();

/**
 * Auth flow: only one branch is registered at a time, chosen from the
 * auth slice. Signing in or out swaps the branch, so the Back button can
 * never return to a screen from the other side.
 */
export function RootNavigator() {
  const theme = useTheme();
  const navigationTheme = useMemo(() => toNavigationTheme(theme), [theme]);
  const isSignedIn = useAppSelector(selectAuthStatus) === 'authenticated';

  return (
    <NavigationContainer theme={navigationTheme}>
      <Root.Navigator screenOptions={{ headerShown: false }}>
        {isSignedIn ? (
          <Root.Screen name="Main" component={MainTabs} />
        ) : (
          <Root.Screen
            name="Auth"
            component={AuthNavigator}
            // Slide the login screen in like going "back" when signing out.
            options={{ animationTypeForReplace: 'pop' }}
          />
        )}
      </Root.Navigator>
    </NavigationContainer>
  );
}
