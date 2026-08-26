const STORAGE_KEY = "nfood-device-key";

export async function getDeviceFingerprint(): Promise<string> {
  if (typeof window === "undefined") return "";
  let localKey = window.localStorage.getItem(STORAGE_KEY);
  if (!localKey) {
    localKey = `${crypto.randomUUID()}-${Date.now()}`;
    window.localStorage.setItem(STORAGE_KEY, localKey);
  }
  const material = `${localKey}|${navigator.userAgent}|${navigator.language}|${Intl.DateTimeFormat().resolvedOptions().timeZone}`;
  const bytes = new TextEncoder().encode(material);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function getDeviceLabel() {
  if (typeof navigator === "undefined") return "Web browser";
  return `${navigator.platform || "Web"} · ${navigator.userAgent.includes("Mobile") ? "Mobile" : "Desktop"}`.slice(0, 160);
}
