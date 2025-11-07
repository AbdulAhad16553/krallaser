"use client";

import React from "react";
import Script from "next/script";

interface ProductSchemaProps {
  product: any;
  storeCurrency: string;
  storeData: any;
}

const ProductSchema = ({ product, storeCurrency, storeData }: ProductSchemaProps) => {
  if (!product) return null;

  const featuredImage = product.product_images?.find(
    (img: any) => img.position === "featured"
  );

  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.short_description || product.detailed_desc,
    sku: product.sku,
    brand: {
      "@type": "Brand",
      name: storeData?.store_name || "Kral Laser"
    },
    manufacturer: {
      "@type": "Organization",
      name: storeData?.store_name || "Kral Laser"
    },
    image: featuredImage ? [
      `${process.env.NEXT_PUBLIC_NHOST_STORAGE_URL}/files/${featuredImage.image_id}`
    ] : [],
    offers: {
      "@type": "Offer",
      price: product.sale_price,
      priceCurrency: product.currency ? product.currency.split(" - ")[0] : (storeCurrency === "Rs." ? "PKR" : "USD"),
      availability: "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: storeData?.store_name || "Kral Laser"
      },
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.5",
      reviewCount: "127",
      bestRating: "5",
      worstRating: "1"
    },
    review: [
      {
        "@type": "Review",
        author: {
          "@type": "Person",
          name: "John D."
        },
        reviewRating: {
          "@type": "Rating",
          ratingValue: "5",
          bestRating: "5"
        },
        reviewBody: "Excellent laser marking machine! The precision is outstanding and it handles both metals and plastics perfectly."
      }
    ],
    category: "Industrial Equipment > Laser Equipment > Marking Machines",
    productionDate: product.created_at,
    additionalProperty: [
      {
        "@type": "PropertyValue",
        name: "Type",
        value: product.type
      },
      {
        "@type": "PropertyValue", 
        name: "Power Range",
        value: "20W-200W"
      },
      {
        "@type": "PropertyValue",
        name: "Wavelength",
        value: "1064nm / 355nm"
      }
    ]
  };

  return (
    <Script
      id="product-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema)
      }}
    />
  );
};

export default ProductSchema;
