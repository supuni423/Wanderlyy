# Demo video script (target 2:45, limit 3:00)

A plan for recording the Wanderlyy demo so every graded requirement appears
once, in a natural order. Times are cumulative.

## Before recording

- [ ] `.env` has a working `RESTCOUNTRIES_API_KEY`; Metro started with
      `--reset-cache`.
- [ ] Start from a clean app so the intro shows:
      `adb shell pm clear com.wanderlyy` (this also signs out and clears
      favourites).
- [ ] Profile → Appearance is on **System** and the phone is in light mode.
- [ ] Wi-Fi on. Open the emulator's quick settings once so you know where
      **Airplane mode** is (swipe down from the top).
- [ ] Close other notifications; set the emulator volume off.
- [ ] Practise once without recording.

**Record the emulator screen** (stops automatically at 3 minutes):

```bash
adb shell screenrecord --time-limit 180 /sdcard/wanderlyy-demo.mp4
adb pull /sdcard/wanderlyy-demo.mp4
```

Or use Android Studio's emulator **Record screen** button. Add a voice-over
afterwards if you prefer.

## Script

| Time      | Show                                                                                                                                                                                                                                                  | Say (short)                                                                                                             |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| 0:00–0:15 | Launch → splash → swipe the 3 intro slides → **Let's begin**                                                                                                                                                                                          | "Wanderlyy is a travel discovery app. My twist is offline-first."                                                       |
| 0:15–0:35 | Login: tap **Sign in** with empty fields (red Zod errors) → type a wrong password (server error) → **Use it** → **Sign in**                                                                                                                           | "Forms are validated with Zod. Sign-in uses DummyJSON; the token goes to the encrypted Keychain, never AsyncStorage."   |
| 0:35–1:00 | Home: scroll the cards; type "ger" in search; tap the **Europe** chip; **Clear**                                                                                                                                                                      | "250 countries from REST Countries with RTK Query. Debounced search and region filters."                                |
| 1:00–1:25 | Tap **Germany** → details (scroll to neighbours) → tap **Austria** → Back                                                                                                                                                                             | "Details only receive the country code and load the rest. Neighbours open their own pages."                             |
| 1:25–1:45 | Tap the heart on two countries (badge updates) → **Favourites** tab → remove one → **Undo**                                                                                                                                                           | "Favourites are stored in Redux and persisted. Saving one also downloads its page for offline use."                     |
| 1:45–2:20 | Turn on **Airplane mode** → offline banner → Home still works → open a saved favourite (full page, "Saved copy") → open an unsaved country ("Not saved for offline yet") → turn Airplane mode **off** → "Back online" toast; the page loads by itself | "Offline-first: everything seen is saved, nothing is requested offline, and it catches up when the connection returns." |
| 2:20–2:35 | Close the app completely and reopen it                                                                                                                                                                                                                | "The session is restored from the Keychain and favourites are still here."                                              |
| 2:35–2:50 | Profile → Appearance → **Dark** → visit Home → back to **System**                                                                                                                                                                                     | "Bonus: dark mode, saved as a preference."                                                                              |
| 2:50–3:00 | Profile → **Log out** → confirm                                                                                                                                                                                                                       | "Log out clears the Keychain. Thanks for watching."                                                                     |

## If something goes wrong

- **Home shows "API key is missing or invalid":** check `.env`, then restart
  Metro with `--reset-cache`.
- **No intro on launch:** Profile → **Replay the intro**, then restart the
  app, or clear the app data (see above).
- **Over time:** shorten the search part and skip the neighbour hop; keep
  the offline section, it is the twist.
