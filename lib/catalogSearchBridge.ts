/** Instant catalog search while typing (URL updates are debounced separately in the header). */
const HOME_CATALOG_Q = "krallaser:home-catalog-q";
const SHOP_SEARCH_Q = "krallaser:shop-search-q";

export function emitHomeCatalogSearchQuery(q: string): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(HOME_CATALOG_Q, { detail: { q } }));
}

export function subscribeHomeCatalogSearchQuery(
  handler: (q: string) => void
): () => void {
  const fn = (e: Event) => {
    const q = (e as CustomEvent<{ q: string }>).detail?.q ?? "";
    handler(q);
  };
  window.addEventListener(HOME_CATALOG_Q, fn);
  return () => window.removeEventListener(HOME_CATALOG_Q, fn);
}

/** EnhancedShopContent (/shop, /parts, /machine) */
export function emitShopSearchQuery(q: string): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(SHOP_SEARCH_Q, { detail: { q } }));
}

export function subscribeShopSearchQuery(
  handler: (q: string) => void
): () => void {
  const fn = (e: Event) => {
    const q = (e as CustomEvent<{ q: string }>).detail?.q ?? "";
    handler(q);
  };
  window.addEventListener(SHOP_SEARCH_Q, fn);
  return () => window.removeEventListener(SHOP_SEARCH_Q, fn);
}
