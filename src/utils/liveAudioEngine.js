// Specialized Live Operations Audio Engine using safe Web Audio API or no-op
// Distinct, energetic, and recognizable multi-tone chimes for real-time clinic operations.

const LIVE_SOUND_STORAGE_KEY = "medlink_live_operations_sound_enabled";

let soundEnabled = true;
try {
  if (typeof localStorage !== "undefined") {
    const val = localStorage.getItem(LIVE_SOUND_STORAGE_KEY);
    soundEnabled = val === null ? true : val === "true";
  }
} catch {
  soundEnabled = true;
}

let audioCtx = null;
let audioDisabled = false;
let lastPlayedTime = 0;

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

function playToneSequence(ctx, baseTime, tones) {
  tones.forEach((tone) => {
    try {
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
    } catch {
      // ignore tone error
    }
  });
}

export const liveAudioEngine = {
  getStoredSoundPreference() {
    return soundEnabled;
  },
  setSoundEnabled(enabled) {
    soundEnabled = Boolean(enabled);
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(LIVE_SOUND_STORAGE_KEY, String(soundEnabled));
      }
    } catch {
      // ignore
    }
    return soundEnabled;
  },
  isSoundEnabled() {
    return soundEnabled;
  },
  toggleSound() {
    return this.setSoundEnabled(!soundEnabled);
  },
  playLiveChime(priority = "important") {
    if (!soundEnabled || audioDisabled) return;

    const nowMs = Date.now();
    if (nowMs - lastPlayedTime < 150) return;
    lastPlayedTime = nowMs;

    try {
      const ctx = getSafeAudioContext();
      if (!ctx) return;

      if (ctx.state === "suspended") {
        ctx.resume().catch(() => {});
      }

      const now = ctx.currentTime;

      if (priority === "critical") {
        playToneSequence(ctx, now, [
          { freq: 739.99, start: 0.0, duration: 0.12, gain: 0.22, type: "sine" },
          { freq: 880.00, start: 0.09, duration: 0.14, gain: 0.24, type: "sine" },
          { freq: 1174.66, start: 0.20, duration: 0.35, gain: 0.26, type: "triangle" },
        ]);
      } else if (priority === "important") {
        playToneSequence(ctx, now, [
          { freq: 523.25, start: 0.0, duration: 0.10, gain: 0.18, type: "sine" },
          { freq: 659.25, start: 0.08, duration: 0.12, gain: 0.22, type: "sine" },
          { freq: 1046.50, start: 0.17, duration: 0.32, gain: 0.25, type: "sine" },
        ]);
      } else {
        playToneSequence(ctx, now, [
          { freq: 659.25, start: 0.0, duration: 0.10, gain: 0.16, type: "sine" },
          { freq: 987.77, start: 0.08, duration: 0.28, gain: 0.20, type: "sine" },
        ]);
      }
    } catch {
      // ignore
    }
  },
};

export function playLiveChime(priority = "important") {
  try {
    liveAudioEngine.playLiveChime(priority);
  } catch {
    // ignore
  }
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
