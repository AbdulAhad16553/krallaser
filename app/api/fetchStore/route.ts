import { NextResponse, NextRequest } from "next/server";
import { GET as getProductsCatalog } from "../products/route";

// Minimal store shape to keep existing pages working while using ERPNext
const getFallbackStorePayload = () => {
  return {
    store: {
      stores: [
        {
          id: "default-store",
          store_name: "Krallaser",
          company_id: "Krallaser",
          store_detail: {
            currency: "PKR",
          },
          store_contact_detail: {
            phone: "",
          },
          store_components: [],
        },
      ],
    },
  };
};

const CACHE_TTL_MS = 10 * 60 * 1000;
let cachedResponse: { expiresAt: number; payload: any } | null = null;
let inFlightBuild: Promise<any> | null = null;

// ---- API Route ----
export async function GET(req: NextRequest) {
  try {
    const now = Date.now();
    if (cachedResponse && cachedResponse.expiresAt > now) {
      return NextResponse.json(cachedResponse.payload, {
        headers: {
          "Cache-Control": "public, s-maxage=600, stale-while-revalidate=300",
        },
      });
    }

    if (!inFlightBuild) {
      inFlightBuild = (async () => {
        // Reuse the catalog endpoint response (already includes product_variations).
        const url = req.nextUrl.clone();
        url.pathname = "/api/products";
        url.search = "";
        url.searchParams.set("page", "1");
        url.searchParams.set("limit", "5000");
        url.searchParams.set("mode", "all");
        const inner = new NextRequest(url, { headers: req.headers });
        const catalogRes = await getProductsCatalog(inner);
        const catalogJson = await catalogRes.json();
        const products = Array.isArray(catalogJson?.products) ? catalogJson.products : [];

        // Keep only:
        // 1) templates/variable products
        // 2) true single products (simple with no variant parent marker)
        const templatesWithVariants = products
          .filter((p: any) => {
            if (!p) return false;
            if (p.type === "variable") return true;
            if (p.type !== "simple") return false;
            const parentOfVariant = p.variant_of || p.parent_template || p.template || p._template?.variant_of;
            return !parentOfVariant;
          })
          .map((p: any) => ({
            ...p,
            product_variations: Array.isArray(p.product_variations) ? p.product_variations : [],
          }));

        return {
          success: true,
          total_templates: templatesWithVariants.length,
          total_items: templatesWithVariants.length,
          templates: templatesWithVariants,
          ...getFallbackStorePayload(),
        };
      })();
    }

    const payload = await inFlightBuild;
    cachedResponse = { expiresAt: now + CACHE_TTL_MS, payload };
    inFlightBuild = null;

    return NextResponse.json({
      ...payload,
    }, {
      headers: {
        "Cache-Control": "public, s-maxage=600, stale-while-revalidate=300",
      },
    });
  } catch (error: any) {
    inFlightBuild = null;
    console.error(
      "❌ Error fetching products with images:",
      error.response?.data || error.message
    );

    // Even on failure, keep the legacy store shape so pages don't break
    return NextResponse.json({
      success: false,
      error: "Failed to fetch template items with images",
      templates: [],
      total_templates: 0,
      ...getFallbackStorePayload(),
    });
  }
}
