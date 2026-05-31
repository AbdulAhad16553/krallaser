import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from "next";
import ProductDetailContent from './ProductDetailContent';
import { ProductSkeleton } from '@/components/ui/product-skeleton';
import { fetchProductBySlug } from '@/lib/product/fetchProductBySlug';
import Layout from '@/components/Layout';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

import { getErpnextImageUrl } from "@/lib/erpnextImageUtils";
import {
  getProductDisplayName,
  productImageAlt,
  productMetaDescription,
  productMetadataTitle,
  productPageTitle,
} from "@/lib/productSeo";
import ProductPageJsonLd from "@/components/ProductPageJsonLd";
import { SITE_URL } from "@/lib/seo";

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const product = await fetchProductBySlug(slug);

  if (!product) {
    return {
      title: "Product Not Found",
      description: "The requested product could not be found.",
      alternates: { canonical: `/product/${encodeURIComponent(decodedSlug)}` },
    };
  }

  const productName = getProductDisplayName(product) || decodedSlug;
  const productTags: string[] = Array.isArray((product as any).tags) ? (product as any).tags : [];
  const productDescription =
    product.description?.trim() ||
    productMetaDescription(productName, product.item_group);
  const canonicalPath = `/product/${encodeURIComponent(decodedSlug)}`;
  const imagePath =
    (product as { website_image?: string }).website_image || product.image;
  const imageUrl =
    imagePath && getErpnextImageUrl(imagePath) !== "/placeholder.svg"
      ? getErpnextImageUrl(imagePath)
      : `${SITE_URL}/krallogo.svg`;
  const imageAlt = productImageAlt(productName);

  return {
    title: productMetadataTitle(productName),
    description: productDescription,
    keywords: [
      productName,
      product.item_group,
      ...productTags,
      "Krallaser",
      "laser cutting machine Pakistan",
      "laser cutter parts",
      "Lahore",
    ].filter(Boolean),
    alternates: {
      canonical: `${SITE_URL}${canonicalPath}`,
    },
    openGraph: {
      type: "website",
      title: productPageTitle(productName),
      description: productDescription,
      url: `${SITE_URL}${canonicalPath}`,
      siteName: "Krallaser",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 1200,
          alt: imageAlt,
          type: "image/jpeg",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: productPageTitle(productName),
      description: productDescription,
      images: { url: imageUrl, alt: imageAlt },
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  return (
    <Layout>
      <div className="min-h-screen bg-neutral-50">
        <Suspense fallback={<ProductSkeleton />}>
          <ProductDetailContentWithData slug={slug} />
        </Suspense>
      </div>
    </Layout>
  );
}

async function ProductDetailContentWithData({ slug }: { slug: string }) {
  const product = await fetchProductBySlug(slug);
  if (!product) notFound();
  return (
    <>
      <ProductPageJsonLd product={product} />
      <ProductDetailContent slug={slug} initialProduct={product} />
    </>
  );
}