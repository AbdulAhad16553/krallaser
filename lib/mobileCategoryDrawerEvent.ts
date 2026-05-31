/** Dispatched on `window` to open the mobile category drawer (Header listens). */
export const OPEN_MOBILE_CATEGORY_DRAWER = "krallaser:open-mobile-category-drawer";

export function openMobileCategoryDrawer() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(OPEN_MOBILE_CATEGORY_DRAWER));
}
