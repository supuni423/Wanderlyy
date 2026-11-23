# AI usage

This file declares how AI was used to build Wanderlyy, as required by the
assignment.

## Tool

- **Claude Code** (Anthropic), used inside VS Code on Windows.

## How I used it

I used Claude Code as a pair programmer throughout the project:

- **Planning.** It helped me turn the assignment brief into a plan for my
  index (Travel & Countries + Offline-first) and a written guide. I chose the
  app name (Wanderlyy), the 25-commit roadmap and its commit messages, and
  the visual style (a travel-journal design reference I found).
- **Writing code.** For each roadmap commit it wrote the code, tests and
  commit message, ran `npm run verify`, and checked the result on the Android
  emulator with screenshots. I reviewed each step, tried the app myself on
  the emulator, and decided when to continue.
- **Decisions that were mine.** Which design to follow, using REST Countries
  v5 with my own free API key, rewriting commit history only when I approved
  it, and how to fix a commit that broke a test.

All code was run, tested and checked on a real emulator before each commit.

## Corrections of AI output

These are real cases where the AI's output, or its first plan, was wrong and
had to be corrected. Each one was caught by testing, by running the app, or
by checking a live API.

### 1. Tokens would have been stored with the profile

The first version of the login code in the AI's guide spread the whole login
response into the Redux state. That would have put the access and refresh
tokens in Redux, and later in AsyncStorage through redux-persist. It was
changed so `toUser()` copies only the profile fields. Tests now scan the
whole store and all of AsyncStorage to prove no token is there.

### 2. The planned API no longer existed

The plan was built on REST Countries **v3.1**. When the API was checked live
(commit 12), every v1–v4 endpoint returned "This API version has been
deprecated". The integration was rebuilt for **v5**, which needs an API key
and has a different response shape. A real record from the live API was
saved as a test fixture to make sure the mapping is correct.

### 3. The app compiled in tests but not on the phone

After adding Zod 4 (commit 8), all tests and the type check passed, but the
app showed "Failed to compile" on the emulator: Zod uses a JavaScript export
syntax that React Native's Babel setup does not handle. The fix was adding
the Babel 7 version of `@babel/plugin-transform-export-namespace-from` (the
newest version needed Babel 8). Lesson: passing tests are not enough; the app
must be run.

### 4. A rounding bug in a formatting helper

The AI's `formatCompact` showed 999,950 as "999,950" instead of "1M". A unit
test caught it and the logic was fixed.

### 5. A built-in feature wasted the request quota

For automatic refresh on reconnection (commit 22), the AI first used RTK
Query's `refetchOnReconnect` and wrote a code comment saying it only
refreshed stale data. On the emulator a refresh spinner appeared after
reconnecting, so the requests were measured in a test: it re-downloaded the
whole country list (3 requests) on every reconnect, even when the data was a
minute old. The comment was wrong. It was replaced with a "refresh only data
older than 30 minutes" rule, and tests now prove fresh data costs no extra
requests.

### 6. A commit was pushed with a failing test

Commit 15 was committed even though one test failed, because the commit
command did not depend on the test run passing. The failing test also
revealed a real problem: when the details request failed offline, the screen
threw away the country data it already had. With my approval, the commit was
fixed (the screen now keeps the flag and stats and shows the error only
in the facts area) and replaced on GitHub. From then on every commit ran only
after `npm run verify` passed.

### 7. Smaller corrections

- **Hidden characters:** a regex for removing accents was saved with
  invisible Unicode characters instead of readable escapes; it was replaced
  with the readable `\p{M}`.
- **Oversized images:** the first onboarding layout made the photos far too
  big; it was found on an emulator screenshot and fixed by measuring the
  available space.
- **Test mistakes:** several first versions of tests were wrong (a loading
  state checked after the data had already arrived, a mocked clock that the
  library did not use, a reused mock response that broke once favourites
  started downloading pages). Each was found by running the tests and fixed.

## Safety checks

- My REST Countries API key was once saved into `.env.example` (a committed
  file) by mistake. It was caught before the commit, the file was restored,
  and a test now fails if a real key ever appears there. The key itself is
  only in the git-ignored `.env`.
- Tests never call the real network or use the real key.

## What I learned

- Check AI suggestions against the real API and the real device, not only
  against tests.
- Measure before trusting a claim, even one written in a code comment.
- Small, verified commits make mistakes easy to find and fix.
