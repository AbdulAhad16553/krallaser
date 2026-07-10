"use client";

import { saveListingScrollPosition } from "@/lib/listScrollRestoration";

export const getProductSlug = (product: any): string =>
  encodeURIComponent(product?.sku || product?.id || product?.name || "");

/** Same storage key whether Next passes a decoded segment or an encoded one */
export const canonicalProductSlugKey = (slug: string): string => {
  if (!slug) return "";
  try {
    return encodeURIComponent(decodeURIComponent(slug));
  } catch {
    return encodeURIComponent(slug);
  }
};

const previewKey = (slug: string) => `product-preview:${canonicalProductSlugKey(slug)}`;

export const buildProductPreview = (product: any) => {
  const itemCode = product?.sku || product?.id || product?.name;
  const base = Number(
    product?.base_price ?? product?.standard_rate ?? product?.price ?? 0
  );
  const sale = Number(
    product?.sale_price ?? product?.price ?? base
  );
  return {
    name: itemCode,
    item_name: product?.name || product?.item_name || itemCode,
    item_group: product?.item_group || "",
    stock_uom: product?.stock_uom || "Nos",
    description: product?.detailed_desc || product?.short_description || product?.description || "",
    price: sale > 0 ? sale : base,
    base_price: base,
    sale_price: sale > 0 ? sale : base,
    standard_rate: Number(product?.standard_rate ?? base) || base,
    currency: product?.currency || "PKR",
    image: product?.product_images?.[0]?.image_id || product?.image || undefined,
    custom_quotation_item: product?.custom_quotation_item,
    stock: product?.stock || null,
    tags: Array.isArray(product?.tags) ? product.tags : [],
    promotion: product?.promotion || undefined,
    variants: Array.isArray(product?.product_variations || product?.variants)
      ? (product?.product_variations || product?.variants).map((v: any) => {
          const vBase = Number(v?.base_price ?? v?.standard_rate ?? v?.price ?? 0);
          const vSale = Number(v?.sale_price ?? v?.price ?? vBase);
          return {
            name: v?.sku || v?.id || v?.name,
            item_name: v?.name || v?.item_name || v?.sku || "",
            price: vSale > 0 ? vSale : vBase,
            base_price: vBase,
            sale_price: vSale > 0 ? vSale : vBase,
            standard_rate: Number(v?.standard_rate ?? vBase) || vBase,
            currency: product?.currency || "PKR",
            image: v?.image || undefined,
            stock: v?.stock || null,
            promotion: v?.promotion || product?.promotion || undefined,
            attributes: Array.isArray(v?.attributes) ? v.attributes : [],
          };
        })
      : [],
  };
};

export const saveProductPreview = (slug: string, product: any) => {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(previewKey(slug), JSON.stringify(buildProductPreview(product)));
  } catch {}
};

export const getSavedProductPreview = (slug: string) => {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(previewKey(slug));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const warmProductNavigation = (
  router: any,
  product: any,
  options?: { recordListScrollForBack?: boolean }
) => {
  const slug = getProductSlug(product);
  if (!slug) return;
  if (options?.recordListScrollForBack) {
    saveListingScrollPosition();
  }
  saveProductPreview(slug, product);
  try {
    router?.prefetch?.(`/product/${slug}`);
  } catch {}
  fetch(`/api/product/${slug}`).catch(() => undefined);
};

