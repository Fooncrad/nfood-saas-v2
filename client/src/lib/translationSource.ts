export type MenuLanguage = "ar" | "en" | "fr";

export function detectMenuSourceLanguage(text: string): MenuLanguage {
  if (/[\u0600-\u06FF]/.test(text)) return "ar";
  if (/[àâçéèêëîïôùûüÿœæ]/i.test(text)) return "fr";
  return "en";
}
