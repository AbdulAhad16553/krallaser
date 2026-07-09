import { erpnextClient } from "../erpnextClient";
import {
  isItemCodeEligibleForRule,
  normalizeItemCode,
  resolveCartItemGroups,
} from "./pricingRuleService";
import type { ItemPromotion } from "@/lib/promotionUtils";

export type { ItemPromotion };

export interface CartLine {
  id?: string;
  product_id?: string;
  sku?: string;
  category?: string;
  item_group?: string;
  quantity?: number;
  salePrice?: number;
  price?: number;
  basePrice?: number;
}

export interface CouponApplyResult {
  valid: boolean;
  message: string;
  couponName?: string;
  couponCode?: string;
  couponTitle?: string;
  pricingRule?: string;
  discountAmount?: number;
  discountPercentage?: number;
  discountType?: "percentage" | "amount";
  subtotal?: number;
  totalAfterDiscount?: number;
}

type CouponDoc = {
  name: string;
  coupon_code?: string;
  coupon_name?: string;
  pricing_rule?: string;
  valid_from?: string;
  valid_upto?: string;
  maximum_use?: number;
  used?: number;
};

type PricingRuleDoc = {
  name: string;
  title?: string;
  disable?: 0 | 1 | boolean;
  coupon_code_based?: 0 | 1 | boolean;
  apply_on?: string;
  price_or_product_discount?: string;
  rate_or_discount?: string;
  discount_percentage?: number;
  discount_amount?: number;
  rate?: number;
  min_qty?: number;
  max_qty?: number;
  min_amt?: number;
  max_amt?: number;
  valid_from?: string;
  valid_upto?: string;
  selling?: 0 | 1 | boolean;
  buying?: 0 | 1 | boolean;
  items?: Array<{ item_code?: string }>;
  item_groups?: Array<{ item_group?: string }>;
};

function todayIso(): string {
  return new Date().toISOString().split("T")[0];
}

function getItemCode(item: CartLine): string {
  return String(item.product_id || item.id || item.sku || "").trim();
}

function getLinePrice(item: CartLine): number {
  return Number(item.salePrice ?? item.price ?? item.basePrice ?? 0);
}

function getLineTotal(item: CartLine): number {
  return getLinePrice(item) * (item.quantity ?? 1);
}

function isErpChecked(value: unknown): boolean {
  return value === 1 || value === true || value === "1" || value === "Yes";
}

function isDateInRange(
  from: string | undefined,
  upto: string | undefined,
  today: string
): { ok: boolean; message?: string } {
  if (from && from > today) {
    return { ok: false, message: "This coupon is not valid yet" };
  }
  if (upto && upto < today) {
    return { ok: false, message: "This coupon has expired" };
  }
  return { ok: true };
}

async function getEligibleSubtotal(
  rule: PricingRuleDoc,
  cartItems: CartLine[]
): Promise<{ eligibleSubtotal: number; eligibleQty: number }> {
  if (rule.apply_on === "Transaction") {
    const eligibleSubtotal = cartItems.reduce((sum, item) => sum + getLineTotal(item), 0);
    const eligibleQty = cartItems.reduce((sum, item) => sum + (item.quantity ?? 1), 0);
    return { eligibleSubtotal, eligibleQty };
  }

  const itemCodes = cartItems.map(getItemCode).filter(Boolean);
  const itemGroupMap = await resolveCartItemGroups(itemCodes);

  let eligibleSubtotal = 0;
  let eligibleQty = 0;

  for (const item of cartItems) {
    const code = getItemCode(item);
    const itemGroup =
      item.item_group ||
      item.category ||
      itemGroupMap.get(normalizeItemCode(code));

    if (
      isItemCodeEligibleForRule(rule, {
        code,
        itemGroup,
      })
    ) {
      eligibleSubtotal += getLineTotal(item);
      eligibleQty += item.quantity ?? 1;
    }
  }

  return { eligibleSubtotal, eligibleQty };
}

function calculateDiscount(
  rule: PricingRuleDoc,
  eligibleSubtotal: number
): { amount: number; type: "percentage" | "amount"; percentage?: number } {
  if (rule.price_or_product_discount === "Product") {
    return { amount: 0, type: "percentage", percentage: 0 };
  }

  const rateOrDiscount = rule.rate_or_discount || "Discount Percentage";

  if (rateOrDiscount === "Discount Percentage") {
    const pct = Number(rule.discount_percentage) || 0;
    const amount = Math.round(((eligibleSubtotal * pct) / 100) * 100) / 100;
    return { amount, type: "percentage", percentage: pct };
  }

  if (rateOrDiscount === "Discount Amount") {
    const amount = Math.min(Number(rule.discount_amount) || 0, eligibleSubtotal);
    return { amount, type: "amount" };
  }

  return { amount: 0, type: "percentage", percentage: 0 };
}

export async function validateAndApplyCoupon(
  rawCode: string,
  cartItems: CartLine[]
): Promise<CouponApplyResult> {
  const code = rawCode.trim().toUpperCase();
  if (!code) {
    return { valid: false, message: "Please enter a coupon code" };
  }

  if (!cartItems.length) {
    return { valid: false, message: "Add items to your cart before applying a coupon" };
  }

  const subtotal = cartItems.reduce((sum, item) => sum + getLineTotal(item), 0);
  if (subtotal <= 0) {
    return { valid: false, message: "Cart total must be greater than zero" };
  }

  const { data: coupons } = await erpnextClient.getList<CouponDoc>(
    "Coupon Code",
    { coupon_code: code },
    [
      "name",
      "coupon_code",
      "coupon_name",
      "pricing_rule",
      "valid_from",
      "valid_upto",
      "maximum_use",
      "used",
    ],
    1
  );

  const coupon = coupons?.[0];
  if (!coupon) {
    return { valid: false, message: "Invalid coupon code" };
  }

  if (!coupon.pricing_rule) {
    return { valid: false, message: "This coupon is not linked to a pricing rule" };
  }

  const today = todayIso();
  const couponDates = isDateInRange(coupon.valid_from, coupon.valid_upto, today);
  if (!couponDates.ok) {
    return { valid: false, message: couponDates.message || "Coupon is not valid" };
  }

  if (coupon.maximum_use && (coupon.used ?? 0) >= coupon.maximum_use) {
    return { valid: false, message: "This coupon has reached its usage limit" };
  }

  const { data: rule } = await erpnextClient.getDoc<PricingRuleDoc>(
    "Pricing Rule",
    coupon.pricing_rule
  );

  if (!rule) {
    return { valid: false, message: "Linked pricing rule was not found" };
  }

  if (isErpChecked(rule.disable)) {
    return { valid: false, message: "This promotion is no longer active" };
  }

  if (!isErpChecked(rule.selling) && isErpChecked(rule.buying)) {
    return { valid: false, message: "This coupon cannot be used for sales" };
  }

  const ruleDates = isDateInRange(rule.valid_from, rule.valid_upto, today);
  if (!ruleDates.ok) {
    return { valid: false, message: ruleDates.message || "Pricing rule is not valid" };
  }

  const { eligibleSubtotal, eligibleQty } = await getEligibleSubtotal(rule, cartItems);

  if (rule.apply_on !== "Transaction" && eligibleSubtotal <= 0) {
    return {
      valid: false,
      message: "This coupon does not apply to items in your cart",
    };
  }

  if (rule.min_qty && eligibleQty < rule.min_qty) {
    return {
      valid: false,
      message: `Minimum quantity of ${rule.min_qty} required for this coupon`,
    };
  }

  if (rule.max_qty && eligibleQty > rule.max_qty) {
    return {
      valid: false,
      message: `Maximum quantity of ${rule.max_qty} allowed for this coupon`,
    };
  }

  if (rule.min_amt && eligibleSubtotal < rule.min_amt) {
    return {
      valid: false,
      message: `Minimum order amount of ${rule.min_amt} required for this coupon`,
    };
  }

  if (rule.max_amt && eligibleSubtotal > rule.max_amt) {
    return {
      valid: false,
      message: `Maximum order amount of ${rule.max_amt} exceeded for this coupon`,
    };
  }

  if (rule.price_or_product_discount === "Product") {
    return {
      valid: false,
      message: "Free-item coupons are applied when your order is processed",
    };
  }

  const discountBase = rule.apply_on === "Transaction" ? subtotal : eligibleSubtotal;
  const discount = calculateDiscount(rule, discountBase);

  if (discount.amount <= 0) {
    return { valid: false, message: "This coupon does not provide a discount on your cart" };
  }

  const totalAfterDiscount = Math.max(0, Math.round((subtotal - discount.amount) * 100) / 100);

  return {
    valid: true,
    message: "Coupon applied successfully",
    couponName: coupon.name,
    couponCode: coupon.coupon_code || code,
    couponTitle: coupon.coupon_name || rule.title,
    pricingRule: rule.name,
    discountAmount: discount.amount,
    discountPercentage: discount.percentage,
    discountType: discount.type,
    subtotal,
    totalAfterDiscount,
  };
}

// Re-export for consumers that need promotion types
export type { ItemPromotion };
