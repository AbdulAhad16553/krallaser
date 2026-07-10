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

/**
 * Original list price before promo.
 * After applyPromotionPricing, `price` is set to the sale amount — never treat that as list.
 */
export function resolveListPrice(item: any): number {
  const base = Number(item?.base_price ?? 0);
  const sale = Number(item?.sale_price ?? 0);
  const price = Number(item?.price ?? 0);
  const standard = Number(item?.standard_rate ?? 0);
  const promotion = item?.promotion as ItemPromotion | undefined;

  // Recover when base was wrongly set to the once-discounted amount
  if (promotion && standard > base && base > 0) {
    const fromStandard = calculatePromotionalPrice(standard, promotion);
    if (Math.abs(base - fromStandard) <= 0.02) return standard;
    if (
      sale > 0 &&
      Math.abs(sale - calculatePromotionalPrice(fromStandard, promotion)) <= 0.02
    ) {
      return standard;
    }
  }

  // Explicit base above sale (or equal before discount is applied)
  if (base > 0 && (sale <= 0 || base > sale)) return base;

  // `price` only if it is clearly the list (higher than sale)
  if (price > 0 && (sale <= 0 || price > sale)) return price;

  if (standard > 0 && (sale <= 0 || standard > sale)) return standard;

  // Pre-promo: base_price === sale_price === list
  if (base > 0) return base;
  if (standard > 0) return standard;
  if (price > 0) return price;
  return sale > 0 ? sale : 0;
}

export function applyPromotionPricing<T extends Record<string, unknown>>(
  item: T,
  promotion: ItemPromotion
): T {
  const base = resolveListPrice(item);
  if (base <= 0) {
    return { ...item, promotion };
  }

  const expectedSale = calculatePromotionalPrice(base, promotion);
  if (expectedSale >= base) {
    return { ...item, promotion };
  }

  const existingSale = Number(item.sale_price ?? 0);
  // Prefer expected; if existing already matches, keep it; if existing is lower (double-discount), restore expected
  const finalSale =
    existingSale > 0 && Math.abs(existingSale - expectedSale) <= 0.02
      ? existingSale
      : expectedSale;

  const standard = Number(item.standard_rate ?? 0);

  return {
    ...item,
    promotion,
    base_price: base,
    sale_price: finalSale,
    standard_rate: standard > base ? standard : base,
    price: finalSale,
  };
}

export function hasPromotionalPricing(product: any): boolean {
  const { hasDiscount } = getProductPricePair(product);
  return hasDiscount;
}

/** True when product (or a variation) is on a pricing-rule / sale discount */
export function isOnSaleProduct(product: any): boolean {
  return getDisplayPromotion(product) != null;
}

/** Pin sale items to the front while keeping relative order within each group */
export function sortSaleItemsFirst<T>(products: T[]): T[] {
  if (!products?.length) return products;
  const onSale: T[] = [];
  const regular: T[] = [];
  for (const product of products) {
    if (isOnSaleProduct(product)) onSale.push(product);
    else regular.push(product);
  }
  if (!onSale.length) return products;
  return [...onSale, ...regular];
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

/** Resolved base + sale for display (applies pricing rule at most once). */
export function getProductPricePair(product: any): {
  base: number;
  sale: number;
  hasDiscount: boolean;
} {
  const promotion = getProductPromotion(product);
  let base = resolveListPrice(product);
  let sale = Number(product?.sale_price ?? 0);

  if (promotion && base > 0) {
    const expected = calculatePromotionalPrice(base, promotion);
    if (sale <= 0 || sale >= base) {
      // Discount not applied yet (or collapsed) — apply once
      sale = expected;
    } else if (sale < expected - 0.02) {
      // Sale lower than rule allows → was double-discounted; restore
      sale = expected;
    }
    // else: sale already matches a valid once-discounted price
  } else if (sale <= 0) {
    const price = Number(product?.price ?? 0);
    // Prefer price only when it is not clearly a sale-only field
    sale = price > 0 && (base <= 0 || price >= base) ? price : base;
  }

  if (base <= 0 && sale > 0) base = sale;

  return {
    base,
    sale,
    hasDiscount: base > 0 && sale > 0 && sale < base,
  };
}

/** Write resolved list + sale prices back onto a product (and variations). */
export function normalizeProductPricing<T extends Record<string, any>>(product: T): T {
  const normalizeOne = (item: any) => {
    if (!item) return item;
    const { base, sale } = getProductPricePair(item);
    if (base <= 0 && sale <= 0) return item;
    return {
      ...item,
      base_price: base,
      sale_price: sale > 0 ? sale : base,
      standard_rate: Math.max(Number(item.standard_rate ?? 0), base),
      price: sale > 0 ? sale : base,
    };
  };

  let next = normalizeOne({ ...product });

  if (Array.isArray(next.product_variations)) {
    next = {
      ...next,
      product_variations: next.product_variations.map(normalizeOne),
    };
  }
  if (Array.isArray(next.variants)) {
    next = {
      ...next,
      variants: next.variants.map(normalizeOne),
    };
  }

  return next;
}

export function normalizeProductsPricing<T extends Record<string, any>>(
  products: T[]
): T[] {
  return products.map((p) => normalizeProductPricing(p));
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
