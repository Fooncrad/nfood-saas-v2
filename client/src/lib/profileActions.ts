export type ProfileAction = "switch-account" | "logout";

type ProfileFlowDeps = {
  logout: () => Promise<unknown>;
  closeMenu: () => void;
  redirect: () => void;
  startLogin?: () => void;
  notifyError: (message: string) => void;
  notifySuccess?: () => void;
};

export function getProfileActionLabel(action: ProfileAction) {
  return action === "logout" ? "تسجيل الخروج" : "تبديل الحساب";
}

export function shouldRedirectAfterLogout(success: boolean) {
  return success;
}

export async function executeLogoutFlow(deps: ProfileFlowDeps) {
  try {
    await deps.logout();
    deps.closeMenu();
    deps.notifySuccess?.();
    if (shouldRedirectAfterLogout(true)) deps.redirect();
    return { success: true as const };
  } catch (error) {
    deps.notifyError(error instanceof Error ? error.message : "تعذر تسجيل الخروج");
    return { success: false as const };
  }
}

export async function executeSwitchAccountFlow(deps: ProfileFlowDeps) {
  try {
    await deps.logout();
    deps.closeMenu();
    deps.startLogin?.();
    return { success: true as const };
  } catch (error) {
    deps.notifyError(error instanceof Error ? error.message : "تعذر تبديل الحساب");
    return { success: false as const };
  }
}
