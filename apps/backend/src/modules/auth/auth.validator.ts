import { validateEmail, validatePassword, validateUsername } from '@carromverse/shared-utils';
import { LoginRequestDto, RegisterRequestDto } from './auth.types.js';

export class AuthValidator {
  public static validateLogin(payload: unknown): { isValid: boolean; error?: string; data?: LoginRequestDto } {
    if (!payload || typeof payload !== 'object') {
      return { isValid: false, error: 'Invalid request body' };
    }
    const { email } = payload as Record<string, string>;
    const emailResult = validateEmail(email || '');
    if (!emailResult.isValid) {
      return { isValid: false, error: emailResult.error || 'Valid email address is required' };
    }
    return { isValid: true, data: payload as LoginRequestDto };
  }

  public static validateRegister(payload: unknown): { isValid: boolean; error?: string; data?: RegisterRequestDto } {
    if (!payload || typeof payload !== 'object') {
      return { isValid: false, error: 'Invalid request body' };
    }
    const { email, username, password } = payload as Record<string, string>;
    const emailResult = validateEmail(email || '');
    if (!emailResult.isValid) {
      return { isValid: false, error: emailResult.error || 'Valid email is required' };
    }
    const usernameResult = validateUsername(username || '');
    if (!usernameResult.isValid) {
      return { isValid: false, error: usernameResult.error || 'Valid username is required' };
    }
    if (password) {
      const passwordResult = validatePassword(password);
      if (!passwordResult.isValid) {
        return { isValid: false, error: passwordResult.error || 'Password is invalid' };
      }
    }
    return { isValid: true, data: payload as RegisterRequestDto };
  }
}
