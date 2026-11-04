export class UsernameValidator {
  private static readonly RESERVED_USERNAMES = new Set([
    'admin',
    'administrator',
    'moderator',
    'mod',
    'carromverse',
    'system',
    'guest',
    'bot',
    'support',
    'null',
    'undefined',
    'anonymous',
    'root',
    'staff',
    'official',
    'security',
    'helpdesk',
    'superuser',
    'server',
    'api',
  ]);

  private static readonly USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;

  /**
   * Validates a username according to CarromVerse specifications.
   */
  public static validate(rawUsername: string | unknown): { isValid: boolean; error?: string; normalized: string } {
    if (!rawUsername || typeof rawUsername !== 'string') {
      return { isValid: false, error: 'Username is required and must be a string.', normalized: '' };
    }

    const trimmed = rawUsername.trim();
    const normalized = trimmed.toLowerCase();

    if (trimmed.length < 3) {
      return { isValid: false, error: 'Username must be at least 3 characters long.', normalized };
    }

    if (trimmed.length > 20) {
      return { isValid: false, error: 'Username cannot exceed 20 characters.', normalized };
    }

    if (!UsernameValidator.USERNAME_REGEX.test(trimmed)) {
      return {
        isValid: false,
        error: 'Username can only contain letters, numbers, and underscores.',
        normalized,
      };
    }

    if (UsernameValidator.RESERVED_USERNAMES.has(normalized)) {
      return {
        isValid: false,
        error: `The username "${trimmed}" is reserved and cannot be chosen.`,
        normalized,
      };
    }

    return { isValid: true, normalized };
  }
}

