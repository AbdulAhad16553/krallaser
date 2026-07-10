/**
 * Meta (Facebook) Pixel helpers — browser-side event tracking.
 * Both dataset IDs from Events Manager are initialized so ads can attribute traffic.
 */

/** Meta Events Manager dataset IDs (hardcoded — not from env) */
export const META_PIXEL_IDS = [
  "1154145279682908",
  "1890332521505401",
] as const;

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: (...args: unknown[]) => void;
  }
}

type PixelContent = {
  id?: string;
  quantity?: number;
  item_price?: number;
};

type PixelEventParams = {
  content_name?: string;
  content_category?: string;
  content_ids?: string[];
  content_type?: string;
  contents?: PixelContent[];
  currency?: string;
  value?: number;
  num_items?: number;
};

function canTrack(): boolean {
  return typeof window !== "undefined" && typeof window.fbq === "function";
}

/** Fire a standard or custom Meta Pixel event to all initialized pixels */
export function trackMetaEvent(
  eventName: string,
  params?: PixelEventParams,
  options?: { eventID?: string }
): void {
  if (!canTrack()) return;
  try {
    if (options?.eventID) {
      window.fbq!("track", eventName, params || {}, { eventID: options.eventID });
    } else {
      window.fbq!("track", eventName, params || {});
    }
  } catch (error) {
    console.warn("[Meta Pixel] track failed:", error);
  }
}

export function trackPageView(): void {
  trackMetaEvent("PageView");
}

export function trackViewContent(params: {
  content_name: string;
  content_ids?: string[];
  content_category?: string;
  currency?: string;
  value?: number;
}): void {
  trackMetaEvent("ViewContent", {
    content_type: "product",
    ...params,
  });
}

export function trackAddToCart(params: {
  content_name: string;
  content_ids?: string[];
  content_category?: string;
  currency?: string;
  value?: number;
  contents?: PixelContent[];
}): void {
  trackMetaEvent("AddToCart", {
    content_type: "product",
    ...params,
  });
}

export function trackInitiateCheckout(params: {
  content_ids?: string[];
  contents?: PixelContent[];
  currency?: string;
  value?: number;
  num_items?: number;
}): void {
  trackMetaEvent("InitiateCheckout", {
    content_type: "product",
    ...params,
  });
}

export function trackPurchase(params: {
  content_ids?: string[];
  contents?: PixelContent[];
  currency?: string;
  value: number;
  content_name?: string;
}): void {
  trackMetaEvent("Purchase", {
    content_type: "product",
    ...params,
  });
}

export function currencyCode(currency?: string): string {
  if (!currency) return "PKR";
  return currency.split(" - ")[0].trim().toUpperCase() || "PKR";
}
