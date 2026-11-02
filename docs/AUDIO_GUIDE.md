# CarromVerse Audio Architecture Guide

Comprehensive developer guide for the CarromVerse audio and sound effects pipeline (Phase 1.7 Final).

---

## 1. Architecture Overview

CarromVerse uses a **dual-tier zero-latency audio architecture**:

```
+--------------------------------------------------------------+
|                    React Native Frontend                     |
|                                                              |
|   [ AudioManager.ts ]                                        |
|   * UI sound effects (Button click, Turn change, Handover)   |
|   * Background Music synthesizers (Home, Lobby, Gameplay)    |
|   * Settings Store synchronization & volume persistence      |
+------------------------------+-------------------------------+
                               | Web Audio Bridge Config
                               v
+--------------------------------------------------------------+
|              Phaser 3 Engine (Inside WebView)                |
|                                                              |
|   [ In-Engine Web Audio Synthesizer ]                        |
|   * Wood striker-to-coin clicks (Frequency-modulated sweep) |
|   * Cushion wood-rail thuds (Low-pass filtered resonance)    |
|   * Pocket drop & net chimes (Pitched decay tones)           |
|   * Striker shot blast audio                                 |
+--------------------------------------------------------------+
```

### Why Dual-Tier?
- **Zero Bridge Latency**: High-velocity physics collisions occurring at 60 FPS (e.g. break shots) cannot wait for serialized bridge postMessages to play sounds. The in-engine synthesizer synthesizes physical audio directly on the audio hardware within the WebView execution thread.
- **Throttled Bridge Traffic**: Micro-collisions are handled locally within Phaser without posting messages to React Native. Only high-speed collisions (>40 cm/s) and pocket events notify the UI, preserving high frame rates.

---

## 2. Audio Effects Inventory

| SFX Name | Trigger Point | Execution Domain | Synthesis / Sound Profile |
|---|---|---|---|
| `BUTTON_CLICK` | UI touch / navigation | React Native (`AudioManager`) | Crisp 800 Hz sine tap, 40 ms decay |
| `STRIKER_PLACE` | Nudge / Baseline slide | React Native (`AudioManager`) | Subtle 300 Hz wood placement click |
| `STRIKER_SHOOT` | Striker launch | Dual (Phaser + RN) | Kinetic release whoosh and spring strike |
| `STRIKER_COLLISION` | Striker hit coin | In-Engine (Phaser) | Sharp acoustic wood impact, velocity-scaled gain |
| `COIN_COLLISION` | Coin hit coin | In-Engine (Phaser) | Clean high-Q resonant wood click |
| `CUSHION_HIT` | Coin hit frame cushion | In-Engine (Phaser) | Deep 120 Hz dampened wooden thud |
| `COIN_POCKET` | Coin falls into pocket | Dual (Phaser + RN) | Descending dual-tone drop + net absorption |
| `QUEEN_POCKET` | Queen falls into pocket | Dual (Phaser + RN) | Ascending golden triad harmonic chime |
| `FOUL` | Striker scratch / violation | Dual (Phaser + RN) | Dissonant minor second warning buzz |
| `TURN_CHANGE` | Turn advances | React Native (`AudioManager`) | Gentle two-note marimba chime |
| `HANDOVER` | Pass-and-play confirmation | React Native (`AudioManager`) | Ascending double ping |
| `MATCH_START` | Lobby "Start Match" | React Native (`AudioManager`) | Dynamic energetic gong / start swell |
| `VICTORY` | Match won | React Native (`AudioManager`) | Fanfare major arpeggio |

---

## 3. Background Music (BGM) System

The background music system provides continuous ambient melodic progressions across screens:

- **`home`**: Relaxed, atmospheric acoustic chords (`#07261C` theme).
- **`lobby`**: Upbeat, rhythmic anticipation loop.
- **`gameplay`**: Minimal, non-distracting ambient drone with gentle harmonic pulses.
- **`victory`**: Celebratory triumphant arpeggios.

---

## 4. Volume Control & Persistence

- **Independent Volume Channels**:
  - `soundVolume`: Scales all SFX (0.0 to 1.0).
  - `musicVolume`: Scales all BGM (0.0 to 1.0).
  - `soundEnabled`: Master mute toggle for all SFX.
  - `musicEnabled`: Master mute toggle for all BGM.
- **Settings Store (`settingsStore.ts`)**: Persists volume configurations to local storage (`AsyncStorage`).
- **Bridge Sync**: Whenever volume is adjusted in the settings screen or pause menu, `SET_AUDIO_CONFIG` is delivered to the Phaser engine.

