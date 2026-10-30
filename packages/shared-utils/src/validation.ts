/**
 * Validation utilities for user inputs and game configurations.
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export function validateEmail(email: string): ValidationResult {
  if (!email || email.trim().length === 0) {
    return { isValid: false, error: 'Email address is required.' };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return { isValid: false, error: 'Please enter a valid email address.' };
  }
  return { isValid: true };
}

export function validatePassword(password: string): ValidationResult {
  if (!password) {
    return { isValid: false, error: 'Password is required.' };
  }
  if (password.length < 6) {
    return { isValid: false, error: 'Password must be at least 6 characters long.' };
  }
  return { isValid: true };
}

export function validateUsername(username: string): ValidationResult {
  if (!username || username.trim().length === 0) {
    return { isValid: false, error: 'Username is required.' };
  }
  const trimmed = username.trim();
  if (trimmed.length < 3) {
    return { isValid: false, error: 'Username must be at least 3 characters.' };
  }
  if (trimmed.length > 20) {
    return { isValid: false, error: 'Username cannot exceed 20 characters.' };
  }
  const usernameRegex = /^[a-zA-Z0-9_]+$/;
  if (!usernameRegex.test(trimmed)) {
    return { isValid: false, error: 'Username can only contain letters, numbers, and underscores.' };
  }
  return { isValid: true };
}

