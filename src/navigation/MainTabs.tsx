import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  Feather,
  type FeatherIconName,
} from '@react-native-vector-icons/feather/static';
import { CountryDetailsScreen, HomeScreen } from '@/features/countries';
import { FavouritesScreen, selectFavouriteCount } from '@/features/favourites';
import { useAppSelector } from '@/app/hooks';
import { ProfileScreen } from '@/features/settings';
import { useTheme } from '@/theme';
import { stackScreenOptions } from './navigationTheme';
import type {
  FavouritesStackParamList,
  HomeStackParamList,
  MainTabParamList,
} from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const FavouritesStack = createNativeStackNavigator<FavouritesStackParamList>();

const DETAILS_OPTIONS = { title: 'Country' };

function HomeStackNavigator() {
  const theme = useTheme();
  return (
    <HomeStack.Navigator screenOptions={stackScreenOptions(theme)}>
      <HomeStack.Screen
        name="Countries"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <HomeStack.Screen
        name="CountryDetails"
        component={CountryDetailsScreen}
        options={DETAILS_OPTIONS}
      />
    </HomeStack.Navigator>
  );
}

function FavouritesStackNavigator() {
  const theme = useTheme();
  return (
    <FavouritesStack.Navigator screenOptions={stackScreenOptions(theme)}>
      <FavouritesStack.Screen
        name="Favourites"
        component={FavouritesScreen}
        options={{ headerShown: false }}
      />
      {/* Same details screen, so opening a favourite stays in this tab. */}
      <FavouritesStack.Screen
        name="CountryDetails"
        component={CountryDetailsScreen}
        options={DETAILS_OPTIONS}
      />
    </FavouritesStack.Navigator>
  );
}

/** Tab icon renderers, created once (not on every render). */
const tabIcon =
  (name: FeatherIconName) =>
  ({ color, size }: { color: string; size: number }) =>
    <Feather name={name} size={size} color={color} />;

const TAB_ICONS = {
  HomeTab: tabIcon('compass'),
  FavouritesTab: tabIcon('heart'),
  ProfileTab: tabIcon('user'),
} satisfies Record<keyof MainTabParamList, unknown>;

/** Signed-in area: Home, Favourites and Profile tabs. */
export function MainTabs() {
  const { colors, touchTarget } = useTheme();
  const favouriteCount = useAppSelector(selectFavouriteCount);
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        tabBarItemStyle: { minHeight: touchTarget },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
        tabBarIcon: TAB_ICONS[route.name],
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackNavigator}
        options={{ title: 'Home' }}
      />
      <Tab.Screen
        name="FavouritesTab"
        component={FavouritesStackNavigator}
        options={{
          title: 'Favourites',
          tabBarBadge: favouriteCount > 0 ? favouriteCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: colors.primary,
            color: colors.onPrimary,
          },
          tabBarAccessibilityLabel:
            favouriteCount > 0
              ? `Favourites, ${favouriteCount} saved`
              : 'Favourites',
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
}
