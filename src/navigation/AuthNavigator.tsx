import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginRoute, RegisterRoute } from '@/features/auth';
import type { AuthStackParamList } from './types';

const Stack = createNativeStackNavigator<AuthStackParamList>();

/** Signed-out screens. The forms draw their own headers. */
export function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginRoute} />
      <Stack.Screen name="Register" component={RegisterRoute} />
    </Stack.Navigator>
  );
}
