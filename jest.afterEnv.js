/* eslint-env jest */
// Tests must never hit the real network (or spend the real REST Countries
// quota). Each test starts with a fresh fetch that fails as if offline;
// tests mock exactly the responses they need on top of it.
beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.reject(new TypeError('Network request failed (tests are offline)')),
  );
});

// RTK Query keeps unused data for an hour using setTimeout. In tests that
// timer would keep Jest running after the last test, so timers are
// "unref'd": they still fire normally but never block Jest from exiting.
const realSetTimeout = global.setTimeout;
global.setTimeout = (...args) => {
  const timer = realSetTimeout(...args);
  timer?.unref?.();
  return timer;
};
