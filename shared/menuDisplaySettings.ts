export const MENU_DISPLAY_TOOL_KEYS = [
  "search",
  "categories",
  "pdf",
  "templatePicker",
  "qr",
  "branchPicker",
  "workingHours",
  "contactFooter",
  "mediaShowcase",
] as const;

export type MenuDisplayToolKey = (typeof MENU_DISPLAY_TOOL_KEYS)[number];

export type MenuGridColumns = 1 | 2 | 3 | 4;
export type MenuImageRatio = "square" | "portrait" | "landscape";
export type MenuButtonStyle = "filled" | "outline" | "soft";

export type MenuDisplaySettings = {
  tools: Record<MenuDisplayToolKey, boolean>;
  toolOrder: MenuDisplayToolKey[];
  showCustomerAccount: boolean;
  gridColumns: MenuGridColumns;
  imageRatio: MenuImageRatio;
  oneLineItemName: boolean;
  menuBackgroundColor: string;
  cardTextColor: string;
  cartButtonColor: string;
  cartButtonStyle: MenuButtonStyle;
};

export const defaultMenuDisplaySettings: MenuDisplaySettings = {
  tools: {
    search: true,
    categories: true,
    pdf: true,
    templatePicker: true,
    qr: true,
    branchPicker: true,
    workingHours: true,
    contactFooter: true,
    mediaShowcase: true,
  },
  toolOrder: [...MENU_DISPLAY_TOOL_KEYS],
  showCustomerAccount: true,
  gridColumns: 4,
  imageRatio: "square",
  oneLineItemName: false,
  menuBackgroundColor: "#fbf7f0",
  cardTextColor: "#172235",
  cartButtonColor: "#e76f3c",
  cartButtonStyle: "filled",
};

export function normalizeMenuDisplaySettings(raw?: string | null): MenuDisplaySettings {
  if (!raw?.trim()) return defaultMenuDisplaySettings;
  try {
    const parsed = JSON.parse(raw) as Partial<MenuDisplaySettings>;
    const tools = { ...defaultMenuDisplaySettings.tools, ...(parsed.tools ?? {}) };
    const toolOrder = Array.isArray(parsed.toolOrder)
      ? parsed.toolOrder.filter((key): key is MenuDisplayToolKey => MENU_DISPLAY_TOOL_KEYS.includes(key as MenuDisplayToolKey))
      : defaultMenuDisplaySettings.toolOrder;
    const requestedColumns = Number(parsed.gridColumns);
    const gridColumns: MenuGridColumns = requestedColumns === 1 || requestedColumns === 2 || requestedColumns === 3 || requestedColumns === 4 ? requestedColumns : 4;
    const imageRatio = parsed.imageRatio === "portrait" || parsed.imageRatio === "landscape" || parsed.imageRatio === "square" ? parsed.imageRatio : "square";
    const isHex = (value: unknown): value is string => typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value);
    const cartButtonStyle = parsed.cartButtonStyle === "outline" || parsed.cartButtonStyle === "soft" || parsed.cartButtonStyle === "filled" ? parsed.cartButtonStyle : "filled";
    return {
      tools,
      toolOrder: Array.from(new Set([...toolOrder, ...MENU_DISPLAY_TOOL_KEYS])),
      showCustomerAccount: parsed.showCustomerAccount !== false,
      gridColumns,
      imageRatio,
      oneLineItemName: parsed.oneLineItemName === true,
      menuBackgroundColor: isHex(parsed.menuBackgroundColor) ? parsed.menuBackgroundColor : defaultMenuDisplaySettings.menuBackgroundColor,
      cardTextColor: isHex(parsed.cardTextColor) ? parsed.cardTextColor : defaultMenuDisplaySettings.cardTextColor,
      cartButtonColor: isHex(parsed.cartButtonColor) ? parsed.cartButtonColor : defaultMenuDisplaySettings.cartButtonColor,
      cartButtonStyle,
    };
  } catch {
    return defaultMenuDisplaySettings;
  }
}

export function serializeMenuDisplaySettings(settings: MenuDisplaySettings) {
  return JSON.stringify(normalizeMenuDisplaySettings(JSON.stringify(settings)));
}
