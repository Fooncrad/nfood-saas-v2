export type KitchenStation = "kitchen" | "bar";

type KitchenSectionLike = { id: number; name: string };

const BAR_SECTION_TOKENS = [
  "bar",
  "مشروبات",
  "مشروب",
  "بار",
  "قهوة",
  "كوفي",
  "عصائر",
  "coffee",
  "beverage",
  "juice",
];

export function isBarKitchenSection(name: string) {
  const normalized = name.trim().toLocaleLowerCase();
  return BAR_SECTION_TOKENS.some((token) => normalized.includes(token));
}

export function getStationSectionIds(sections: KitchenSectionLike[], station?: KitchenStation) {
  if (!station) return new Set(sections.map((section) => section.id));
  return new Set(
    sections
      .filter((section) => (station === "bar" ? isBarKitchenSection(section.name) : !isBarKitchenSection(section.name)))
      .map((section) => section.id),
  );
}

export function getStationLabel(station: KitchenStation) {
  return station === "bar" ? "محطة البار" : "محطة المطبخ";
}
