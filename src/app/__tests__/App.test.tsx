import { render, screen } from '@testing-library/react-native';
import App from '@/app/App';

test('renders the app name', async () => {
  await render(<App />);
  expect(screen.getByText('Wanderlyy')).toBeTruthy();
});
