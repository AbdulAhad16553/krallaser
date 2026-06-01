import Layout from "@/components/Layout";
import EnhancedShopContent from "@/modules/ShopContent/EnhancedShopContent";
import { getAllCategories } from "@/hooks/getCategories";
import { buildPageMetadata } from "@/lib/seo";
import { headers } from "next/headers";
import { getUrlWithScheme } from "@/lib/getUrlWithScheme";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = buildPageMetadata({
  title: "Laser Cutting Machine Parts & Accessories",
  description:
    "Laser cutter spare parts in Pakistan: lenses, nozzles, chillers, power supplies, and consumables. Shop Krallaser parts with fast support from Lahore.",
  path: "/parts",
});

export default async function PartsPage() {
  const storeId = "default-store";
  const companyId = "Krallaser";
  const storeCurrency = "PKR";
  const categoriesRes = await getAllCategories(storeId);
  const { categories } = categoriesRes;
  const host = (await headers()).get("host");

  let initialProducts: any[] = [];
  if (host) {
    const fullStoreUrl = getUrlWithScheme(host);
    try {
      const response = await fetch(
        `${fullStoreUrl}/api/products?page=1&limit=500&mode=parts`,
        { next: { revalidate: 60 } }
      );
      if (response.ok) {
        const data = await response.json();
        initialProducts = Array.isArray(data?.products) ? data.products : [];
      }
    } catch (error) {
      console.error("Parts page initial products fetch failed:", error);
    }
  }

  return (
    <Layout>
      <div className="min-h-screen bg-slate-50/50">
        <div className="page-container py-8 lg:py-10">
          <EnhancedShopContent
            categories={categories}
            hideOnPage={true}
            storeCurrency={storeCurrency}
            initialProducts={initialProducts}
            necessary={{
              storeId,
              companyId,
            }}
            mode="parts"
          />
        </div>
      </div>
    </Layout>
  );
}

