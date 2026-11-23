/**
 * Favourites feature: Redux slice, persistence and the Favourites (wishlist) screen.
 */
export { FavouritesScreen } from './screens/FavouritesScreen';
export { FavouriteButton } from './components/FavouriteButton';
export {
  clearFavourites,
  favouritesReducer,
  removeFavourite,
  restoreFavourite,
  selectFavouriteCount,
  selectFavourites,
  selectIsFavourite,
  toggleFavourite,
  type FavouriteCountry,
  type FavouritesState,
} from './favouritesSlice';
