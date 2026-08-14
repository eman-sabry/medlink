// Pleasant two-tone chime for clinic notifications using Web Audio API
const SOUND_STORAGE_KEY = "medlink_notification_sound_enabled";

class NotificationAudioEngine {
  constructor() {
    this.audioCtx = null;
    this.soundEnabled = this.getStoredSoundPreference();
  }

  getStoredSoundPreference() {
    try {
      const val = localStorage.getItem(SOUND_STORAGE_KEY);
      return val === null ? true : val === "true";
    } catch {
      return true;
    }
  }

  setSoundEnabled(enabled) {
    this.soundEnabled = Boolean(enabled);
    try {
      localStorage.setItem(SOUND_STORAGE_KEY, String(this.soundEnabled));
    } catch {
      // ignore
    }
    return this.soundEnabled;
  }

  isSoundEnabled() {
    return this.soundEnabled;
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

  playChime(type = "info") {
    if (!this.soundEnabled) return;
    try {
      const ctx = this.initContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      
      // Determine tone frequencies based on notification severity
      let firstFreq = 587.33; // D5
      let secondFreq = 880.00; // A5
      
      if (type === "warning") {
        firstFreq = 659.25; // E5
        secondFreq = 523.25; // C5
      } else if (type === "critical") {
        firstFreq = 880.00; // A5
        secondFreq = 1046.50; // C6
      } else if (type === "success") {
        firstFreq = 523.25; // C5
        secondFreq = 783.99; // G5
      }

      // First tone
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(firstFreq, now);

      gain1.gain.setValueAtTime(0, now);
      gain1.gain.linearRampToValueAtTime(0.18, now + 0.03);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.35);

      // Second tone (slightly overlapping, higher harmonic)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(secondFreq, now + 0.12);

      gain2.gain.setValueAtTime(0, now + 0.12);
      gain2.gain.linearRampToValueAtTime(0.15, now + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.6);
    } catch (err) {
      console.warn("Could not play notification chime:", err);
    }
  }
}

export const notificationAudio = new NotificationAudioEngine();

export function playNotificationChime(type = "info") {
  notificationAudio.playChime(type);
}

export function isNotificationSoundEnabled() {
  return notificationAudio.isSoundEnabled();
}

export function toggleNotificationSound() {
  const current = notificationAudio.isSoundEnabled();
  return notificationAudio.setSoundEnabled(!current);
}

export function setNotificationSound(enabled) {
  return notificationAudio.setSoundEnabled(enabled);
}
