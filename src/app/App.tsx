import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '@/theme';
import { EntryFlow } from './EntryFlow';
import { store as defaultStore, type AppStore } from './store';

/**
 * Root component. Providers (Redux, persistence, navigation)
 * are added here as each feature is built.
 */
function App({ store = defaultStore }: { store?: AppStore }) {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <ThemeProvider>
          <EntryFlow />
        </ThemeProvider>
      </SafeAreaProvider>
    </Provider>
  );
}

export default App;
