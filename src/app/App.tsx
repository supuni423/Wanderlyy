import type { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import type { Persistor } from 'redux-persist';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SplashScreen } from '@/features/onboarding';
import { AppThemeProvider } from '@/features/settings/AppThemeProvider';
import { EntryFlow } from './EntryFlow';
import type { Store } from '@reduxjs/toolkit';
import { makePersistedStore } from './store';

// Created once for the running app. Tests pass their own store instead.
const app = makePersistedStore();

interface AppProps {
  /** Defaults to the app's persisted store; tests pass an in-memory one. */
  store?: Store;
  /** Only given together with the app's own persisted store. */
  persistor?: Persistor;
}

/**
 * Root component: Redux, theme (light/dark), saved-state restore and
 * safe area.
 * PersistGate keeps the splash up until favourites and the profile
 * have been read back from AsyncStorage.
 */
function App({
  store = app.store,
  persistor = store === app.store ? app.persistor : undefined,
}: AppProps) {
  const content: ReactNode = (
    <SafeAreaProvider>
      <EntryFlow />
    </SafeAreaProvider>
  );

  // The theme sits outside PersistGate so even the loading splash uses
  // the right colours (before the saved preference loads it follows the
  // phone's setting).
  return (
    <Provider store={store}>
      <AppThemeProvider>
        {persistor ? (
          <PersistGate persistor={persistor} loading={<SplashScreen />}>
            {content}
          </PersistGate>
        ) : (
          content
        )}
      </AppThemeProvider>
    </Provider>
  );
}

export default App;
