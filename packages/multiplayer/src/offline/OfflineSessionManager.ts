import { GameMode, Player, PlayerSeat } from '@carromverse/shared-types';
import { PlayerSetup } from '../players/PlayerSetup.js';
import { PartnerValidator } from '../teams/PartnerValidator.js';
import { SeatManager } from './SeatManager.js';
import { DEFAULT_OFFLINE_SETTINGS, OfflineMatchSettings } from './OfflineConfig.js';
import { HandoverPrompt, PassAndPlayManager } from './PassAndPlayManager.js';

export class OfflineSessionManager {
  private mode: GameMode;
  private players: Player[] = [];
  private currentSeatIndex = 0;
  private settings: OfflineMatchSettings;
  private passAndPlay: PassAndPlayManager;

  constructor(
    mode: GameMode = 'two_player_individual',
    settings: Partial<OfflineMatchSettings> = {}
  ) {
    this.mode = mode;
    this.settings = { ...DEFAULT_OFFLINE_SETTINGS, ...settings };
    this.passAndPlay = new PassAndPlayManager(this.settings.handoverConfirmationEnabled);
    this.initPlayers();
  }

  public initPlayers(options?: {
    customNames?: Record<number, string>;
    customAvatars?: Record<number, string>;
    teamAName?: string;
    teamBName?: string;
  }): void {
    this.players = PlayerSetup.createInitialPlayersForMode(this.mode, options);
    this.currentSeatIndex = 0;
  }

  public validate(): { isValid: boolean; error?: string } {
    return PartnerValidator.validate(this.mode, this.players);
  }

  public getPlayers(): Player[] {
    return [...this.players];
  }

  public getCurrentPlayer(): Player {
    return this.players[this.currentSeatIndex];
  }

  public getPlayerBySeat(seat: PlayerSeat): Player | undefined {
    return this.players.find((p) => p.seat === seat);
  }

  public advanceTurn(): { nextPlayer: Player; handover?: HandoverPrompt } {
    const fromPlayer = this.getCurrentPlayer();
    this.currentSeatIndex = (this.currentSeatIndex + 1) % this.players.length;
    const nextPlayer = this.getCurrentPlayer();

    let handover: HandoverPrompt | undefined;
    if (this.passAndPlay.isConfirmationRequired()) {
      handover = this.passAndPlay.createHandoverPrompt(fromPlayer, nextPlayer);
    }

    return { nextPlayer, handover };
  }

  public getSettings(): OfflineMatchSettings {
    return { ...this.settings };
  }

  public updateSettings(settings: Partial<OfflineMatchSettings>): void {
    this.settings = { ...this.settings, ...settings };
    if (settings.handoverConfirmationEnabled !== undefined) {
      this.passAndPlay.setConfirmationRequired(settings.handoverConfirmationEnabled);
    }
  }
}
