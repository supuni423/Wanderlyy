/* eslint-env jest, node */
// Plain JS on purpose: this test reads a file from disk with Node's fs,
// and the app's TypeScript setup has no Node types.
const { readFileSync } = require('fs');
const { join } = require('path');

/**
 * .env.example is committed to GitHub, so it must only ever be a template.
 * This fails the test run if a real key is pasted into it by mistake
 * (the real key belongs in the git-ignored .env).
 */
describe('.env.example', () => {
  it('does not contain a real API key', () => {
    const file = readFileSync(join(__dirname, '../../../.env.example'), 'utf8');
    const line = file
      .split(/\r?\n/)
      .find(l => l.startsWith('RESTCOUNTRIES_API_KEY='));

    expect(line).toBe('RESTCOUNTRIES_API_KEY=');
    expect(file).not.toMatch(/rc_live_\w+/);
  });
});
