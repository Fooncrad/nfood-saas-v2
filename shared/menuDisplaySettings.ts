export const MENU_DISPLAY_TOOL_KEYS = [
  "search",
  "categories",
  "share",
  "pdf",
  "templatePicker",
  "qr",
  "orderType",
  "branchPicker",
  "workingHours",
  "contactFooter",
  "mediaShowcase",
] as const;

export type MenuDisplayToolKey = (typeof MENU_DISPLAY_TOOL_KEYS)[number];

export type MenuDisplaySettings = {
  tools: Record<MenuDisplayToolKey, boolean>;
  toolOrder: MenuDisplayToolKey[];
  showCustomerAccount: boolean;
};

export const defaultMenuDisplaySettings: MenuDisplaySettings = {
  tools: {
    search: true,
    categories: true,
    share: true,
    pdf: true,
    templatePicker: true,
    qr: true,
    orderType: true,
    branchPicker: true,
    workingHours: true,
    contactFooter: true,
    mediaShowcase: true,
  },
  toolOrder: [...MENU_DISPLAY_TOOL_KEYS],
  showCustomerAccount: true,
};

export function normalizeMenuDisplaySettings(raw?: string | null): MenuDisplaySettings {
  if (!raw?.trim()) return defaultMenuDisplaySettings;
  try {
    const parsed = JSON.parse(raw) as Partial<MenuDisplaySettings>;
    const tools = { ...defaultMenuDisplaySettings.tools, ...(parsed.tools ?? {}) };
    const toolOrder = Array.isArray(parsed.toolOrder)
      ? parsed.toolOrder.filter((key): key is MenuDisplayToolKey => MENU_DISPLAY_TOOL_KEYS.includes(key as MenuDisplayToolKey))
      : defaultMenuDisplaySettings.toolOrder;
    return {
      tools,
      toolOrder: Array.from(new Set([...toolOrder, ...MENU_DISPLAY_TOOL_KEYS])),
      showCustomerAccount: parsed.showCustomerAccount !== false,
    };
  } catch {
    return defaultMenuDisplaySettings;
  }
}

export function serializeMenuDisplaySettings(settings: MenuDisplaySettings) {
  return JSON.stringify(normalizeMenuDisplaySettings(JSON.stringify(settings)));
}
