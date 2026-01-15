import { isValidEmail, isValidPassword, validateSignUp } from './validators';

describe('validators', () => {
  test('isValidEmail returns true for valid email and false for invalid', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('bad-email')).toBe(false);
  });

  test('isValidPassword enforces strength', () => {
    expect(isValidPassword('Password1!')).toBe(true);
    expect(isValidPassword('password')).toBe(false);
    expect(isValidPassword('Pass1')).toBe(false);
  });

  test('validateSignUp returns errors for missing/invalid fields', () => {
    const errors = validateSignUp('', 'short', 'diff');
    expect(errors.email).toBeDefined();
    expect(errors.password).toBeDefined();
    expect(errors.confirmPassword).toBeDefined();
  });
});
