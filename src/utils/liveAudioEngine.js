// Specialized Live Operations Audio Engine using Web Audio API
// Distinct, energetic, and recognizable multi-tone chimes for real-time clinic operations.

const LIVE_SOUND_STORAGE_KEY = "medlink_live_operations_sound_enabled";

class LiveAudioEngine {
  constructor() {
    this.audioCtx = null;
    this.soundEnabled = this.getStoredSoundPreference();
    this.lastPlayedTime = 0;
  }

  getStoredSoundPreference() {
    try {
      const val = localStorage.getItem(LIVE_SOUND_STORAGE_KEY);
      return val === null ? true : val === "true";
    } catch {
      return true;
    }
  }

  setSoundEnabled(enabled) {
    this.soundEnabled = Boolean(enabled);
    try {
      localStorage.setItem(LIVE_SOUND_STORAGE_KEY, String(this.soundEnabled));
    } catch {
      // ignore storage error
    }
    return this.soundEnabled;
  }

  isSoundEnabled() {
    return this.soundEnabled;
  }

  toggleSound() {
    return this.setSoundEnabled(!this.soundEnabled);
  }

  initContext() {
    if (typeof window === "undefined") return null;
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === "suspended") {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  /**
   * Plays a distinct, energetic Live Operations sound based on event priority.
   * @param {"normal" | "important" | "critical"} priority
   */
  playLiveChime(priority = "important") {
    if (!this.soundEnabled) return;

    // Prevent audio overlap if triggered rapidly within 150ms
    const nowMs = Date.now();
    if (nowMs - this.lastPlayedTime < 150) return;
    this.lastPlayedTime = nowMs;

    try {
      const ctx = this.initContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      if (priority === "critical") {
        // Distinct energetic 3-tone attention chime (F#5 -> A5 -> D6)
        this.playToneSequence(ctx, now, [
          { freq: 739.99, start: 0.0, duration: 0.12, gain: 0.22, type: "sine" },
          { freq: 880.00, start: 0.09, duration: 0.14, gain: 0.24, type: "sine" },
          { freq: 1174.66, start: 0.20, duration: 0.35, gain: 0.26, type: "triangle" },
        ]);
      } else if (priority === "important") {
        // Energetic rising 3-tone chime (C5 -> E5 -> C6) - Bright & optimistic
        this.playToneSequence(ctx, now, [
          { freq: 523.25, start: 0.0, duration: 0.10, gain: 0.18, type: "sine" },
          { freq: 659.25, start: 0.08, duration: 0.12, gain: 0.22, type: "sine" },
          { freq: 1046.50, start: 0.17, duration: 0.32, gain: 0.25, type: "sine" },
        ]);
      } else {
        // Normal live event: crisp, snappy rising 2-tone chime (E5 -> B5)
        this.playToneSequence(ctx, now, [
          { freq: 659.25, start: 0.0, duration: 0.10, gain: 0.16, type: "sine" },
          { freq: 987.77, start: 0.08, duration: 0.28, gain: 0.20, type: "sine" },
        ]);
      }
    } catch (err) {
      console.warn("Could not play Live Operations sound:", err);
    }
  }

  playToneSequence(ctx, baseTime, tones) {
    tones.forEach((tone) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = tone.type || "sine";
      osc.frequency.setValueAtTime(tone.freq, baseTime + tone.start);

      const startTime = baseTime + tone.start;
      const endTime = startTime + tone.duration;

      gainNode.gain.setValueAtTime(0.0001, startTime);
      gainNode.gain.linearRampToValueAtTime(tone.gain, startTime + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, endTime);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(endTime);
    });
  }
}

export const liveAudioEngine = new LiveAudioEngine();

export function playLiveChime(priority = "important") {
  liveAudioEngine.playLiveChime(priority);
}

export function isLiveSoundEnabled() {
  return liveAudioEngine.isSoundEnabled();
}

export function toggleLiveSound() {
  return liveAudioEngine.toggleSound();
}

export function setLiveSound(enabled) {
  return liveAudioEngine.setSoundEnabled(enabled);
}
