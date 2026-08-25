export const SIDEBAR_WIDTHS = {
  expanded: 256,
  collapsed: 80,
} as const;

export type SidebarMode = "expanded" | "collapsed";
export type SidebarStatusTone = "healthy" | "checking" | "attention";

export function getSidebarMode(collapsed: boolean): SidebarMode {
  return collapsed ? "collapsed" : "expanded";
}

export function getSidebarWidth(collapsed: boolean): number {
  return collapsed ? SIDEBAR_WIDTHS.collapsed : SIDEBAR_WIDTHS.expanded;
}

export function isSidebarToggleShortcut(event: Pick<KeyboardEvent, "ctrlKey" | "metaKey" | "key">): boolean {
  return (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "b";
}

export function toggleSidebarFavorite(keys: string[], key: string, limit = 6): string[] {
  if (keys.includes(key)) return keys.filter(item => item !== key);
  return [...keys, key].slice(-limit);
}

export function formatSidebarCount(value: number): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(
    Math.max(0, Math.round(Number(value) || 0)),
  );
}

export function getSidebarStatusTone({ loading, error }: { loading: boolean; error: boolean }): SidebarStatusTone {
  if (error) return "attention";
  if (loading) return "checking";
  return "healthy";
}
