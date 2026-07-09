"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPrice, getPriceRange } from "@/lib/currencyUtils";
import { getProductPricePair } from "@/lib/promotionUtils";

/** Stable per-SKU display for stars + counts (placeholder, not live reviews). */
export function getCardReviewDisplayMeta(sku: string) {
  let h = 2166136261;
  const s = sku || "item";
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  }
  const rating = 4.2 + (Math.abs(h) % 81) / 100;
  const reviews = 18 + (Math.abs(h >>> 8) % 982);
  return {
    ratingLabel: rating.toFixed(1),
    reviewCount: reviews,
    roundedStars: Math.min(5, Math.round(rating)),
  };
}

export function ProductCardReviewsRow({
  sku,
  className,
  compact,
}: {
  sku: string;
  className?: string;
  compact?: boolean;
}) {
  const meta = getCardReviewDisplayMeta(sku);
  const starSize = compact ? "h-2.5 w-2.5" : "h-3 w-3";

  return (
    <div
      className={cn("flex flex-wrap items-center gap-1", className)}
      title="Indicative rating for display"
    >
      <span
        className={cn(
          "font-bold text-neutral-900 tabular-nums",
          compact ? "text-[10px]" : "text-xs"
        )}
      >
        {meta.ratingLabel}
      </span>
      <div className="flex gap-px">
        {[0, 1, 2, 3, 4].map((i) => (
          <Star
            key={i}
            className={cn(
              starSize,
              i < meta.roundedStars
                ? "fill-amber-400 text-amber-400"
                : "fill-neutral-200 text-neutral-200"
            )}
            aria-hidden
          />
        ))}
      </div>
      <span
        className={cn(
          "text-neutral-500",
          compact ? "text-[10px]" : "text-xs"
        )}
      >
        ({meta.reviewCount.toLocaleString()} reviews)
      </span>
    </div>
  );
}

/** Sale + original price on one row */
export function PromotionalPriceRow({
  product,
  storeCurrency,
  compact,
  className,
}: {
  product: any;
  storeCurrency: string;
  compact?: boolean;
  className?: string;
}) {
  const cur = product.currency || storeCurrency;
  const { base, sale, hasDiscount } = getProductPricePair(product);

  const saleClass = compact
    ? "text-sm font-extrabold leading-tight text-red-600"
    : "text-base font-extrabold leading-tight text-red-600 sm:text-lg";
  const baseClass = compact
    ? "text-[11px] leading-tight text-neutral-400 line-through"
    : "text-sm text-neutral-400 line-through";
  const singleClass = compact
    ? "text-sm font-extrabold leading-tight text-neutral-900"
    : "text-base font-extrabold leading-tight text-neutral-900 sm:text-lg";

  if (!hasDiscount) {
    return (
      <span className={cn(singleClass, className)}>
        {formatPrice(sale || base, cur)}
      </span>
    );
  }

  return (
    <div className={cn("flex flex-wrap items-baseline gap-1.5", className)}>
      <span className={saleClass}>{formatPrice(sale, cur)}</span>
      <span className={baseClass}>{formatPrice(base, cur)}</span>
    </div>
  );
}

export function ProductCardMarketplacePrice({
  product,
  storeCurrency,
  compact,
}: {
  product: any;
  storeCurrency: string;
  compact?: boolean;
}) {
  const cur = product.currency || storeCurrency;
  const priceRange = getPriceRange(product);
  const hasVariations = product.product_variations?.length > 0;

  const priceClass = compact
    ? "text-sm font-extrabold leading-tight text-neutral-900"
    : "text-base font-extrabold leading-tight text-neutral-900 sm:text-lg";
  const secondaryClass = compact ? "text-[11px] leading-tight" : "text-sm";

  if (hasVariations && priceRange) {
    const { hasDiscount } = getProductPricePair(product);
    const saleMax = priceRange.max;

    return (
      <div className="flex flex-col gap-0.5">
        {hasDiscount ? (
          <PromotionalPriceRow
            product={product}
            storeCurrency={storeCurrency}
            compact={compact}
          />
        ) : (
          <span className={priceClass}>
            From {formatPrice(priceRange.min, cur)}
          </span>
        )}
        {hasDiscount && priceRange.min !== priceRange.max && (
          <span className={cn(secondaryClass, "text-neutral-500")}>
            Up to {formatPrice(saleMax, cur)}
          </span>
        )}
        {!hasDiscount && priceRange.min !== priceRange.max && (
          <span className={cn(secondaryClass, "text-neutral-500")}>
            Up to {formatPrice(priceRange.max, cur)}
          </span>
        )}
      </div>
    );
  }

  return (
    <PromotionalPriceRow
      product={product}
      storeCurrency={storeCurrency}
      compact={compact}
    />
  );
}
