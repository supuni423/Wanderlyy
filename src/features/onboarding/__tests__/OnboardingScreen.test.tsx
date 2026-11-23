import { fireEvent, render, screen } from '@testing-library/react-native';
import { ThemeProvider } from '@/theme';
import { OnboardingScreen } from '../screens/OnboardingScreen';

async function renderOnboarding() {
  const onDone = jest.fn();
  await render(
    <ThemeProvider>
      <OnboardingScreen onDone={onDone} />
    </ThemeProvider>,
  );
  return onDone;
}

describe('OnboardingScreen', () => {
  it('starts on the first slide', async () => {
    await renderOnboarding();
    expect(screen.getByLabelText('Page 1 of 3')).toBeTruthy();
  });

  it('lets the user skip the intro', async () => {
    const onDone = await renderOnboarding();
    await fireEvent.press(screen.getByLabelText('Skip intro'));
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it('moves through the slides and finishes on the last one', async () => {
    const onDone = await renderOnboarding();

    await fireEvent.press(screen.getByLabelText('Next slide'));
    expect(screen.getByLabelText('Page 2 of 3')).toBeTruthy();
    await fireEvent.press(screen.getByLabelText('Next slide'));
    expect(screen.getByLabelText('Page 3 of 3')).toBeTruthy();
    expect(onDone).not.toHaveBeenCalled();

    // Last slide: Skip disappears and the button becomes "Let's begin".
    expect(screen.queryByLabelText('Skip intro')).toBeNull();
    await fireEvent.press(screen.getByLabelText("Let's begin"));
    expect(onDone).toHaveBeenCalledTimes(1);
  });
});
