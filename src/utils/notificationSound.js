// Pleasant two-tone chime for clinic notifications using safe Web Audio API or no-op
const SOUND_STORAGE_KEY = "medlink_notification_sound_enabled";

let soundEnabled = true;
try {
  if (typeof localStorage !== "undefined") {
    const val = localStorage.getItem(SOUND_STORAGE_KEY);
    soundEnabled = val === null ? true : val === "true";
  }
} catch {
  soundEnabled = true;
}

let audioCtx = null;
let audioDisabled = false;

function getSafeAudioContext() {
  if (audioDisabled || typeof window === "undefined") return null;
  if (audioCtx) return audioCtx;

  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (typeof AudioCtx === "function" && AudioCtx.prototype) {
      audioCtx = new AudioCtx();
      return audioCtx;
    }
  } catch {
    audioDisabled = true;
  }
  return null;
}

export const notificationAudio = {
  getStoredSoundPreference() {
    return soundEnabled;
  },
  setSoundEnabled(enabled) {
    soundEnabled = Boolean(enabled);
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(SOUND_STORAGE_KEY, String(soundEnabled));
      }
    } catch {
      // ignore
    }
    return soundEnabled;
  },
  isSoundEnabled() {
    return soundEnabled;
  },
  playChime(type = "info") {
    if (!soundEnabled || audioDisabled) return;
    try {
      const ctx = getSafeAudioContext();
      if (!ctx) return;

      if (ctx.state === "suspended") {
        ctx.resume().catch(() => {});
      }

      const now = ctx.currentTime;
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
    } catch {
      // Audio playback safely ignored
    }
  },
};

export function playNotificationChime(type = "info") {
  try {
    notificationAudio.playChime(type);
  } catch {
    // ignore
  }
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
