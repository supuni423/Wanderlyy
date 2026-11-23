import type {
  CompositeScreenProps,
  NavigatorScreenParams,
} from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

/**
 * Every route and its params in one place. TypeScript then checks each
 * navigate() call and each screen's route.params.
 *
 * Root (native stack, picked by auth status)
 * ├─ Auth (native stack): Login, Register
 * └─ Main (bottom tabs)
 *    ├─ HomeTab (native stack): Countries -> CountryDetails
 *    ├─ FavouritesTab (native stack): Favourites -> CountryDetails
 *    └─ ProfileTab: Profile
 */

/** The details screen only receives an ID and loads the rest itself. */
export type CountryDetailsParams = {
  /** ISO 3166-1 alpha-3 code, e.g. "JPN". */
  code: string;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type HomeStackParamList = {
  Countries: undefined;
  CountryDetails: CountryDetailsParams;
};

export type FavouritesStackParamList = {
  Favourites: undefined;
  CountryDetails: CountryDetailsParams;
};

export type MainTabParamList = {
  HomeTab: NavigatorScreenParams<HomeStackParamList>;
  FavouritesTab: NavigatorScreenParams<FavouritesStackParamList>;
  ProfileTab: undefined;
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
};

// Screen prop helpers: each one also knows about its parent navigators,
// so e.g. a Favourites screen can type-safely jump to the Home tab.

export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

export type AuthStackScreenProps<T extends keyof AuthStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<AuthStackParamList, T>,
    RootStackScreenProps<'Auth'>
  >;

export type MainTabScreenProps<T extends keyof MainTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, T>,
    RootStackScreenProps<'Main'>
  >;

export type HomeStackScreenProps<T extends keyof HomeStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<HomeStackParamList, T>,
    MainTabScreenProps<'HomeTab'>
  >;

export type FavouritesStackScreenProps<
  T extends keyof FavouritesStackParamList,
> = CompositeScreenProps<
  NativeStackScreenProps<FavouritesStackParamList, T>,
  MainTabScreenProps<'FavouritesTab'>
>;

// Makes useNavigation() typed everywhere without passing generics.
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
