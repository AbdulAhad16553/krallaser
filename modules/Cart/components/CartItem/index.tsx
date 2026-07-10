'use client';

import Link from 'next/link';
import { Trash2, Minus, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { IncreamentQuantity } from '@/sub/cart/increamentQuantity';
import { DecreamentQuantity } from '@/sub/cart/decreamentQuantity';
import { RemoveFromCart } from '@/sub/cart/removeFromCart';
import { formatPrice } from '@/lib/currencyUtils';

interface CartItemProps {
  item: any;
  showBundleInfo: boolean;
  storeCurrency: string;
}

const CartItem = ({ item, showBundleInfo, storeCurrency }: CartItemProps) => {
  const name = item?.name ?? 'Unknown Product';
  const basePrice = Number(item?.basePrice ?? 0);
  const salePrice = Number(item?.salePrice ?? item?.price ?? basePrice) || 0;
  const hasSale = basePrice > 0 && salePrice > 0 && salePrice < basePrice;
  const sku = item?.sku ?? item?.id ?? 'N/A';
  const currency = item?.currency ?? storeCurrency;
  const quantity = item?.quantity ?? 1;
  const lineTotal = salePrice * quantity;
  const attributes = item?.variation?.variationId ? item?.variation?.attributes : null;

  const productUrl = `/product/${encodeURIComponent(item?.id ?? '')}`;

  return (
    <div
      className={`flex flex-col sm:flex-row items-stretch sm:items-center gap-4 p-4 sm:p-6 transition-colors hover:bg-slate-50/50 ${
        showBundleInfo ? 'bg-slate-50/50' : ''
      }`}
    >
      {/* Details + quantity + price */}
      <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          <Link href={productUrl} className="group block">
            <h3 className="font-semibold text-slate-900 truncate group-hover:text-[var(--primary-color)] transition-colors">
              {name}
            </h3>
          </Link>
          <p className="text-xs text-slate-500 font-mono mt-0.5">SKU: {sku}</p>
          {attributes?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {attributes.map((attr: any, idx: number) => (
                <Badge
                  key={idx}
                  variant="secondary"
                  className="text-xs font-normal px-2 py-0"
                >
                  {attr?.attribute_name}: {attr?.selected_value}
                </Badge>
              ))}
            </div>
          )}
          <div className="mt-2 sm:hidden">
            <span className={`font-semibold ${hasSale ? 'text-red-600' : 'text-slate-900'}`}>
              {formatPrice(lineTotal, currency)}
            </span>
            {hasSale && (
              <span className="ml-2 text-sm text-slate-400 line-through">
                {formatPrice(basePrice * quantity, currency)}
              </span>
            )}
            {quantity > 1 && (
              <span className="text-slate-500 text-sm ml-1">
                ({formatPrice(salePrice, currency)} each)
              </span>
            )}
          </div>
        </div>

        {/* Quantity */}
        <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
          <div className="flex items-center border border-slate-200 rounded-lg bg-white">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-r-none hover:bg-slate-100"
              disabled={quantity <= 1}
              onClick={() => DecreamentQuantity(item?.id)}
            >
              <Minus className="h-3.5 w-3.5" />
            </Button>
            <span className="w-9 text-center text-sm font-medium tabular-nums">{quantity}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-l-none hover:bg-slate-100"
              onClick={() => IncreamentQuantity(item?.id)}
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Desktop: unit price + line total */}
          <div className="hidden sm:flex flex-col items-end min-w-[100px]">
            <div className="flex flex-wrap items-baseline justify-end gap-1.5">
              <span className={`text-sm font-semibold ${hasSale ? 'text-red-600' : 'text-slate-700'}`}>
                {formatPrice(salePrice, currency)} each
              </span>
              {hasSale && (
                <span className="text-xs text-slate-400 line-through">
                  {formatPrice(basePrice, currency)}
                </span>
              )}
            </div>
            <span className="font-semibold text-slate-900 mt-0.5">
              {formatPrice(lineTotal, currency)}
            </span>
          </div>

          {/* Remove */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-slate-400 hover:text-red-600 hover:bg-red-50 shrink-0"
            onClick={() => RemoveFromCart(item?.id)}
            aria-label="Remove from cart"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

    </div>
  );
};

export default CartItem;
