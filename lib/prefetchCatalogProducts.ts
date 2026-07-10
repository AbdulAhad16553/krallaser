import { getUrlWithScheme } from "@/lib/getUrlWithScheme";

type CatalogMode = "all" | "machine" | "parts";

export async function prefetchCatalogProducts(
  host: string,
  options: { mode?: CatalogMode; limit?: number } = {}
): Promise<any[]> {
  const { mode = "all", limit = 48 } = options;
  const fullStoreUrl = getUrlWithScheme(host);
  const modeParam = mode !== "all" ? `&mode=${mode}` : "";
  // Machines are quote-led; parts/shop need full Item Price for sale pricing
  const lightParam = mode === "machine" ? "&light=1" : "";

  try {
    const response = await fetch(
      `${fullStoreUrl}/api/products?page=1&limit=${limit}${modeParam}${lightParam}`,
      { next: { revalidate: 60 } }
    );
    if (!response.ok) return [];
    const data = await response.json();
    return Array.isArray(data?.products) ? data.products : [];
  } catch (error) {
    console.error(`Prefetch ${mode} products failed:`, error);
    return [];
  }
}
