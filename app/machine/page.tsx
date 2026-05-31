import Layout from "@/components/Layout";
import EnhancedShopContent from "@/modules/ShopContent/EnhancedShopContent";
import { getAllCategories } from "@/hooks/getCategories";
import { buildPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = buildPageMetadata({
  title: "1kW–3kW Fiber Laser Machines for Sale in Pakistan",
  description:
    "Buy 1kW, 2kW & 3kW Chinese fiber lasers in Pakistan from Krallaser—Cypcut, Weihong, Raycus/MAX. Sheet & tube, marking & welding machines. Single-phase options. Lahore import support.",
  path: "/machine",
  keywords: [
    "1kW fiber laser price Pakistan",
    "2kW fiber laser price Pakistan",
    "3kW fiber laser Pakistan",
    "Chinese fiber laser importer",
    "single phase fiber laser",
    "sheet and tube laser",
    "laser marking machine Pakistan",
    "laser welding machine Pakistan",
    "Cypcut fiber laser",
    "Weihong laser machine",
  ],
});

export default async function MachinePage() {
  const storeId = "default-store";
  const companyId = "Krallaser";
  const storeCurrency = "PKR";
  const categoriesRes = await getAllCategories(storeId);
  const { categories } = categoriesRes;

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
            mode="machine"
          />
        </div>
      </div>
    </Layout>
  );
}

