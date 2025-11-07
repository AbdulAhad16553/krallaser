import type { Metadata } from "next";
import Layout from "@/components/Layout";
import EnhancedShopContent from "@/modules/ShopContent/EnhancedShopContent";
import { headers } from "next/headers";
import { getUrlWithScheme } from "@/lib/getUrlWithScheme";
import { getAllCategories } from "@/hooks/getCategories";

export const metadata: Metadata = {
  title: "Shop | Elegant Emporium",
  description: "Discover our curated collection of premium products",
};

export default async function ShopPage() {
  const Headers = await headers();
  const host = Headers.get("host");
  if (!host) {
    throw new Error("Host header is missing or invalid");
  }

  const fullStoreUrl = getUrlWithScheme(host);

  const response = await fetch(`${fullStoreUrl}/api/fetchStore`);
  const data = await response.json();

  const storeId = data?.store?.stores[0].id;
  const companyId = data?.store?.stores[0].company_id;
  const storeCurrency = data?.store?.stores[0].store_detail?.currency
    ? data?.store?.stores[0].store_detail?.currency
    : "Rs.";

  const { categories } = await getAllCategories(storeId);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
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
    </Layout>
  );
}
