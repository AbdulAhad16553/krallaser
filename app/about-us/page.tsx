import Hero from "@/modules/Hero";
import Layout from "@/components/Layout";
import AboutUsContent from "@/components/AboutUsContent";
import { getUrlWithScheme } from "@/lib/getUrlWithScheme";
import { headers } from "next/headers";
import { getAllCategories } from "@/hooks/getCategories";
import { getProducts } from "@/hooks/getProducts";

import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "About Krallaser | Metal Fiber Laser Importer Lahore",
  description:
    "Krallaser is a Lahore-based metal fiber laser cutting machine importer—1kW–3kW systems, sheet & tube, marking & welding, Cypcut/Weihong, spare parts. Not wood CNC routers.",
  path: "/about-us",
});

export default async function AboutUsPage() {
  const Headers = await headers();
  const host = Headers.get("host");

  if (!host) {
    throw new Error("Host header is missing or invalid");
  }

  const fullStoreUrl = getUrlWithScheme(host);
  const response = await fetch(`${fullStoreUrl}/api/fetchStore`);
  const data = await response.json();
  const storeId = data?.store?.stores[0].id;

  const { categories } = await getAllCategories(storeId);
  const { products } = await getProducts(storeId);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 bg-brand-tint/30 min-h-screen">
        <Hero
          hideOnPage={true}
          content={{
            title: "About Us",
            heroImage: undefined,
          }}
          storeData={data?.store?.stores[0]}
          categories={categories}
          products={products}
        />
        <AboutUsContent />
      </div>
    </Layout>
  );
}
