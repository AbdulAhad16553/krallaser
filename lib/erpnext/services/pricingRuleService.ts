import {
  applyPromotionPricing,
  recalculateVariableProductPrices,
  type ItemPromotion,
} from "@/lib/promotionUtils";
import { erpnextClient } from "../erpnextClient";
import { productCache } from "@/lib/cache";

export type { ItemPromotion };

type PricingRuleListRow = {
  name: string;
  title?: string;
  disable?: 0 | 1 | boolean;
  coupon_code_based?: 0 | 1 | boolean;
  apply_on?: string;
  price_or_product_discount?: string;
  rate_or_discount?: string;
  discount_percentage?: number;
  discount_amount?: number;
  valid_from?: string;
  valid_upto?: string;
  selling?: 0 | 1 | boolean;
  buying?: 0 | 1 | boolean;
};

type PricingRuleDoc = PricingRuleListRow & {
  items?: Array<{ item_code?: string }>;
  item_groups?: Array<{ item_group?: string }>;
  brands?: Array<{ brand?: string }>;
};

const PROMOTIONS_CACHE_KEY = "erpnext-active-promotions-by-item";
const PROMOTIONS_TTL = 15 * 60 * 1000;

export function normalizeItemCode(code: string | undefined | null): string {
  return String(code || "")
    .trim()
    .replace(/\s+/g, " ")
    .toUpperCase();
}

function isErpChecked(value: unknown): boolean {
  return value === 1 || value === true || value === "1" || value === "Yes";
}

function todayIso(): string {
  return new Date().toISOString().split("T")[0];
}

function isDateInRange(
  from: string | undefined,
  upto: string | undefined,
  today: string
): boolean {
  if (from && from > today) return false;
  if (upto && upto < today) return false;
  return true;
}

function buildPromotionFromRule(rule: PricingRuleDoc): ItemPromotion | null {
  if (rule.price_or_product_discount === "Product") return null;

  const rateOrDiscount = rule.rate_or_discount || "Discount Percentage";
  const promotion: ItemPromotion = {
    title: rule.title || rule.name,
    pricingRuleName: rule.name,
    couponRequired: isErpChecked(rule.coupon_code_based),
    validUpto: rule.valid_upto,
    applyOn: rule.apply_on || "Item Code",
  };

  if (rateOrDiscount === "Discount Percentage") {
    const pct = Number(rule.discount_percentage) || 0;
    if (pct <= 0) return null;
    promotion.discountPercentage = pct;
  } else if (rateOrDiscount === "Discount Amount") {
    const amt = Number(rule.discount_amount) || 0;
    if (amt <= 0) return null;
    promotion.discountAmount = amt;
  } else {
    return null;
  }

  return promotion;
}

function pickBetterPromotion(
  current: ItemPromotion | undefined,
  next: ItemPromotion
): ItemPromotion {
  if (!current) return next;
  const currentPct = current.discountPercentage ?? 0;
  const nextPct = next.discountPercentage ?? 0;
  if (nextPct > currentPct) return next;
  if (nextPct < currentPct) return current;
  const currentAmt = current.discountAmount ?? 0;
  const nextAmt = next.discountAmount ?? 0;
  return nextAmt > currentAmt ? next : current;
}

/**
 * Loads active ERPNext pricing rules and maps item codes to promotions.
 */
export async function getActivePromotionsByItemCode(): Promise<
  Map<string, ItemPromotion>
> {
  const cached = productCache.get(PROMOTIONS_CACHE_KEY) as
    | Map<string, ItemPromotion>
    | undefined;
  if (cached) return cached;

  const map = new Map<string, ItemPromotion>();
  const today = todayIso();

  const { data: ruleRows } = await erpnextClient.getList<PricingRuleListRow>(
    "Pricing Rule",
    { disable: 0 },
    [
      "name",
      "title",
      "disable",
      "coupon_code_based",
      "apply_on",
      "price_or_product_discount",
      "rate_or_discount",
      "discount_percentage",
      "discount_amount",
      "valid_from",
      "valid_upto",
      "selling",
      "buying",
    ],
    200
  );

  const candidates = (ruleRows || []).filter((row) => {
    if (isErpChecked(row.disable)) return false;
    if (!isErpChecked(row.selling) && isErpChecked(row.buying)) return false;
    if (!isDateInRange(row.valid_from, row.valid_upto, today)) return false;
    if (row.price_or_product_discount === "Product") return false;
    return true;
  });

  const detailedRules = await Promise.all(
    candidates.map(async (row) => {
      const { data } = await erpnextClient.getDoc<PricingRuleDoc>(
        "Pricing Rule",
        row.name
      );
      return data;
    })
  );

  for (const rule of detailedRules) {
    if (!rule) continue;
    const promotion = buildPromotionFromRule(rule);
    if (!promotion) continue;

    const assign = (rawCode: string | undefined) => {
      const code = normalizeItemCode(rawCode);
      if (!code) return;
      map.set(code, pickBetterPromotion(map.get(code), promotion));
    };

    if (rule.apply_on === "Item Code") {
      for (const row of rule.items || []) assign(row.item_code);
    } else if (rule.apply_on === "Item Group") {
      // Store under a synthetic key prefix for group-based lookup
      for (const row of rule.item_groups || []) {
        const group = String(row.item_group || "").trim();
        if (!group) continue;
        map.set(`__GROUP__:${group.toUpperCase()}`, promotion);
      }
    } else if (rule.apply_on === "Transaction") {
      map.set("__TRANSACTION__", promotion);
    }
  }

  productCache.set(PROMOTIONS_CACHE_KEY, map, PROMOTIONS_TTL);
  return map;
}

export function getPromotionForItemCode(
  itemCode: string | undefined,
  promotions: Map<string, ItemPromotion>
): ItemPromotion | undefined {
  const key = normalizeItemCode(itemCode);
  if (!key) return undefined;
  return promotions.get(key);
}

export function getPromotionForItemGroup(
  itemGroup: string | undefined,
  promotions: Map<string, ItemPromotion>
): ItemPromotion | undefined {
  const group = String(itemGroup || "").trim().toUpperCase();
  if (!group) return undefined;
  return (
    promotions.get(`__GROUP__:${group}`) ||
    promotions.get(`__GROUP__:ALL ITEM GROUPS`)
  );
}

export function collectProductItemCodes(product: any): string[] {
  const codes = new Set<string>();
  const add = (code: unknown) => {
    const normalized = normalizeItemCode(String(code || ""));
    if (normalized) codes.add(normalized);
  };

  add(product?.id);
  add(product?.sku);
  add(product?.item_code);

  for (const v of product?.product_variations || product?.variants || []) {
    add(v?.id);
    add(v?.sku);
    add(v?.name);
    add(v?.item_code);
  }

  return [...codes];
}

export function attachPromotionToProduct(
  product: any,
  promotions: Map<string, ItemPromotion>
): any {
  let best: ItemPromotion | undefined;

  const resolve = (code: string | undefined, itemGroup?: string) => {
    return (
      getPromotionForItemCode(code, promotions) ||
      getPromotionForItemGroup(itemGroup, promotions)
    );
  };

  const attachToVariation = (variation: any) => {
    const promo = resolve(
      variation?.id || variation?.sku || variation?.item_code || variation?.name,
      variation?.item_group || product?.item_group
    );
    if (!promo) return variation;
    best = pickBetterPromotion(best, promo);
    return applyPromotionPricing(variation, promo);
  };

  let next = { ...product };

  if (Array.isArray(next.product_variations)) {
    next.product_variations = next.product_variations.map(attachToVariation);
  }
  if (Array.isArray(next.variants)) {
    next.variants = next.variants.map(attachToVariation);
  }

  const selfPromo = resolve(
    next.id || next.sku || next.item_code,
    next.item_group
  );

  if (selfPromo) {
    next = applyPromotionPricing({ ...next, promotion: selfPromo }, selfPromo);
  } else if (best) {
    next.promotion = best;
    next = recalculateVariableProductPrices(next);
  }

  return next;
}

export function attachPromotionsToProducts(
  products: any[],
  promotions: Map<string, ItemPromotion>
): any[] {
  return products.map((p) => attachPromotionToProduct(p, promotions));
}

export async function resolveCartItemGroups(
  itemCodes: string[]
): Promise<Map<string, string>> {
  const unique = [...new Set(itemCodes.map(normalizeItemCode).filter(Boolean))];
  const map = new Map<string, string>();
  if (!unique.length) return map;

  await Promise.all(
    unique.map(async (code) => {
      try {
        const { data } = await erpnextClient.getDoc<{ item_group?: string }>(
          "Item",
          code
        );
        if (data?.item_group) map.set(code, data.item_group);
      } catch {
        // Item may not exist under this code
      }
    })
  );

  return map;
}

export function isItemCodeEligibleForRule(
  rule: PricingRuleDoc,
  cartItem: { code: string; itemGroup?: string }
): boolean {
  const code = normalizeItemCode(cartItem.code);
  if (!code) return false;

  if (rule.apply_on === "Transaction") return true;

  if (rule.apply_on === "Item Code") {
    const allowed = new Set(
      (rule.items || []).map((r) => normalizeItemCode(r.item_code))
    );
    return allowed.has(code);
  }

  if (rule.apply_on === "Item Group") {
    const groups = (rule.item_groups || [])
      .map((r) => String(r.item_group || "").trim().toUpperCase())
      .filter(Boolean);
    const itemGroup = String(cartItem.itemGroup || "").trim().toUpperCase();
    if (!itemGroup) return false;
    if (groups.includes("ALL ITEM GROUPS")) return true;
    return groups.includes(itemGroup);
  }

  return false;
}
