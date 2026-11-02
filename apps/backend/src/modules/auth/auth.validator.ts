import { validateEmail, validatePassword, validateUsername } from '@carromverse/shared-utils';
import { LoginRequestDto, RegisterRequestDto } from './auth.types.js';

export class AuthValidator {
  public static validateLogin(payload: unknown): { isValid: boolean; error?: string; data?: LoginRequestDto } {
    if (!payload || typeof payload !== 'object') {
      return { isValid: false, error: 'Invalid request body' };
    }
    const { email } = payload as Record<string, string>;
    if (!email || !validateEmail(email)) {
      return { isValid: false, error: 'Valid email address is required' };
    }
    return { isValid: true, data: payload as LoginRequestDto };
  }

  public static validateRegister(payload: unknown): { isValid: boolean; error?: string; data?: RegisterRequestDto } {
    if (!payload || typeof payload !== 'object') {
      return { isValid: false, error: 'Invalid request body' };
    }
    const { email, username, password } = payload as Record<string, string>;
    if (!email || !validateEmail(email)) {
      return { isValid: false, error: 'Valid email is required' };
    }
    if (!username || !validateUsername(username)) {
      return { isValid: false, error: 'Valid username (3-20 alphanumeric characters) is required' };
    }
    if (password && !validatePassword(password)) {
      return { isValid: false, error: 'Password must be at least 6 characters' };
    }
    return { isValid: true, data: payload as RegisterRequestDto };
  }
}
