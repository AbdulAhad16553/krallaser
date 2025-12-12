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

    const product_images =
      normalizeImages(product?.product_images) ||
      [];

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
    };
  };

  // Fetch products and pick a random one each request
  const limit = 12;
  let featuredProduct = null;
  const homeProducts: any[] = [];

  try {
    const firstResponse = await fetch(
      `${fullStoreUrl}/api/products?page=1&limit=${limit}`,
      { cache: "no-store" }
    );

    if (firstResponse.ok) {
      const firstData = await firstResponse.json();
      const products = firstData.products || [];
      const normalizedProducts = products.map(buildFeaturedProductPayload);
      homeProducts.push(...normalizedProducts.slice(0, 8));
      const totalProducts =
        firstData.pagination?.totalProducts || products.length || 0;

      const randomIndex = totalProducts > 0 ? Math.floor(Math.random() * totalProducts) : 0;
      const targetPage = Math.max(1, Math.floor(randomIndex / limit) + 1);
      const targetIndex = randomIndex % limit;

      if (targetPage === 1 || totalProducts <= products.length) {
        const chosen = normalizedProducts[Math.min(targetIndex, normalizedProducts.length - 1)];
        if (chosen) {
          featuredProduct = chosen;
        }
      } else {
        // Fetch the target page to pick that product
        const pageResponse = await fetch(
          `${fullStoreUrl}/api/products?page=${targetPage}&limit=${limit}`,
          { cache: "no-store" }
        );
        if (pageResponse.ok) {
          const pageData = await pageResponse.json();
          const pageProducts = pageData.products || [];
          const normalizedPageProducts = pageProducts.map(buildFeaturedProductPayload);
          const chosen = normalizedPageProducts[Math.min(targetIndex, normalizedPageProducts.length - 1)];
          if (chosen) {
            featuredProduct = chosen;
          }
          // Only fill home products if we didn't get any from the first page
          if (homeProducts.length === 0) {
            homeProducts.push(...normalizedPageProducts.slice(0, 8));
          }
        }
      }
    }
  } catch (error) {
    console.error("Error fetching random hero product:", error);
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
      <Hero
        content={{
          title: "Laser Technology That Defines Excellence",
          content: "At Kral Laser, we combine cutting-edge technology with unmatched craftsmanship to deliver precise, flawless laser cutting for metal, wood, acrylic, and more. From intricate custom designs to high-volume industrial production, we bring your ideas to life with speed, accuracy, and style.",
          heroImage: undefined,
        }}
        storeData={data?.store?.stores[0]}
        categories={categories}
        products={featuredProduct ? [featuredProduct] : []}
        hideOnPage={false}
      />
      <div className="container mx-auto px-4 py-8">
        <Categories categories={categories?.slice(0, 4) || []} hideOnPage={false} subcat={false} />
        <HomeProducts
          companyId={companyId}
          storeId={storeId}
          storeCurrency={storeCurrency}
          initialProducts={initialHomeProducts}
          className="w-full"
        />
      </div>
    </Layout>
  );
}
