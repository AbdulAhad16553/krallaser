export interface ItemPromotion {
  title: string;
  pricingRuleName: string;
  discountPercentage?: number;
  discountAmount?: number;
  couponRequired: boolean;
  validUpto?: string;
  applyOn: string;
}

export function getProductPromotion(product: any): ItemPromotion | null {
  if (product?.promotion) return product.promotion;

  const variations = product?.product_variations || product?.variants || [];
  for (const variation of variations) {
    if (variation?.promotion) return variation.promotion;
  }

  return null;
}

export function getPromotionLabel(promotion: ItemPromotion): string {
  if (promotion.title) return promotion.title;
  if (promotion.discountPercentage) return `${promotion.discountPercentage}% Off`;
  if (promotion.discountAmount) return `Save ${promotion.discountAmount}`;
  return "On Sale";
}

export function getPromotionShortLabel(promotion: ItemPromotion): string {
  if (promotion.discountPercentage) return `-${promotion.discountPercentage}%`;
  return getPromotionLabel(promotion);
}

export function getPromotionDescription(promotion: ItemPromotion): string {
  const parts: string[] = [];
  if (promotion.discountPercentage) {
    parts.push(`${promotion.discountPercentage}% discount`);
  } else if (promotion.discountAmount) {
    parts.push(`${promotion.discountAmount} off`);
  }
  if (promotion.couponRequired) {
    parts.push("apply coupon at checkout");
  }
  return parts.join(" · ");
}

/** Sale price after pricing-rule discount */
export function calculatePromotionalPrice(
  basePrice: number,
  promotion: ItemPromotion
): number {
  const base = Number(basePrice) || 0;
  if (base <= 0) return base;

  if (promotion.discountPercentage && promotion.discountPercentage > 0) {
    return (
      Math.round(base * (1 - promotion.discountPercentage / 100) * 100) / 100
    );
  }

  if (promotion.discountAmount && promotion.discountAmount > 0) {
    return Math.max(0, Math.round((base - promotion.discountAmount) * 100) / 100);
  }

  return base;
}

export function applyPromotionPricing<T extends Record<string, unknown>>(
  item: T,
  promotion: ItemPromotion
): T {
  const base = Number(
    item.base_price ?? item.price ?? item.sale_price ?? 0
  );
  if (base <= 0) {
    return { ...item, promotion };
  }

  const sale = calculatePromotionalPrice(base, promotion);
  if (sale >= base) {
    return { ...item, promotion };
  }

  return {
    ...item,
    promotion,
    base_price: base,
    sale_price: sale,
    price: sale,
  };
}

export function hasPromotionalPricing(product: any): boolean {
  const base = Number(product?.base_price ?? 0);
  const sale = Number(product?.sale_price ?? product?.price ?? 0);
  return base > 0 && sale > 0 && sale < base;
}

/** Promotion for badges — ERP rule or inferred from sale vs base price */
export function getDisplayPromotion(product: any): ItemPromotion | null {
  const existing = getProductPromotion(product);
  if (existing) return existing;

  const { base, sale, hasDiscount } = getProductPricePair(product);
  if (hasDiscount) {
    const discountPercentage =
      base > 0 ? Math.round((1 - sale / base) * 100) : undefined;

    return {
      title: discountPercentage ? `${discountPercentage}% Off` : "On Sale",
      pricingRuleName: "",
      discountPercentage,
      couponRequired: false,
      applyOn: "Item Code",
    };
  }

  const variations = product?.product_variations || product?.variants || [];
  for (const variation of variations) {
    if (variation?.promotion) return variation.promotion;

    const variationBase = Number(variation?.base_price ?? 0);
    const variationSale = Number(variation?.sale_price ?? variation?.price ?? 0);
    if (variationBase > 0 && variationSale > 0 && variationSale < variationBase) {
      const discountPercentage = Math.round(
        (1 - variationSale / variationBase) * 100
      );
      return {
        title: `${discountPercentage}% Off`,
        pricingRuleName: "",
        discountPercentage,
        couponRequired: false,
        applyOn: "Item Code",
      };
    }
  }

  return null;
}

/** Resolved base + sale for display (recalculates from promotion if needed). */
export function getProductPricePair(product: any): {
  base: number;
  sale: number;
  hasDiscount: boolean;
} {
  const promotion = getProductPromotion(product);
  let base = Number(product?.base_price ?? product?.price ?? 0);
  let sale = Number(product?.sale_price ?? product?.price ?? base);

  if (promotion && base > 0 && (sale >= base || sale <= 0)) {
    sale = calculatePromotionalPrice(base, promotion);
  }

  if (base <= 0 && sale > 0) base = sale;

  return {
    base,
    sale,
    hasDiscount: base > 0 && sale > 0 && sale < base,
  };
}

export function recalculateVariableProductPrices(product: any): any {
  const variations = product?.product_variations || product?.variants;
  if (!variations?.length) return product;

  const salePrices = variations
    .map((v: any) => Number(v.sale_price ?? v.base_price ?? 0))
    .filter((p: number) => p > 0);
  const basePrices = variations
    .map((v: any) => Number(v.base_price ?? 0))
    .filter((p: number) => p > 0);

  if (!salePrices.length) return product;

  const minSale = Math.min(...salePrices);
  const maxSale = Math.max(...salePrices);
  const maxBase = basePrices.length ? Math.max(...basePrices) : product.base_price;

  return {
    ...product,
    base_price: maxBase || product.base_price,
    sale_price: minSale,
    price: minSale,
    price_range: { min: minSale, max: maxSale },
  };
}
