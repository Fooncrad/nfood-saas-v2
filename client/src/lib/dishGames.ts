export type DishGame = { id: string; title: string; emoji: string; prompt: string };

export const DISH_GAMES: DishGame[] = [
  { id: "espresso", title: "تحدي الإسبريسو", emoji: "☕", prompt: "اضغط لتحضير فنجان إسبريسو" },
  { id: "dessert", title: "ترتيب الحلوى", emoji: "🍰", prompt: "رتّب طبقات الحلوى" },
  { id: "juice", title: "خلطة العصير", emoji: "🥤", prompt: "اخلط النكهات المنعشة" },
];

export function rankDishScores(scores: number[], limit = 3) {
  return scores.filter((score) => Number.isFinite(score) && score >= 0).sort((a, b) => b - a).slice(0, limit);
}

export function dishTone(id: string) {
  return id === "espresso" ? 520 : id === "dessert" ? 390 : 300;
}
