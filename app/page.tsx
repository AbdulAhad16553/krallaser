import Hero from "@/modules/Hero";
import Categories from "@/modules/Categories";
import HomeProducts from "@/components/Products/HomeProducts";
import { headers } from "next/headers";
import { getUrlWithScheme } from "@/lib/getUrlWithScheme";
import Layout from "@/components/Layout";
import { getCategories } from "@/hooks/getCategories";
import { getStorePage } from "@/hooks/getStorePage";

export async function generateMetadata() {
  const Headers = await headers();
  const host = Headers.get("host");
  if (!host) {
    throw new Error("Host header is missing or invalid");
  }

  const fullStoreUrl = getUrlWithScheme(host);
  const response = await fetch(`${fullStoreUrl}/api/fetchStore`);
  const data = await response.json();

  const { page } = await getStorePage(data?.store?.stores[0].id, "home");

  return {
    title: page?.meta_title || "Items.pk",
    description: page?.meta_description || "Manage your online store, inventory, and sales all in one place",
    generator: data?.store?.stores?.[0]?.store_name,
    applicationName: data?.store?.stores?.[0]?.store_name,
    keywords: "",
    // metadataBase: ,
  };
}

export default async function Home() {
  const Headers = await headers();
  const host = Headers.get("host");
  if (!host) {
    throw new Error("Host header is missing or invalid");
  }

  const fullStoreUrl = getUrlWithScheme(host);

  const response = await fetch(`${fullStoreUrl}/api/fetchStore`);
  const data = await response.json();
  console.log("data", data);
  const storeId = data?.store?.stores[0].id;
  const companyId = data?.store?.stores[0].company_id;

  const storeCurrency = data?.store?.stores[0].store_detail?.currency
    ? data?.store?.stores[0].store_detail?.currency
    : "Rs.";

  const { categories } = await getCategories(storeId);
  const { page } = await getStorePage(storeId, "home");

  return (
    <Layout>
      <Hero
        content={{
          title: page?.title,
          content: page?.content,
          heroImage: undefined,
        }}
        storeData={data?.store?.stores[0]}
        categories={categories}
        products={[]}
        hideOnPage={false}
      />
      <div className="container mx-auto px-4 py-8">
        <Categories categories={categories} hideOnPage={false} subcat={false} />
        <HomeProducts
          companyId={companyId}
          storeId={storeId}
          storeCurrency={storeCurrency}
          className="w-full"
        />
      </div>
    </Layout>
  );
}
