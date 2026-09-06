export type OrderAlertTone = "new" | "status";

type AudioContextConstructor = typeof AudioContext;

let sharedContext: AudioContext | null = null;

function getAudioContext() {
  if (typeof window === "undefined" || typeof window.AudioContext === "undefined" && !(window as Window & { webkitAudioContext?: AudioContextConstructor }).webkitAudioContext) return null;
  const Constructor = window.AudioContext ?? (window as Window & { webkitAudioContext?: AudioContextConstructor }).webkitAudioContext;
  if (!Constructor) return null;
  sharedContext ??= new Constructor();
  return sharedContext;
}

export async function primeOrderAlertAudio() {
  const context = getAudioContext();
  if (!context) return false;
  try {
    if (context.state !== "running") await context.resume();
    return context.state === "running";
  } catch {
    return false;
  }
}

export async function playOrderAlertSound({ volume = 0.65, tone = "new" }: { volume?: number; tone?: OrderAlertTone } = {}) {
  const context = getAudioContext();
  if (!context) return false;
  try {
    if (context.state !== "running") await context.resume();
    if (context.state !== "running") return false;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const safeVolume = Math.min(1, Math.max(0, volume));
    const startAt = context.currentTime + 0.01;
    const endAt = startAt + (tone === "new" ? 0.32 : 0.24);
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(tone === "new" ? 880 : 660, startAt);
    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.01, 0.18 * safeVolume), startAt + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, endAt);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(startAt);
    oscillator.stop(endAt);
    return true;
  } catch {
    return false;
  }
}

export function resetOrderAlertAudioForTests() {
  sharedContext = null;
}
