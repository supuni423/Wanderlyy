import { z } from 'zod';

/**
 * Form rules for login and registration, written once with Zod and used
 * by react-hook-form (through zodResolver) and by the unit tests.
 * Inputs are trimmed before they are checked, so stray spaces from the
 * keyboard never cause a confusing error or reach the API.
 */

const USERNAME_PATTERN = /^[a-zA-Z0-9._]+$/;
const NAME_PATTERN = /^[\p{L}][\p{L}\s'-]*$/u;

const requiredText = (message: string) => z.string().trim().min(1, message);

export const loginSchema = z.object({
  username: requiredText('Enter your username').regex(
    /^\S+$/,
    'Usernames cannot contain spaces',
  ),
  // Login only checks that a password was typed: the server decides if it is right.
  password: z.string().min(1, 'Enter your password'),
});

const name = (label: string) =>
  requiredText(`Enter your ${label}`)
    .max(40, `${capitalise(label)} is too long`)
    .regex(NAME_PATTERN, `${capitalise(label)} can only contain letters`);

export const registerSchema = z
  .object({
    firstName: name('first name'),
    lastName: name('last name'),
    email: requiredText('Enter your email').pipe(
      z.email('Enter a valid email address'),
    ),
    username: requiredText('Choose a username')
      .min(3, 'Username must be at least 3 characters')
      .max(20, 'Username must be 20 characters or fewer')
      .regex(
        USERNAME_PATTERN,
        'Use only letters, numbers, dots or underscores',
      ),
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters')
      .max(64, 'Password must be 64 characters or fewer')
      .regex(/[a-zA-Z]/, 'Password needs at least one letter')
      .regex(/\d/, 'Password needs at least one number'),
    confirmPassword: z.string().min(1, 'Type your password again'),
  })
  .refine(values => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;

function capitalise(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
