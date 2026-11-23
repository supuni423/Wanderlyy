import {
  createEntityAdapter,
  createSlice,
  type EntityState,
  type PayloadAction,
} from '@reduxjs/toolkit';
import type { CountrySummary } from '@/features/countries';

/**
 * A saved country. The whole summary is stored (not just the code), so
 * the Favourites tab can show flags and names even when offline.
 */
export interface FavouriteCountry extends CountrySummary {
  /** When it was saved (ms since epoch); newest favourites come first. */
  savedAt: number;
}

const adapter = createEntityAdapter<FavouriteCountry, string>({
  selectId: country => country.code,
  sortComparer: (a, b) => b.savedAt - a.savedAt,
});

export type FavouritesState = EntityState<FavouriteCountry, string>;

const favouritesSlice = createSlice({
  name: 'favourites',
  initialState: adapter.getInitialState(),
  reducers: {
    /** Saves the country, or removes it if it is already saved. */
    toggleFavourite: {
      reducer(state, action: PayloadAction<FavouriteCountry>) {
        if (state.entities[action.payload.code]) {
          adapter.removeOne(state, action.payload.code);
        } else {
          adapter.addOne(state, action.payload);
        }
      },
      // The timestamp is added here so the reducer itself stays pure.
      prepare(country: CountrySummary) {
        return { payload: { ...country, savedAt: Date.now() } };
      },
    },
    removeFavourite(state, action: PayloadAction<string>) {
      adapter.removeOne(state, action.payload);
    },
    clearFavourites(state) {
      adapter.removeAll(state);
    },
  },
});

export const { toggleFavourite, removeFavourite, clearFavourites } =
  favouritesSlice.actions;
export const favouritesReducer = favouritesSlice.reducer;

type WithFavourites = { favourites: FavouritesState };

const selectors = adapter.getSelectors<WithFavourites>(
  state => state.favourites,
);

/** All favourites, newest first. */
export const selectFavourites = selectors.selectAll;
export const selectFavouriteCount = selectors.selectTotal;
export const selectIsFavourite = (state: WithFavourites, code: string) =>
  state.favourites.entities[code] !== undefined;
