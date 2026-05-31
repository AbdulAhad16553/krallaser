import Categories from "@/modules/Categories";
import Layout from "@/components/Layout";
import { getAllCategories } from "@/hooks/getCategories";
import { getUrlWithScheme } from "@/lib/getUrlWithScheme";
import { buildPageMetadata } from "@/lib/seo";
import { headers } from "next/headers";
import React from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata = buildPageMetadata({
  title: "Laser Machine & Parts Categories",
  description:
    "Browse categories of laser cutting machines, parts, lenses, nozzles, and accessories at Krallaser Pakistan.",
  path: "/category",
});

const AllCategories = async () => {
  const Headers = await headers();
  const host = Headers.get("host");

  if (!host) {
    throw new Error("Host header is missing or invalid");
  }

  const fullStoreUrl = getUrlWithScheme(host);
  const response = await fetch(`${fullStoreUrl}/api/fetchStore`, { next: { revalidate: 300 } });
  const data = await response.json();
  const storeId = data?.store?.stores[0].id;

  const { categories } = await getAllCategories(storeId);

  return (
    <Layout>
      <div className="min-h-screen bg-white">
        <div className="page-container py-8 lg:py-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Shop by category
              </h1>
              <p className="mt-2 text-muted-foreground">
                Laser cutting machines, parts, and accessories
              </p>
            </div>
            <Link href="/shop">
              <Button variant="outline" className="gap-2">
                View all products
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <Categories categories={categories} hideOnPage={false} subcat={false} />
        </div>
      </div>
    </Layout>
  );
};

export default AllCategories;
