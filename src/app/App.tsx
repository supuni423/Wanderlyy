import type { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import type { Persistor } from 'redux-persist';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SplashScreen } from '@/features/onboarding';
import { ThemeProvider } from '@/theme';
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
 * Root component: Redux, saved-state restore, safe area and theme.
 * PersistGate keeps the splash up until favourites and the profile
 * have been read back from AsyncStorage.
 */
function App({
  store = app.store,
  persistor = store === app.store ? app.persistor : undefined,
}: AppProps) {
  const content: ReactNode = (
    <SafeAreaProvider>
      <ThemeProvider>
        <EntryFlow />
      </ThemeProvider>
    </SafeAreaProvider>
  );

  return (
    <Provider store={store}>
      {persistor ? (
        <PersistGate persistor={persistor} loading={<SplashScreen />}>
          {content}
        </PersistGate>
      ) : (
        content
      )}
    </Provider>
  );
}

export default App;
