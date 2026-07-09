"use client";

import { cn } from "@/lib/utils";
import {
  getDisplayPromotion,
  getPromotionLabel,
  getPromotionShortLabel,
  type ItemPromotion,
} from "@/lib/promotionUtils";

interface PromotionBadgeProps {
  promotion: ItemPromotion;
  className?: string;
  compact?: boolean;
  variant?: "inline" | "corner";
}

/** Animated waving flag for sale / pricing-rule promos */
export function PromotionBadge({
  promotion,
  className,
  compact = false,
  variant = "inline",
}: PromotionBadgeProps) {
  const label = compact
    ? getPromotionShortLabel(promotion)
    : getPromotionLabel(promotion);

  return (
    <div
      className={cn(
        "promotion-flag pointer-events-none select-none",
        variant === "corner" && "promotion-flag--corner",
        compact && "promotion-flag--compact",
        className
      )}
      role="status"
      aria-label={label}
    >
      <div className="promotion-flag-pole" aria-hidden />
      <div className="promotion-flag-cloth">
        <span className="promotion-flag-text">{label}</span>
        <span className="promotion-flag-notch" aria-hidden />
      </div>
    </div>
  );
}

interface ProductSaleFlagProps {
  product: any;
  className?: string;
  compact?: boolean;
  variant?: "inline" | "corner";
  hideWhenOutOfStock?: boolean;
}

/** Waving flag when product has a pricing rule or discounted sale price */
export function ProductSaleFlag({
  product,
  className,
  compact = true,
  variant = "corner",
  hideWhenOutOfStock = true,
}: ProductSaleFlagProps) {
  const promotion = getDisplayPromotion(product);
  if (!promotion) return null;

  const stock = Number(product?.stock_qty ?? product?.actual_qty ?? 1);
  const isOutOfStock =
    product?.type !== "variable" && stock <= 0 && !product?.enable_quote_request;
  if (hideWhenOutOfStock && isOutOfStock) return null;

  return (
    <PromotionBadge
      promotion={promotion}
      compact={compact}
      variant={variant}
      className={className}
    />
  );
}

interface PromotionBannerProps {
  promotion: ItemPromotion;
  className?: string;
  basePrice?: number;
  salePrice?: number;
  currency?: string;
}

export function PromotionBanner({
  promotion,
  className,
  basePrice,
  salePrice,
  currency = "PKR",
}: PromotionBannerProps) {
  const showPrices =
    basePrice != null &&
    salePrice != null &&
    basePrice > 0 &&
    salePrice > 0 &&
    salePrice < basePrice;

  return (
    <div
      className={cn(
        "rounded-xl border border-red-200 bg-gradient-to-r from-red-500 to-orange-500 px-4 py-3 text-white shadow-sm",
        className
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <PromotionBadge promotion={promotion} compact />
        <p className="text-sm font-bold sm:text-base">{getPromotionLabel(promotion)}</p>
      </div>
      {showPrices && (
        <p className="mt-2 text-sm font-semibold">
          <span className="line-through opacity-75 mr-2">
            {currency} {Number(basePrice).toLocaleString()}
          </span>
          <span className="text-lg">
            {currency} {Number(salePrice).toLocaleString()}
          </span>
        </p>
      )}
      <p className="mt-1 text-xs text-white/90 sm:text-sm">
        {promotion.discountPercentage
          ? `${promotion.discountPercentage}% off this item`
          : promotion.discountAmount
            ? `${promotion.discountAmount} off this item`
            : "Special offer"}
        {promotion.couponRequired ? " — enter your coupon code at checkout" : ""}
      </p>
    </div>
  );
}
