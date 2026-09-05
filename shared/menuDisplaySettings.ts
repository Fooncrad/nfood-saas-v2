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
export type MenuItemLayout = "cards" | "cardless" | "grid";
export type MenuDetailDirection = "auto" | "right" | "left";
export type MenuDetailPosition = "side" | "bottom" | "top";
export type MenuDetailWidth = "compact" | "wide" | "full";
export type MenuDetailBackground = "solid" | "glass" | "soft";
export type MenuDetailImageFit = "contain" | "cover";

export type MenuDetailWindowSettings = {
  direction: MenuDetailDirection;
  position: MenuDetailPosition;
  width: MenuDetailWidth;
  height: "auto" | "full";
  background: MenuDetailBackground;
  overlayOpacity: 20 | 40 | 60 | 80;
  imageFit: MenuDetailImageFit;
  showCloseButton: boolean;
  closeOnOutside: boolean;
  closeOnEscape: boolean;
  showQuantityControls: boolean;
  showAddToCart: boolean;
};

export type MenuDisplaySettings = {
  tools: Record<MenuDisplayToolKey, boolean>;
  toolOrder: MenuDisplayToolKey[];
  showCustomerAccount: boolean;
  gridColumns: MenuGridColumns;
  itemsPerCategory: number;
  imageRatio: MenuImageRatio;
  oneLineItemName: boolean;
  menuBackgroundColor: string;
  cardTextColor: string;
  cartButtonColor: string;
  cartButtonStyle: MenuButtonStyle;
  itemLayout: MenuItemLayout;
  detailWindow: MenuDetailWindowSettings;
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
  itemsPerCategory: 30,
  imageRatio: "square",
  oneLineItemName: false,
  menuBackgroundColor: "#fbf7f0",
  cardTextColor: "#172235",
  cartButtonColor: "#e76f3c",
  cartButtonStyle: "filled",
  itemLayout: "cardless",
  detailWindow: {
    direction: "auto",
    position: "side",
    width: "wide",
    height: "full",
    background: "solid",
    overlayOpacity: 60,
    imageFit: "contain",
    showCloseButton: true,
    closeOnOutside: true,
    closeOnEscape: true,
    showQuantityControls: true,
    showAddToCart: true,
  },
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
    const requestedItemsPerCategory = Number(parsed.itemsPerCategory);
    const itemsPerCategory = Number.isFinite(requestedItemsPerCategory) ? Math.max(1, Math.min(200, Math.round(requestedItemsPerCategory))) : defaultMenuDisplaySettings.itemsPerCategory;
    const imageRatio = parsed.imageRatio === "portrait" || parsed.imageRatio === "landscape" || parsed.imageRatio === "square" ? parsed.imageRatio : "square";
    const isHex = (value: unknown): value is string => typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value);
    const cartButtonStyle = parsed.cartButtonStyle === "outline" || parsed.cartButtonStyle === "soft" || parsed.cartButtonStyle === "filled" ? parsed.cartButtonStyle : "filled";
    const itemLayout: MenuItemLayout = parsed.itemLayout === "cards" || parsed.itemLayout === "cardless" || parsed.itemLayout === "grid" ? parsed.itemLayout : "cardless";
    const rawDetailWindow = parsed.detailWindow && typeof parsed.detailWindow === "object" ? parsed.detailWindow as Partial<MenuDetailWindowSettings> : {};
    const overlayOpacity = Number(rawDetailWindow.overlayOpacity);
    const detailWindow: MenuDetailWindowSettings = {
      direction: rawDetailWindow.direction === "right" || rawDetailWindow.direction === "left" || rawDetailWindow.direction === "auto" ? rawDetailWindow.direction : "auto",
      position: rawDetailWindow.position === "bottom" || rawDetailWindow.position === "top" || rawDetailWindow.position === "side" ? rawDetailWindow.position : "side",
      width: rawDetailWindow.width === "compact" || rawDetailWindow.width === "full" || rawDetailWindow.width === "wide" ? rawDetailWindow.width : "wide",
      height: rawDetailWindow.height === "auto" ? "auto" : "full",
      background: rawDetailWindow.background === "glass" || rawDetailWindow.background === "soft" || rawDetailWindow.background === "solid" ? rawDetailWindow.background : "solid",
      overlayOpacity: overlayOpacity === 20 || overlayOpacity === 40 || overlayOpacity === 60 || overlayOpacity === 80 ? overlayOpacity : 60,
      imageFit: rawDetailWindow.imageFit === "cover" ? "cover" : "contain",
      showCloseButton: rawDetailWindow.showCloseButton !== false,
      closeOnOutside: rawDetailWindow.closeOnOutside !== false,
      closeOnEscape: rawDetailWindow.closeOnEscape !== false,
      showQuantityControls: rawDetailWindow.showQuantityControls !== false,
      showAddToCart: rawDetailWindow.showAddToCart !== false,
    };
    return {
      tools,
      toolOrder: Array.from(new Set([...toolOrder, ...MENU_DISPLAY_TOOL_KEYS])),
      showCustomerAccount: parsed.showCustomerAccount !== false,
      gridColumns,
      itemsPerCategory,
      imageRatio,
      oneLineItemName: parsed.oneLineItemName === true,
      menuBackgroundColor: isHex(parsed.menuBackgroundColor) ? parsed.menuBackgroundColor : defaultMenuDisplaySettings.menuBackgroundColor,
      cardTextColor: isHex(parsed.cardTextColor) ? parsed.cardTextColor : defaultMenuDisplaySettings.cardTextColor,
      cartButtonColor: isHex(parsed.cartButtonColor) ? parsed.cartButtonColor : defaultMenuDisplaySettings.cartButtonColor,
      cartButtonStyle,
      itemLayout,
      detailWindow,
    };
  } catch {
    return defaultMenuDisplaySettings;
  }
}

export function serializeMenuDisplaySettings(settings: MenuDisplaySettings) {
  return JSON.stringify(normalizeMenuDisplaySettings(JSON.stringify(settings)));
}
