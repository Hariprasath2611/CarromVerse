import crypto from 'crypto';

/**
 * Service for generating, validating, and normalizing human-friendly room codes.
 *
 * Design:
 * - 6-character length
 * - Excludes ambiguous characters (0, O, 1, I, L)
 * - 31-character alphabet: 23456789ABCDEFGHJKMNPQRSTUVWXYZ
 * - Case-insensitive lookup (normalized to uppercase)
 * - 31^6 = 887,503,681 distinct combinations
 */
export class RoomCodeService {
  private static readonly ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
  private static readonly CODE_LENGTH = 6;
  private static readonly CODE_REGEX = /^[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{6}$/;

  /**
   * Generates a random, non-sequential 6-character room code.
   */
  public static generateCode(): string {
    const randomBytes = crypto.randomBytes(this.CODE_LENGTH);
    let code = '';
    for (let i = 0; i < this.CODE_LENGTH; i++) {
      const index = randomBytes[i] % this.ALPHABET.length;
      code += this.ALPHABET[index];
    }
    return code;
  }

  /**
   * Normalizes a user-input room code:
   * - Trims whitespace
   * - Strips hyphens and separators
   * - Replaces common ambiguous character confusions (e.g. '0' -> 'O' mapped to allowed equivalents if needed, or simply uppercases)
   * - Converts to uppercase
   */
  public static normalizeCode(rawCode: string): string {
    if (!rawCode || typeof rawCode !== 'string') return '';
    return rawCode
      .trim()
      .replace(/[\s\-_]/g, '')
      .toUpperCase();
  }

  /**
   * Validates whether a normalized code satisfies length and alphabet constraints.
   */
  public static isValidCode(code: string): boolean {
    const normalized = this.normalizeCode(code);
    return this.CODE_REGEX.test(normalized);
  }
}

