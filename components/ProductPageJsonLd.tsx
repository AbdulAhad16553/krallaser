import JsonLd from "@/components/JsonLd";
import { BRAND_NAME, SITE_URL } from "@/lib/brand";
import { getErpnextImageUrl } from "@/lib/erpnextImageUtils";
import {
  buildBreadcrumbSchema,
  buildWebPageSchema,
} from "@/lib/seo";
import { getProductDisplayName, productMetaDescription } from "@/lib/productSeo";

type ProductJsonLdProps = {
  product: {
    item_name?: string;
    name?: string;
    slug?: string;
    sku?: string;
    item_code?: string;
    description?: string;
    short_description?: string;
    item_group?: string;
    image?: string;
    website_image?: string;
    image_url?: string;
    sale_price?: number;
    base_price?: number;
    price?: number;
    currency?: string;
    product_images?: Array<{ image_id?: string; position?: string }>;
  };
  storeCurrency?: string;
};

export default function ProductPageJsonLd({
  product,
  storeCurrency = "PKR",
}: ProductJsonLdProps) {
  const productName = getProductDisplayName(product);
  const slug = encodeURIComponent(
    product.slug || product.sku || product.item_code || product.name || ""
  );
  const productUrl = `${SITE_URL}/product/${slug}`;

  const imageUrls: string[] = [];
  const erpPath = product.website_image || product.image;
  if (erpPath) {
    const url = getErpnextImageUrl(erpPath);
    if (url && url !== "/placeholder.svg") imageUrls.push(url);
  }
  if (product.image_url) {
    imageUrls.push(
      product.image_url.startsWith("http")
        ? product.image_url
        : `${SITE_URL}${product.image_url}`
    );
  }
  const featured = product.product_images?.find((i) => i.position === "featured");
  if (featured?.image_id && process.env.NEXT_PUBLIC_NHOST_STORAGE_URL) {
    imageUrls.push(
      `${process.env.NEXT_PUBLIC_NHOST_STORAGE_URL}/files/${featured.image_id}`
    );
  }
  if (imageUrls.length === 0) imageUrls.push(`${SITE_URL}/krallogo.svg`);

  const currency =
    product.currency?.split(" - ")[0] ||
    (storeCurrency === "Rs." ? "PKR" : storeCurrency) ||
    "PKR";

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: productName,
    description:
      product.short_description ||
      product.description ||
      productMetaDescription(productName, product.item_group),
    sku: product.sku || product.item_code || product.name,
    url: productUrl,
    image: imageUrls.map((url) => ({
      "@type": "ImageObject",
      url,
      name: productName,
      caption: productName,
    })),
    brand: { "@type": "Brand", name: BRAND_NAME },
    offers: {
      "@type": "Offer",
      url: productUrl,
      price: product.sale_price ?? product.base_price ?? product.price ?? 0,
      priceCurrency: currency,
      availability: "https://schema.org/InStock",
      seller: { "@type": "Organization", name: BRAND_NAME, url: SITE_URL },
    },
  };

  return (
    <JsonLd
      data={[
        buildWebPageSchema({
          name: productName,
          description: productMetaDescription(productName, product.item_group),
          url: productUrl,
        }),
        buildBreadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Shop", path: "/shop" },
          { name: productName, path: `/product/${slug}` },
        ]),
        productSchema,
      ]}
    />
  );
}
