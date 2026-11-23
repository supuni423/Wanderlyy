import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '@/theme';
import { EntryFlow } from './EntryFlow';

/**
 * Root component. Providers (Redux, persistence, navigation)
 * are added here as each feature is built.
 */
function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <EntryFlow />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

export default App;
