export type OrderAlertTone = "new" | "status";

type AudioContextConstructor = typeof AudioContext;

let sharedContext: AudioContext | null = null;
let audioPrimed = false;

function getAudioContext() {
  if (typeof window === "undefined" || typeof window.AudioContext === "undefined" && !(window as Window & { webkitAudioContext?: AudioContextConstructor }).webkitAudioContext) return null;
  const Constructor = window.AudioContext ?? (window as Window & { webkitAudioContext?: AudioContextConstructor }).webkitAudioContext;
  if (!Constructor) return null;
  sharedContext ??= new Constructor();
  return sharedContext;
}

function synthesizeAlertWavDataUri(tone: OrderAlertTone) {
  const sampleRate = 22050;
  const duration = tone === "new" ? 0.7 : 0.38;
  const samples = Math.floor(sampleRate * duration);
  const bytes = new Uint8Array(44 + samples * 2);
  const view = new DataView(bytes.buffer);
  const write = (offset: number, value: string) => { for (let i = 0; i < value.length; i += 1) bytes[offset + i] = value.charCodeAt(i); };
  write(0, "RIFF"); view.setUint32(4, 36 + samples * 2, true); write(8, "WAVE"); write(12, "fmt ");
  view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true); view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); view.setUint16(32, 2, true); view.setUint16(34, 16, true); write(36, "data"); view.setUint32(40, samples * 2, true);
  for (let i = 0; i < samples; i += 1) {
    const t = i / sampleRate;
    const envelope = Math.min(1, t / 0.02) * Math.max(0, 1 - t / duration);
    const first = Math.sin(2 * Math.PI * (tone === "new" ? 880 : 660) * t);
    const second = Math.sin(2 * Math.PI * (tone === "new" ? 1174 : 880) * t);
    const pulse = tone === "new" && t > 0.34 ? 0.75 : 1;
    view.setInt16(44 + i * 2, Math.round((first * 0.68 + second * 0.32) * envelope * pulse * 14000), true);
  }
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) { const part = bytes.subarray(i, i + chunk); for (let j = 0; j < part.length; j += 1) binary += String.fromCharCode(part[j]); }
  return `data:audio/wav;base64,${btoa(binary)}`;
}

const audioFiles: Partial<Record<OrderAlertTone, HTMLAudioElement>> = {};

function getAlertAudio(tone: OrderAlertTone) {
  if (typeof window === "undefined" || typeof Audio === "undefined") return null;
  if (!audioFiles[tone]) {
    const audio = new Audio(synthesizeAlertWavDataUri(tone));
    audio.preload = "auto";
    audioFiles[tone] = audio;
  }
  return audioFiles[tone] ?? null;
}

export async function primeOrderAlertAudio() {
  const context = getAudioContext();
  const audio = getAlertAudio("status");
  try {
    if (context && context.state !== "running") await context.resume();
    if (audio) {
      audio.volume = 0.001;
      await audio.play();
      audio.pause();
      audio.currentTime = 0;
      audio.volume = 1;
    }
    audioPrimed = Boolean(audio) || context?.state === "running";
    return audioPrimed;
  } catch {
    audioPrimed = context?.state === "running";
    return audioPrimed;
  }
}

async function playSynthFallback(volume: number, tone: OrderAlertTone) {
  const context = getAudioContext();
  if (!context) return false;
  try {
    if (context.state !== "running") await context.resume();
    if (context.state !== "running") return false;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const startAt = context.currentTime + 0.01;
    const endAt = startAt + (tone === "new" ? 0.42 : 0.28);
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(tone === "new" ? 880 : 660, startAt);
    oscillator.frequency.exponentialRampToValueAtTime(tone === "new" ? 1174 : 880, endAt - 0.04);
    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.01, 0.22 * volume), startAt + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, endAt);
    oscillator.connect(gain); gain.connect(context.destination); oscillator.start(startAt); oscillator.stop(endAt);
    return true;
  } catch { return false; }
}

export async function playOrderAlertSound({ volume = 0.65, tone = "new" }: { volume?: number; tone?: OrderAlertTone } = {}) {
  const safeVolume = Math.min(1, Math.max(0, volume));
  const audio = getAlertAudio(tone);
  if (audio) {
    try {
      audio.pause(); audio.currentTime = 0; audio.volume = safeVolume;
      await audio.play();
      return true;
    } catch { /* autoplay policy or unsupported audio: use WebAudio fallback */ }
  }
  return playSynthFallback(safeVolume, tone);
}

export function installOrderAlertAudioUnlock() {
  if (typeof window === "undefined" || audioPrimed) return () => {};
  const unlock = () => { void primeOrderAlertAudio(); };
  window.addEventListener("pointerdown", unlock, { once: true, passive: true });
  window.addEventListener("keydown", unlock, { once: true });
  return () => { window.removeEventListener("pointerdown", unlock); window.removeEventListener("keydown", unlock); };
}

export function resetOrderAlertAudioForTests() {
  sharedContext = null;
  audioPrimed = false;
}
