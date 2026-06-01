import Layout from "@/components/Layout";
import EnhancedShopContent from "@/modules/ShopContent/EnhancedShopContent";
import { buildPageMetadata } from "@/lib/seo";
import { prefetchCatalogProducts } from "@/lib/prefetchCatalogProducts";
import { headers } from "next/headers";

export const revalidate = 60;

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
  const host = (await headers()).get("host");
  const initialProducts = host
    ? await prefetchCatalogProducts(host, { mode: "machine", limit: 48 })
    : [];

  return (
    <Layout>
      <div className="min-h-screen bg-slate-50/50">
        <div className="page-container py-8 lg:py-10">
          <EnhancedShopContent
            categories={[]}
            hideOnPage={true}
            storeCurrency={storeCurrency}
            initialProducts={initialProducts}
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

