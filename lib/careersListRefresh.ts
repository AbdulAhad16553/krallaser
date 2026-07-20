/** Dispatched after a new profile is published so the talent board list refreshes. */
export const CAREERS_LIST_REFRESH_EVENT = "careers-list-refresh";

export function notifyCareersListRefresh() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(CAREERS_LIST_REFRESH_EVENT));
  }
}
