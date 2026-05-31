import Hero from "@/modules/Hero";
import HeroAnimationWrapper from "@/components/HeroAnimationWrapper";
import AnimatedSection from "@/components/AnimatedSection";
import { CategoryStrip } from "@/components/CategoryStrip";
import { NeedHelpSection } from "@/components/NeedHelpSection";
import { ResourceLinks } from "@/components/ResourceLinks";
import { NewsletterSection } from "@/components/NewsletterSection";
import AEOFAQSection from "@/components/AEOFAQSection";
import HomeSeoIntro from "@/components/HomeSeoIntro";
import JsonLd from "@/components/JsonLd";
import { headers } from "next/headers";
import { getUrlWithScheme } from "@/lib/getUrlWithScheme";
import { Suspense } from "react";
import Layout from "@/components/Layout";
import HomeProducts from "@/components/Products/HomeProducts";
import ProductSkeleton from "@/common/Skeletons/Products";
import { getCategories } from "@/hooks/getCategories";
import { getStorePage } from "@/hooks/getStorePage";
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_KEYWORDS,
  DEFAULT_TITLE,
  SITE_URL,
  buildWebPageSchema,
} from "@/lib/seo";

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
  const rawTitle = page?.meta_title?.trim();
  const rawDescription = page?.meta_description?.trim();
  const isGenericHomeTitle =
    !rawTitle ||
    /^home\s*-\s*store\s*page$/i.test(rawTitle) ||
    /^home$/i.test(rawTitle);
  const isGenericHomeDescription =
    !rawDescription ||
    /^home\s*-\s*store\s*page$/i.test(rawDescription);

  const title = isGenericHomeTitle ? DEFAULT_TITLE : rawTitle;
  const description = isGenericHomeDescription ? DEFAULT_DESCRIPTION : rawDescription;

  return {
    title: isGenericHomeTitle ? { absolute: DEFAULT_TITLE } : title,
    description,
    alternates: { canonical: SITE_URL },
    generator: data?.store?.stores?.[0]?.store_name || "Krallaser",
    applicationName: data?.store?.stores?.[0]?.store_name || "Krallaser",
    keywords: DEFAULT_KEYWORDS.join(", "),
    openGraph: {
      title,
      description,
      url: SITE_URL,
      siteName: "Krallaser",
      type: "website",
      locale: "en_PK",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export default async function Home() {
  const Headers = await headers();
  const host = Headers.get("host");
  if (!host) {
    throw new Error("Host header is missing or invalid");
  }

  const fullStoreUrl = getUrlWithScheme(host);

  const response = await fetch(`${fullStoreUrl}/api/fetchStore`, { next: { revalidate: 300 } });
  const data = await response.json();
  const storeId = data?.store?.stores[0].id;
  const companyId = data?.store?.stores[0].company_id;

  const storeCurrency = data?.store?.stores[0].store_detail?.currency
    ? data?.store?.stores[0].store_detail?.currency
    : "Rs.";

  const { categories } = await getCategories(storeId);
  const { page } = await getStorePage(storeId, "home");

  const normalizeImagePath = (path?: string | null) => {
    if (!path) return undefined;
    const withoutDomain = path.replace(/^https?:\/\/[^/]+/i, "");
    if (withoutDomain.startsWith("/files/")) return withoutDomain;
    return `/files/${withoutDomain.replace(/^\/?files?\//i, "")}`;
  };

  const normalizeImages = (images: any[] | undefined) => {
    if (!images || images.length === 0) return [];
    return images.map((img, idx) => ({
      ...img,
      image_id: normalizeImagePath(img?.image_id || img?.image || img) || img,
      position: img?.position || (idx === 0 ? "featured" : idx + 1),
    }));
  };

  const buildVariations = (product: any) => {
    const variants =
      product?.product_variations ||
      product?.variants ||
      [];
    if (!variants || variants.length === 0) return [];

    return variants.map((variant: any) => {
      const vPrice =
        Number(variant.sale_price) ||
        Number(variant.base_price) ||
        Number(variant.price) ||
        Number(variant.standard_rate) ||
        0;
      return {
        ...variant,
        id: variant.id || variant.name,
        sku: variant.sku || variant.name,
        name: variant.item_name || variant.name,
        base_price: vPrice,
        sale_price: vPrice,
        price: vPrice,
        standard_rate: vPrice,
      };
    });
  };

  const buildFeaturedProductPayload = (product: any) => {
    const product_variations = buildVariations(product);
    const variationPrices = product_variations
      .map((v: any) => Number(v.base_price) || 0)
      .filter((p: number) => p > 0);
    const maxVariationPrice =
      variationPrices.length > 0 ? Math.max(...variationPrices) : 0;

    const basePrice =
      maxVariationPrice ||
      Number(product?.price) ||
      Number(product?.standard_rate) ||
      Number(product?.base_price) ||
      Number(product?.sale_price) ||
      0;

    let product_images =
      normalizeImages(product?.product_images) ||
      [];
    if (product_images.length === 0 && (product?.website_image || product?.image)) {
      const singlePath = normalizeImagePath(product.website_image || product.image);
      if (singlePath) {
        product_images = [{ image_id: singlePath, position: "featured" }];
      }
    }

    return {
      ...product,
      id: product?.id || product?.name,
      name: product?.item_name || product?.name,
      short_description: product?.short_description || product?.description,
      description: product?.description,
      slug: product?.slug || product?.item_code || product?.name,
      sku: product?.sku || product?.item_code || product?.name,
      base_price: basePrice,
      sale_price: basePrice,
      currency: product?.currency || storeCurrency,
      product_variations,
      product_images,
      /** From /api/products — use for instant card preview (no batch-image API) */
      image_url: product?.image_url,
    };
  };

  const catalogLimit = 100;
  let featuredProduct = null;
  const homeProducts: any[] = [];
  let homeCatalogTotalProducts = 0;

  try {
    const firstResponse = await fetch(
      `${fullStoreUrl}/api/products?page=1&limit=${catalogLimit}`,
      { next: { revalidate: 60 } }
    );

    if (firstResponse.ok) {
      const firstData = await firstResponse.json();
      const products = firstData.products || [];
      homeCatalogTotalProducts =
        Number(firstData.pagination?.totalProducts) || products.length;
      const normalizedProducts = products.map(buildFeaturedProductPayload);
      homeProducts.push(...normalizedProducts);
      if (normalizedProducts.length > 0) {
        featuredProduct =
          normalizedProducts[
            Math.floor(Math.random() * normalizedProducts.length)
          ];
      }
    }
  } catch (error) {
    console.error("Error fetching home catalog:", error);
  }

  // Fallback to empty product if nothing found
  if (!featuredProduct) {
    featuredProduct = {
      id: "no-product",
      name: "No Product Available",
      short_description: "Products will appear here once added.",
      description: "Products will appear here once added.",
      slug: "no-product",
      sku: "no-product",
      base_price: 0,
      sale_price: 0,
      currency: storeCurrency,
      product_variations: [],
      product_images: [],
    };
  }
  // Ensure we always have something to show in the products grid
  const initialHomeProducts =
    homeProducts.length > 0 ? homeProducts : featuredProduct ? [featuredProduct] : [];

  return (
    <Layout>
      {/* Mobile home: site header + product grid */}
      <div className="page-container md:hidden py-4 pb-6">
        <Suspense fallback={<ProductSkeleton />}>
          <HomeProducts
            companyId={companyId}
            storeId={storeId}
            storeCurrency={storeCurrency}
            initialProducts={initialHomeProducts}
            className="w-full"
            productLimit={100}
            sectionTitle="All products"
            sectionSubtitle="Browse our catalog"
            mobileInfiniteScroll
            mobileBatchSize={12}
            catalogTotalProducts={homeCatalogTotalProducts}
            catalogFetchLimit={catalogLimit}
            mobileCatalogSearch
          />
        </Suspense>
      </div>

      <div className="hidden md:block">
        <HeroAnimationWrapper>
          <Hero
            content={{
              title: "Laser Technology That Defines Excellence",
              content: "At Krallaser, we import metal fiber laser cutting machines and genuine spare parts—1kW–3kW systems for steel and aluminum fabrication across Pakistan.",
              heroImage: undefined,
            }}
            storeData={data?.store?.stores[0]}
            categories={categories}
            products={featuredProduct ? [featuredProduct] : []}
            hideOnPage={false}
            homeFeaturedProducts={{
              companyId,
              storeId,
              storeCurrency,
              initialProducts: initialHomeProducts,
            }}
            homeFeaturedProductLimit={8}
          />
        </HeroAnimationWrapper>

        {/* Category strip - CNC Tooling Shop style */}
        <div className="bg-white page-container py-12 lg:py-14 border-b border-[var(--secondary-color)]/10">
          <AnimatedSection delay={0.05}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Shop by Category</h2>
            </div>
            <CategoryStrip categories={categories || []} />
          </AnimatedSection>
        </div>

        {/* Need help + Resource links */}
        <div className="bg-brand-tint page-container py-12 lg:py-14">
          <AnimatedSection delay={0.08}>
            <NeedHelpSection />
          </AnimatedSection>
          <AnimatedSection delay={0.1}>
            <div className="mt-12">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Resources</h2>
              <ResourceLinks />
            </div>
          </AnimatedSection>
        </div>

        <HomeSeoIntro />

        <JsonLd
          data={buildWebPageSchema({
            name: DEFAULT_TITLE,
            description: DEFAULT_DESCRIPTION,
            url: SITE_URL,
          })}
        />

        <AEOFAQSection />

        {/* Newsletter */}
        <div className="page-container py-12 lg:py-14">
          <NewsletterSection />
        </div>
      </div>
    </Layout>
  );
}
