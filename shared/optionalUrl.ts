export function normalizeOptionalUrl(value: unknown): string {
  if (typeof value !== "string") return "";
  const raw = value.trim();
  if (!raw || /^(undefined|null|none|n\/a)$/i.test(raw)) return "";

  // Keep same-origin storage paths such as /manus-storage/... valid.
  if (raw.startsWith("/") && !raw.startsWith("//")) return raw.slice(0, 500);

  try {
    const parsed = new URL(raw);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") return raw.slice(0, 500);
  } catch {
    // Invalid optional asset values are cleared rather than blocking the whole branding form.
  }

  return "";
}
