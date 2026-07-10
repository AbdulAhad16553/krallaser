import { trackMetaEvent, currencyCode } from "@/lib/metaPixel";

/**
 * Bridge for existing Meta event payloads — also fires the browser Pixel
 * so Events Manager receives AddToCart / custom events from the site.
 */
export const createMetaEvent = (eventData: any) => {
  try {
    const eventName = eventData?.event_name || "CustomEvent";
    const custom = eventData?.custom_data || {};

    trackMetaEvent(eventName, {
      content_name: custom.content_name,
      content_category: custom.content_category,
      currency: currencyCode(custom.currency),
      value: Number(custom.value) || 0,
      content_type: "product",
    });

    if (process.env.NODE_ENV === "development") {
      console.log("Meta event created:", eventData);
    }

    return { success: true, message: "Event tracked successfully" };
  } catch (error) {
    console.error("Error creating meta event:", error);
    return { success: false, message: "Failed to track event" };
  }
};
