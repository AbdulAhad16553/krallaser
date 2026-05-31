import Layout from "@/components/Layout";
import EnhancedShopContent from "@/modules/ShopContent/EnhancedShopContent";
import { getAllCategories } from "@/hooks/getCategories";
import { buildPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = buildPageMetadata({
  title: "Shop Laser Cutting Machines & Parts",
  description:
    "Shop laser cutting machines, lenses, nozzles, chillers, and laser cutter spare parts at Krallaser Pakistan. Online catalog with Lahore support.",
  path: "/shop",
});

export default async function ShopPage() {
  const storeId = "default-store";
  const companyId = "Krallaser";
  const storeCurrency = "PKR";

  const { categories } = await getAllCategories(storeId);

  return (
    <Layout>
      <div className="min-h-screen bg-slate-50/50">
        <div className="page-container py-8 lg:py-10">
          <EnhancedShopContent
          categories={categories}
          hideOnPage={true}
          storeCurrency={storeCurrency}
          necessary={{
            storeId,
            companyId,
          }}
        />
        </div>
      </div>
    </Layout>
  );
}
