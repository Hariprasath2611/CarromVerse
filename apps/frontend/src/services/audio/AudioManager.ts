import { LocalStorageService } from '../storage/localStorageService';
import { GameSettings, DEFAULT_GAME_SETTINGS } from '@carromverse/shared-types';

export type SoundEffectType =
  | 'STRIKER_PLACE'
  | 'STRIKER_SHOOT'
  | 'STRIker_COLLISION'
  | 'COIN_COLLISION'
  | 'CUSHION_HIT'
  | 'COIN_POCKET'
  | 'QUEEN_POCKET'
  | 'FOUL'
  | 'TURN_CHANGE'
  | 'HANDOVER'
  | 'BUTTON_CLICK'
  | 'MATCH_START'
  | 'VICTORY'
  | 'DEFEAT'
  | 'MATCH_COMPLETE';

export type MusicTrackType = 'home' | 'lobby' | 'gameplay' | 'victory' | 'none';

export interface AudioConfig {
  soundEnabled: boolean;
  soundVolume: number; // 0.0 to 1.0
  musicEnabled: boolean;
  musicVolume: number; // 0.0 to 1.0
}

export class AudioManager {
  private static instance: AudioManager | null = null;
  private soundEnabled = true;
  private soundVolume = 0.8;
  private musicEnabled = false;
  private musicVolume = 0.0;
  private currentMusicTrack: MusicTrackType = 'none';
  private audioContext: any = null;
  private musicInterval: any = null;
  private isInitialized = false;

  private constructor() {
    this.initAudioContext();
  }

  public static getInstance(): AudioManager {
    if (!this.instance) {
      this.instance = new AudioManager();
    }
    return this.instance;
  }

  private initAudioContext(): void {
    if (typeof window !== 'undefined') {
      const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        try {
          this.audioContext = new AudioCtx();
        } catch {
          // AudioContext might require user interaction to unlock
        }
      }
    }
  }

  private ensureUnlocked(): void {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume().catch(() => {});
    }
  }

  public async init(initialConfig?: Partial<AudioConfig>): Promise<void> {
    if (this.isInitialized) return;

    if (initialConfig) {
      if (initialConfig.soundEnabled !== undefined) this.soundEnabled = initialConfig.soundEnabled;
      if (initialConfig.soundVolume !== undefined) this.soundVolume = initialConfig.soundVolume;
      if (initialConfig.musicEnabled !== undefined) this.musicEnabled = initialConfig.musicEnabled;
      if (initialConfig.musicVolume !== undefined) this.musicVolume = initialConfig.musicVolume;
    } else {
      // Load saved preferences
      try {
        const saved = await LocalStorageService.getSettings();
        this.soundEnabled = saved.soundEnabled ?? DEFAULT_GAME_SETTINGS.soundEnabled;
        this.soundVolume = saved.soundVolume ?? DEFAULT_GAME_SETTINGS.soundVolume;
        this.musicEnabled = saved.musicEnabled ?? DEFAULT_GAME_SETTINGS.musicEnabled;
        this.musicVolume = saved.musicVolume ?? DEFAULT_GAME_SETTINGS.musicVolume;
      } catch {
        // Fallback to defaults
      }
    }

    this.isInitialized = true;
  }

  // --- Sound Effects ---

  public playSound(type: SoundEffectType, intensity = 1.0): void {
    if (!this.soundEnabled || this.soundVolume <= 0) return;
    this.ensureUnlocked();

    if (!this.audioContext) return;

    try {
      const volume = Math.min(1.0, Math.max(0.1, intensity)) * this.soundVolume;
      const now = this.audioContext.currentTime;

      switch (type) {
        case 'BUTTON_CLICK':
          this.synthTone(800, 1200, 0.04, volume * 0.4, 'sine');
          break;

        case 'STRIKER_PLACE':
          this.synthClick(250, 0.03, volume * 0.5);
          break;

        case 'STRIKER_SHOOT':
          this.synthWhoosh(150, 450, 0.12, volume * 0.7);
          break;

        case 'COIN_COLLISION':
        case 'STRIker_COLLISION':
          this.synthWoodImpact(750, 0.05, volume * 0.85);
          break;

        case 'CUSHION_HIT':
          this.synthThud(140, 0.08, volume * 0.6);
          break;

        case 'COIN_POCKET':
          this.synthPocket(350, 180, 0.15, volume * 0.9);
          break;

        case 'QUEEN_POCKET':
          this.synthQueenChime(volume);
          break;

        case 'FOUL':
          this.synthBuzzer(volume * 0.7);
          break;

        case 'TURN_CHANGE':
          this.synthChime([523.25, 659.25], 0.15, volume * 0.5);
          break;

        case 'HANDOVER':
          this.synthChime([440, 554.37, 659.25], 0.25, volume * 0.6);
          break;

        case 'MATCH_START':
          this.synthGong(volume * 0.8);
          break;

        case 'VICTORY':
          this.synthFanfare(volume);
          break;

        case 'DEFEAT':
          this.synthDefeat(volume * 0.7);
          break;

        case 'MATCH_COMPLETE':
          this.synthChime([523.25, 659.25, 783.99, 1046.5], 0.35, volume * 0.7);
          break;
      }
    } catch {
      // Non-critical audio synthesis failure
    }
  }

  // --- Background Music (Disabled for pure tactical board acoustics) ---

  public playMusic(_track: MusicTrackType): void {
    // Music completely disabled for authentic, tactile board gameplay
    this.stopMusic();
    this.currentMusicTrack = 'none';
  }

  public stopMusic(): void {
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
    this.currentMusicTrack = 'none';
  }

  // --- Volume & Settings Controls ---

  public setSoundEnabled(enabled: boolean): void {
    this.soundEnabled = enabled;
  }

  public isSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  public setSoundVolume(volume: number): void {
    this.soundVolume = Math.max(0, Math.min(1, volume));
  }

  public getSoundVolume(): number {
    return this.soundVolume;
  }

  public setMusicEnabled(enabled: boolean): void {
    this.musicEnabled = enabled;
    if (!enabled) {
      this.stopMusic();
    } else if (this.currentMusicTrack !== 'none') {
      const track = this.currentMusicTrack;
      this.currentMusicTrack = 'none';
      this.playMusic(track);
    }
  }

  public isMusicEnabled(): boolean {
    return this.musicEnabled;
  }

  public setMusicVolume(volume: number): void {
    this.musicVolume = Math.max(0, Math.min(1, volume));
  }

  public getMusicVolume(): number {
    return this.musicVolume;
  }

  public getCurrentMusicTrack(): MusicTrackType {
    return this.currentMusicTrack;
  }

  public cleanup(): void {
    this.stopMusic();
    if (this.audioContext && typeof this.audioContext.close === 'function') {
      try {
        this.audioContext.close();
      } catch {}
      this.audioContext = null;
    }
    this.isInitialized = false;
  }

  // --- Synthesis Primitives ---

  private synthTone(startFreq: number, endFreq: number, duration: number, volume: number, type: OscillatorType): void {
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    const now = this.audioContext.currentTime;

    osc.type = type;
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, endFreq), now + duration);

    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(this.audioContext.destination);

    osc.start(now);
    osc.stop(now + duration);
  }

  private synthClick(freq: number, duration: number, volume: number): void {
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    const now = this.audioContext.currentTime;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(this.audioContext.destination);

    osc.start(now);
    osc.stop(now + duration);
  }

  private synthWhoosh(startFreq: number, endFreq: number, duration: number, volume: number): void {
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    const now = this.audioContext.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + duration * 0.6);
    osc.frequency.exponentialRampToValueAtTime(startFreq, now + duration);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(volume, now + duration * 0.3);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(this.audioContext.destination);

    osc.start(now);
    osc.stop(now + duration);
  }

  private synthWoodImpact(_baseFreq: number, _duration: number, volume: number): void {
    const now = this.audioContext.currentTime;

    // Layer 1: High crisp contact click ("clack" transient)
    const oscClick = this.audioContext.createOscillator();
    const gainClick = this.audioContext.createGain();
    const clickFreq = 2300 + Math.random() * 400; // 2300-2700 Hz
    oscClick.type = 'triangle';
    oscClick.frequency.setValueAtTime(clickFreq, now);
    oscClick.frequency.exponentialRampToValueAtTime(750, now + 0.012);

    gainClick.gain.setValueAtTime(volume * 0.75, now);
    gainClick.gain.exponentialRampToValueAtTime(0.001, now + 0.014);

    oscClick.connect(gainClick);
    gainClick.connect(this.audioContext.destination);
    oscClick.start(now);
    oscClick.stop(now + 0.015);

    // Layer 2: Deep organic wooden body resonance ("tok" wooden tone)
    const oscBody = this.audioContext.createOscillator();
    const gainBody = this.audioContext.createGain();
    const filterBody = this.audioContext.createBiquadFilter();

    const bodyFreq = 560 + Math.random() * 120; // 560-680 Hz authentic wooden timbre
    oscBody.type = 'sine';
    oscBody.frequency.setValueAtTime(bodyFreq, now);
    oscBody.frequency.exponentialRampToValueAtTime(bodyFreq * 0.7, now + 0.038);

    filterBody.type = 'lowpass';
    filterBody.frequency.setValueAtTime(1500, now);

    gainBody.gain.setValueAtTime(volume * 0.9, now);
    gainBody.gain.exponentialRampToValueAtTime(0.001, now + 0.040);

    oscBody.connect(filterBody);
    filterBody.connect(gainBody);
    gainBody.connect(this.audioContext.destination);

    oscBody.start(now);
    oscBody.stop(now + 0.042);
  }

  private synthThud(freq: number, duration: number, volume: number): void {
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    const now = this.audioContext.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + duration);

    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(this.audioContext.destination);

    osc.start(now);
    osc.stop(now + duration);
  }

  private synthPocket(_startFreq: number, _endFreq: number, _duration: number, volume: number): void {
    const now = this.audioContext.currentTime;

    // Organic Carrom pocket slide and soft net drop ("plop-thud")
    const oscDrop = this.audioContext.createOscillator();
    const gainDrop = this.audioContext.createGain();
    oscDrop.type = 'sine';
    oscDrop.frequency.setValueAtTime(320, now);
    oscDrop.frequency.exponentialRampToValueAtTime(85, now + 0.08);

    gainDrop.gain.setValueAtTime(volume * 0.85, now);
    gainDrop.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    oscDrop.connect(gainDrop);
    gainDrop.connect(this.audioContext.destination);

    oscDrop.start(now);
    oscDrop.stop(now + 0.095);
  }

  private synthQueenChime(volume: number): void {
    const freqs = [523.25, 659.25, 783.99, 1046.5];
    const now = this.audioContext.currentTime;

    freqs.forEach((f, i) => {
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      const delay = i * 0.08;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now + delay);

      gain.gain.setValueAtTime(0, now);
      gain.gain.setValueAtTime(volume * 0.6, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.6);

      osc.connect(gain);
      gain.connect(this.audioContext.destination);

      osc.start(now + delay);
      osc.stop(now + delay + 0.6);
    });
  }

  private synthBuzzer(volume: number): void {
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    const now = this.audioContext.currentTime;

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.setValueAtTime(100, now + 0.1);

    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.audioContext.destination);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  private synthChime(freqs: number[], duration: number, volume: number): void {
    const now = this.audioContext.currentTime;

    freqs.forEach((f, idx) => {
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      const delay = idx * 0.06;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now + delay);

      gain.gain.setValueAtTime(0, now);
      gain.gain.setValueAtTime(volume, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + duration);

      osc.connect(gain);
      gain.connect(this.audioContext.destination);

      osc.start(now + delay);
      osc.stop(now + delay + duration);
    });
  }

  private synthGong(volume: number): void {
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    const now = this.audioContext.currentTime;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 1.2);

    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

    osc.connect(gain);
    gain.connect(this.audioContext.destination);

    osc.start(now);
    osc.stop(now + 1.2);
  }

  private synthFanfare(volume: number): void {
    const notes = [392.0, 523.25, 659.25, 783.99]; // G, C, E, G
    const now = this.audioContext.currentTime;

    notes.forEach((freq, idx) => {
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      const delay = idx * 0.12;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + delay);

      gain.gain.setValueAtTime(0, now);
      gain.gain.setValueAtTime(volume * 0.7, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.8);

      osc.connect(gain);
      gain.connect(this.audioContext.destination);

      osc.start(now + delay);
      osc.stop(now + delay + 0.8);
    });
  }

  private synthDefeat(volume: number): void {
    const notes = [440, 392, 349.23, 293.66]; // A, G, F, D
    const now = this.audioContext.currentTime;

    notes.forEach((freq, idx) => {
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      const delay = idx * 0.16;

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now + delay);

      gain.gain.setValueAtTime(0, now);
      gain.gain.setValueAtTime(volume * 0.4, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.5);

      osc.connect(gain);
      gain.connect(this.audioContext.destination);

      osc.start(now + delay);
      osc.stop(now + delay + 0.5);
    });
  }

  private synthPad(freq: number, duration: number, volume: number): void {
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    const now = this.audioContext.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(volume, now + duration * 0.3);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(this.audioContext.destination);

    osc.start(now);
    osc.stop(now + duration);
  }
}

