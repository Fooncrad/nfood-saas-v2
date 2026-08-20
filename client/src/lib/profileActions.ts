export type ProfileAction = "switch-account" | "logout";

export function getProfileActionLabel(action: ProfileAction) {
  return action === "logout" ? "تسجيل الخروج" : "تبديل الحساب";
}

export function shouldRedirectAfterLogout(success: boolean) {
  return success;
}
