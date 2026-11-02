export interface OfflineMatchSettings {
  handoverConfirmationEnabled: boolean;
  handoverAutoDismissSeconds: number;
  enableVibration: boolean;
  enableSoundEffects: boolean;
  targetScore: number;
  pointsPerWhite: number;
  pointsPerBlack: number;
  pointsPerQueen: number;
  foulPenaltyPoints: number;
}

export const DEFAULT_OFFLINE_SETTINGS: OfflineMatchSettings = {
  handoverConfirmationEnabled: true,
  handoverAutoDismissSeconds: 3,
  enableVibration: true,
  enableSoundEffects: true,
  targetScore: 25,
  pointsPerWhite: 10,
  pointsPerBlack: 5,
  pointsPerQueen: 25,
  foulPenaltyPoints: 5,
};

