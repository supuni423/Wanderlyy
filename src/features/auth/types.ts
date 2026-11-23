/** Values the login form collects. */
export interface LoginValues {
  username: string;
  password: string;
}

/** Values the registration form collects (sent to DummyJSON /users/add). */
export interface RegisterValues {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}
