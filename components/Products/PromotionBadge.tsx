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
      <div className="promotion-flag-mast" aria-hidden>
        <span className="promotion-flag-finial" />
        <span className="promotion-flag-pole" />
      </div>
      <div className="promotion-flag-cloth">
        <span className="promotion-flag-sheen" aria-hidden />
        <span className="promotion-flag-text">{label}</span>
        <span className="promotion-flag-tail" aria-hidden />
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

interface SaleListingBannerProps {
  count: number;
  className?: string;
  compact?: boolean;
}

/** Top-of-list banner when sale items are pinned first */
export function SaleListingBanner({
  count,
  className,
  compact = false,
}: SaleListingBannerProps) {
  if (count <= 0) return null;

  return (
    <div
      className={cn(
        "sale-listing-banner relative mb-4 overflow-hidden",
        compact ? "mb-3" : "mb-5",
        className
      )}
      role="status"
    >
      <div className="sale-listing-banner__glow" aria-hidden />
      <div className="sale-listing-banner__inner">
        <div className="sale-listing-banner__flag-wrap" aria-hidden>
          <div className="promotion-flag promotion-flag--compact sale-listing-banner__flag">
            <div className="promotion-flag-mast">
              <span className="promotion-flag-finial" />
              <span className="promotion-flag-pole" />
            </div>
            <div className="promotion-flag-cloth">
              <span className="promotion-flag-sheen" />
              <span className="promotion-flag-text">Sale</span>
              <span className="promotion-flag-tail" />
            </div>
          </div>
        </div>

        <div className="sale-listing-banner__copy min-w-0 flex-1">
          <p className="sale-listing-banner__eyebrow">Limited offers</p>
          <p className="sale-listing-banner__title">
            {count} item{count === 1 ? "" : "s"} on sale
            <span className="sale-listing-banner__title-muted">
              {" "}
              — shown first
            </span>
          </p>
        </div>

        <div className="sale-listing-banner__count" aria-hidden>
          <span className="sale-listing-banner__count-num">{count}</span>
          <span className="sale-listing-banner__count-label">Sale</span>
        </div>
      </div>
    </div>
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
    <div className={cn("sale-detail-banner", className)}>
      <div className="sale-detail-banner__glow" aria-hidden />
      <div className="relative flex flex-wrap items-start gap-3">
        <PromotionBadge promotion={promotion} compact />
        <div className="min-w-0 flex-1">
          <p className="sale-detail-banner__eyebrow">Special offer</p>
          <p className="sale-detail-banner__title">
            {getPromotionLabel(promotion)}
          </p>
          {showPrices && (
            <p className="mt-2 flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
              <span className="text-lg font-bold tracking-tight text-white sm:text-xl">
                {currency} {Number(salePrice).toLocaleString()}
              </span>
              <span className="text-sm text-white/55 line-through">
                {currency} {Number(basePrice).toLocaleString()}
              </span>
            </p>
          )}
          <p className="mt-1.5 text-xs leading-relaxed text-white/75 sm:text-sm">
            {promotion.discountPercentage
              ? `${promotion.discountPercentage}% off this item`
              : promotion.discountAmount
                ? `${promotion.discountAmount} off this item`
                : "Special offer"}
            {promotion.couponRequired
              ? " — enter your coupon code at checkout"
              : ""}
          </p>
        </div>
      </div>
    </div>
  );
}
