// Email validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation - at least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 symbol
export const isValidPassword = (password: string): boolean => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

export const getPasswordErrors = (password: string): string[] => {
  const errors: string[] = [];
  if (password.length < 8) errors.push('auth.validation.passwordMinLength');
  if (!/[a-z]/.test(password)) errors.push('auth.validation.passwordLowercase');
  if (!/[A-Z]/.test(password)) errors.push('auth.validation.passwordUppercase');
  if (!/\d/.test(password)) errors.push('auth.validation.passwordNumber');
  if (!/[@$!%*?&]/.test(password)) errors.push('auth.validation.passwordSymbol');
  return errors;
};

// Form validation
export const validateSignUp = (email: string, password: string, confirmPassword: string): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (!email.trim()) {
    errors.email = 'auth.validation.emailRequired';
  } else if (!isValidEmail(email)) {
    errors.email = 'auth.validation.emailInvalid';
  }

  const passwordErrors = getPasswordErrors(password);
  if (passwordErrors.length > 0) {
    errors.password = passwordErrors[0];
  }

  if (password !== confirmPassword) {
    errors.confirmPassword = 'auth.validation.passwordsDontMatch';
  }

  return errors;
};

export const validateLogin = (email: string, password: string): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (!email.trim()) {
    errors.email = 'auth.validation.emailRequired';
  } else if (!isValidEmail(email)) {
    errors.email = 'auth.validation.emailInvalid';
  }

  if (!password.trim()) {
    errors.password = 'auth.validation.passwordRequired';
  }

  return errors;
};
