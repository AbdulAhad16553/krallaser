import { cache } from "react";
import { erpnextClient } from '@/lib/erpnext/erpnextClient';
import { attachProductStockFromErp } from '@/lib/product/attachProductStock';
import { productCache } from '@/lib/cache';
import { parseErpTags } from '@/lib/erpnext/tags';
import {
  attachPromotionToProduct,
  getActivePromotionsByItemCode,
} from '@/lib/erpnext/services/pricingRuleService';
import { normalizeProductPricing } from '@/lib/promotionUtils';

function withListPrices(product: any) {
  const list =
    Number(product.price) ||
    Number(product.standard_rate) ||
    Number(product.base_price) ||
    0;

  const variants = Array.isArray(product.variants)
    ? product.variants.map((v: any) => {
        const vList =
          Number(v.price) ||
          Number(v.standard_rate) ||
          Number(v.base_price) ||
          0;
        return {
          ...v,
          id: v.name,
          sku: v.name,
          item_code: v.name,
          base_price: vList,
          sale_price: vList,
          standard_rate: Number(v.standard_rate) || vList,
          price: vList,
        };
      })
    : product.variants;

  return {
    ...product,
    id: product.name,
    sku: product.name,
    item_code: product.name,
    item_group: product.item_group,
    base_price: list,
    sale_price: list,
    standard_rate: Number(product.standard_rate) || list,
    price: list,
    variants,
  };
}

async function fetchProductBySlugUncached(slug: string) {
  const itemCode = decodeURIComponent(slug);
  const cacheKey = `product-detail-v2:${itemCode}`;
  const cached = productCache.get(cacheKey);
  if (cached) return cached;

  const [response, attachRes, promotions] = await Promise.all([
    erpnextClient.getFullProductDetails(itemCode),
    erpnextClient.getItemAttachments(itemCode).catch(() => ({ data: [] })),
    getActivePromotionsByItemCode(),
  ]);

  if (!response.data) return null;

  const product = response.data;
  product.attachments = attachRes?.data ?? [];
  product.tags = parseErpTags((product as any)._user_tags);

  await attachProductStockFromErp(product, itemCode);

  const productWithPromotion = normalizeProductPricing(
    attachPromotionToProduct(withListPrices(product), promotions)
  );

  // Keep a short hot-cache for repeated PDP navigations.
  productCache.set(cacheKey, productWithPromotion, 2 * 60 * 1000);

  return productWithPromotion;
}

/** Dedupes ERP work when generateMetadata and the page both request the same slug in one render. */
export const fetchProductBySlug = cache(fetchProductBySlugUncached);
