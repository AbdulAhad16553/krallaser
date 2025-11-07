import Content from "@/common/Content";
import Hero from "@/modules/Hero";
import Layout from "@/components/Layout";
import { getStorePage } from "@/hooks/getStorePage";
import { getUrlWithScheme } from "@/lib/getUrlWithScheme";
import { headers } from "next/headers";
import React from "react";
import { getAllCategories } from "@/hooks/getCategories";
import { getProducts } from "@/hooks/getProducts";

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
  
  // Fetch all required data
  const { page } = await getStorePage(storeId, "about-us");
  const { categories } = await getAllCategories(storeId);
  const { products } = await getProducts(storeId);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <Hero
          hideOnPage={true}
          content={{
            title: page?.title,
            heroImage: undefined
          }}
          storeData={data?.store?.stores[0]}
          categories={categories}
          products={products}
        />
        <Content content={page?.content || ''} />
      </div>
    </Layout>
  );
};
