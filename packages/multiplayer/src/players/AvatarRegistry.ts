export interface AvatarInfo {
  id: string;
  emoji: string;
  label: string;
}

export const PREDEFINED_AVATARS: AvatarInfo[] = [
  { id: 'crown', emoji: '👑', label: 'Champion' },
  { id: 'tiger', emoji: '🐯', label: 'Tiger' },
  { id: 'eagle', emoji: '🦅', label: 'Falcon' },
  { id: 'lion', emoji: '🦁', label: 'Lion' },
  { id: 'lightning', emoji: '⚡', label: 'Blitz' },
  { id: 'target', emoji: '🎯', label: 'Sniper' },
  { id: 'diamond', emoji: '💎', label: 'Diamond' },
  { id: 'dragon', emoji: '🐉', label: 'Dragon' },
];

export class AvatarRegistry {
  private static avatarMap: Map<string, AvatarInfo> = new Map(
    PREDEFINED_AVATARS.map((a) => [a.id, a])
  );

  public static getAll(): AvatarInfo[] {
    return [...PREDEFINED_AVATARS];
  }

  public static getById(id: string): AvatarInfo | undefined {
    return this.avatarMap.get(id);
  }

  public static getDefaultAvatar(seatIndex: number): string {
    const avatar = PREDEFINED_AVATARS[seatIndex % PREDEFINED_AVATARS.length];
    return avatar.emoji;
  }
}
