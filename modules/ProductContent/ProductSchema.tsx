"use client";

import React from "react";
import Script from "next/script";
import { BRAND_NAME, SITE_URL } from "@/lib/brand";
import { getErpnextImageUrl } from "@/lib/erpnextImageUtils";
import {
  getProductDisplayName,
  productMetaDescription,
  productPageTitle,
} from "@/lib/productSeo";

interface ProductSchemaProps {
  product: any;
  storeCurrency: string;
  storeData: any;
}

const ProductSchema = ({ product, storeCurrency, storeData }: ProductSchemaProps) => {
  if (!product) return null;

  const productName = getProductDisplayName(product);
  const slug = encodeURIComponent(product.slug || product.sku || product.name);
  const productUrl = `${SITE_URL}/product/${slug}`;

  const featuredImage = product.product_images?.find(
    (img: any) => img.position === "featured"
  );

  const imageUrls: string[] = [];
  if (featuredImage?.image_id) {
    const storageBase = process.env.NEXT_PUBLIC_NHOST_STORAGE_URL;
    if (storageBase) {
      imageUrls.push(`${storageBase}/files/${featuredImage.image_id}`);
    }
  }
  const erpPath = product.website_image || product.image;
  if (erpPath) {
    const url = getErpnextImageUrl(erpPath);
    if (url && url !== "/placeholder.svg" && !imageUrls.includes(url)) {
      imageUrls.push(url);
    }
  }
  if (product.image_url && !imageUrls.includes(product.image_url)) {
    imageUrls.push(
      product.image_url.startsWith("http")
        ? product.image_url
        : `${SITE_URL}${product.image_url}`
    );
  }
  if (imageUrls.length === 0) {
    imageUrls.push(`${SITE_URL}/krallogo.svg`);
  }

  const imageLabel = productPageTitle(productName);
  const currency =
    product.currency?.split(" - ")[0] ||
    (storeCurrency === "Rs." ? "PKR" : storeCurrency) ||
    "PKR";

  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: productName,
    description:
      product.short_description ||
      product.detailed_desc ||
      product.description ||
      productMetaDescription(productName, product.item_group),
    sku: product.sku || product.item_code,
    url: productUrl,
    brand: {
      "@type": "Brand",
      name: storeData?.store_name || BRAND_NAME,
    },
    image: imageUrls.map((url) => ({
      "@type": "ImageObject",
      url,
      name: imageLabel,
      caption: imageLabel,
    })),
    offers: {
      "@type": "Offer",
      url: productUrl,
      price: product.sale_price ?? product.base_price ?? product.price,
      priceCurrency: currency,
      availability: "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: storeData?.store_name || BRAND_NAME,
        url: SITE_URL,
      },
      priceValidUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
    },
    category: product.item_group || "Laser cutting machines and parts",
    keywords: Array.isArray((product as any).tags)
      ? (product as any).tags.join(", ")
      : `Krallaser, laser cutting machine, laser parts, Pakistan, ${productName}`,
  };

  return (
    <Script
      id="product-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema),
      }}
    />
  );
};

export default ProductSchema;
