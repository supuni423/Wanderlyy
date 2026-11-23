import { loginSchema, registerSchema } from '../validation';

/** First error message for each field, so tests read like the UI. */
function errorsOf(result: {
  success: boolean;
  error?: { issues: { path: PropertyKey[]; message: string }[] };
}) {
  const errors: Record<string, string> = {};
  for (const issue of result.error?.issues ?? []) {
    const field = String(issue.path[0]);
    errors[field] ??= issue.message;
  }
  return errors;
}

describe('loginSchema', () => {
  it('accepts the demo account', () => {
    const result = loginSchema.safeParse({
      username: 'emilys',
      password: 'emilyspass',
    });
    expect(result.success).toBe(true);
  });

  it('requires both fields', () => {
    const result = loginSchema.safeParse({ username: '', password: '' });
    expect(errorsOf(result)).toEqual({
      username: 'Enter your username',
      password: 'Enter your password',
    });
  });

  it('trims spaces around the username', () => {
    const result = loginSchema.safeParse({
      username: '  emilys ',
      password: 'emilyspass',
    });
    expect(result.success && result.data.username).toBe('emilys');
  });

  it('treats a username of only spaces as empty', () => {
    const result = loginSchema.safeParse({ username: '   ', password: 'x' });
    expect(errorsOf(result).username).toBe('Enter your username');
  });

  it('rejects spaces inside the username', () => {
    const result = loginSchema.safeParse({
      username: 'emily s',
      password: 'emilyspass',
    });
    expect(errorsOf(result).username).toBe('Usernames cannot contain spaces');
  });
});

describe('registerSchema', () => {
  const valid = {
    firstName: 'Ada',
    lastName: 'Lovelace',
    email: 'ada@example.com',
    username: 'ada_l',
    password: 'engine42',
    confirmPassword: 'engine42',
  };

  it('accepts a complete, valid form', () => {
    expect(registerSchema.safeParse(valid).success).toBe(true);
  });

  it('accepts names with accents, hyphens and apostrophes', () => {
    const result = registerSchema.safeParse({
      ...valid,
      firstName: 'Zoë-Anne',
      lastName: "O'Brien",
    });
    expect(result.success).toBe(true);
  });

  it('rejects names with numbers', () => {
    const result = registerSchema.safeParse({ ...valid, firstName: 'A1' });
    expect(errorsOf(result).firstName).toBe(
      'First name can only contain letters',
    );
  });

  it('rejects an invalid email', () => {
    const result = registerSchema.safeParse({ ...valid, email: 'ada@' });
    expect(errorsOf(result).email).toBe('Enter a valid email address');
  });

  it.each([
    ['ab', 'Username must be at least 3 characters'],
    ['a'.repeat(21), 'Username must be 20 characters or fewer'],
    ['ada!', 'Use only letters, numbers, dots or underscores'],
  ])('rejects the username "%s"', (username, message) => {
    const result = registerSchema.safeParse({ ...valid, username });
    expect(errorsOf(result).username).toBe(message);
  });

  it.each([
    ['abc1', 'Password must be at least 6 characters'],
    ['abcdefgh', 'Password needs at least one number'],
    ['12345678', 'Password needs at least one letter'],
  ])('rejects the weak password "%s"', (password, message) => {
    const result = registerSchema.safeParse({
      ...valid,
      password,
      confirmPassword: password,
    });
    expect(errorsOf(result).password).toBe(message);
  });

  it('shows the mismatch on the confirm field', () => {
    const result = registerSchema.safeParse({
      ...valid,
      confirmPassword: 'engine43',
    });
    expect(errorsOf(result)).toEqual({
      confirmPassword: 'Passwords do not match',
    });
  });
});
