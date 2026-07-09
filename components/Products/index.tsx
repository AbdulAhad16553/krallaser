"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import QuotationForm from "@/common/QuotationForm";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getOptimizedImageUrl, IMAGE_SIZES } from "@/lib/imageUtils";
import { useBatchItemImages } from "@/hooks/useBatchItemImages";
import ProductImagePreview from "@/components/ProductImagePreview";
import { ProgressiveImage } from "@/components/ui/progressive-image";
import {
  formatPrice,
  getEffectivePrice,
  hasDiscount,
  getBasePriceForDisplay,
  getPriceRange,
  formatPriceRange,
} from "@/lib/currencyUtils";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Heart, Eye, Star } from "lucide-react";
import { getProductSlug, warmProductNavigation } from "@/lib/productNavigation";
import { getProductPromotion, hasPromotionalPricing } from "@/lib/promotionUtils";
import { ProductSaleFlag } from "@/components/Products/PromotionBadge";
import { PromotionalPriceRow } from "@/components/Products/ProductCardMarketplace";
import { useRestoreListingScroll } from "@/lib/listScrollRestoration";

interface NecessaryProps {
  companyId: string;
  storeId: string;
}
interface ProductsProps {
  products: any;
  currentStock?: any[];
  hideOnPage: boolean;
  storeCurrency: string;
  necessary: NecessaryProps;
  viewMode?: "grid" | "list";
}

// Helper function to calculate stock from product stock data
const calculateProductStock = (product: any, currentStockData: any[]) => {
  if (product.type === "variable") {
    // For variable products, sum up stock from all variations
    let totalStock = 0;
    
    product.product_variations?.forEach((variation: any) => {
      // Check if variation has stock info
      if (variation.stock && variation.stock.totalStock !== undefined) {
        totalStock += variation.stock.totalStock;
      } else {
        // Fallback to old method
        const variationStock = currentStockData
          .filter((stock: any) => stock.sku === variation.sku)
          .reduce(
            (sum: number, stock: any) => sum + (stock?.available_quantity || 0),
            0
          );
        totalStock += variationStock;
      }
    });
    
    // Return the actual total stock from all variations
    return totalStock;
  } else {
    // For simple products, use the main product stock
    if (product.stock && product.stock.totalStock !== undefined) {
      return product.stock.totalStock;
    }
    
    // Fallback to old currentStockData if available
    if (!currentStockData || currentStockData.length === 0) return 0;
    
    return currentStockData
      .filter((stock: any) => stock.sku === product.sku)
      .reduce(
        (sum: number, stock: any) => sum + (stock?.available_quantity || 0),
        0
      );
  }
};

const Products = ({
  products,
  currentStock = [],
  hideOnPage,
  storeCurrency,
  necessary,
  viewMode = "grid",
}: ProductsProps) => {
  const router = useRouter();

  useRestoreListingScroll(Array.isArray(products) && products.length > 0);

  const itemNames = React.useMemo(() => {
    return products?.map((product: any) => product.sku).filter(Boolean) || [];
  }, [products]);

  const needsBatchImages =
    !!products?.length && products.some((p: any) => !p.image_url);

  const {
    isLoading: isImageLoading,
    getImageUrl,
    hasImage,
    isImageLoaded
  } = useBatchItemImages({
    itemNames,
    enabled: !!products?.length && needsBatchImages,
  });

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-gray-400 mb-4">
          <ShoppingCart className="h-16 w-16 mx-auto" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No products available
        </h3>
        <p className="text-gray-600">Check back later for new products!</p>
      </div>
    );
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Products</h2>
        {!hideOnPage && (
          <Link href="/shop">
            <Button className="text-white animated-button">View All</Button>
          </Link>
        )}
      </div>

      <div
        className={
          viewMode === "grid"
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            : "space-y-4"
        }
      >
        {products?.map((product: any) => {
          const featuredImage = product?.product_images?.find(
            (image: any) => image.position === "featured"
          );
          
          const imageUrl =
            product.image_url ||
            (needsBatchImages ? getImageUrl(product.sku) : "/placeholder.svg");
          const productHasImage =
            !!product.image_url || (needsBatchImages && hasImage(product.sku));

          // Calculate real stock for this product
          const productStock = calculateProductStock(product, currentStock);
          const isOutOfStock = product.type === "variable" ? false : productStock <= 0;
          const effectivePrice = getEffectivePrice(product);
          const productHasDiscount = hasDiscount(product);
          const basePriceForDisplay = getBasePriceForDisplay(product);
          const promotion = getProductPromotion(product);
          const priceRange = getPriceRange(product);
          const hasVariations = product.product_variations && product.product_variations.length > 0;

          // Debug logging for variable products (only in development)
          if (process.env.NODE_ENV === 'development' && hasVariations && product.product_variations.length > 0) {
            console.log(`🔍 Product: ${product.name}`);
            console.log(`  - Variations: ${product.product_variations.length}`);
            console.log(`  - Price Range:`, priceRange);
            console.log(`  - Effective Price: ${effectivePrice}`);
            console.log(`  - Variations data:`, product.product_variations.slice(0, 2).map((v: any) => ({
              name: v.name,
              base_price: v.base_price,
              sale_price: v.sale_price
            })));
          }

          if (viewMode === "list") {
            return (
              <Card
                key={product.id}
                className="relative flex flex-row h-32 overflow-hidden hover:shadow-lg transition-all duration-300"
              >
                <Link
                  href={`/product/${getProductSlug(product)}`}
                  onMouseEnter={() => warmProductNavigation(router, product)}
                  onTouchStart={() => warmProductNavigation(router, product)}
                  onClick={() =>
                    warmProductNavigation(router, product, {
                      recordListScrollForBack: true,
                    })
                  }
                  className="absolute inset-0 z-[1] cursor-pointer touch-manipulation [-webkit-tap-highlight-color:transparent]"
                  aria-label={`View ${product.name}`}
                />
                <div className="relative z-[2] flex h-full w-full flex-row pointer-events-none">
                {/* Product Image */}
                <div className="relative w-32 h-32 flex-shrink-0">
                  <ProductSaleFlag product={product} />
                  <ProductImagePreview
                    itemName={product.name}
                    productName={product.name}
                    imageUrl={imageUrl}
                    hasImage={productHasImage}
                    isLoading={needsBatchImages ? isImageLoading : false}
                    width={128}
                    height={128}
                    className="w-full h-full"
                    showPreview={false}
                  />
                </div>

                {/* Product Info */}
                <div className="flex-1 p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-lg line-clamp-2 pr-2">
                        {product.name}
                      </h3>
                      <div className="flex flex-col items-end gap-1">
                        {/* Variation Count Badge */}
                        {product.product_variations && product.product_variations.length > 0 && (
                          <Badge
                            variant="outline"
                            className="rounded-full border-blue-200 bg-blue-50/95 px-1.5 py-0.5 text-[9px] font-semibold uppercase leading-tight tracking-wide text-blue-900"
                          >
                            {product.product_variations.length} variants
                          </Badge>
                        )}
                        {!getProductPromotion(product) &&
                          !hasPromotionalPricing(product) &&
                          product.status === "on-sale" &&
                          !isOutOfStock && (
                          <Badge variant="sale" className="text-xs">
                            On Sale
                          </Badge>
                        )}
                        {isOutOfStock && !product.enable_quote_request && (
                          <Badge variant="destructive" className="text-xs">
                            Out of Stock
                          </Badge>
                        )}
                      </div>
                    </div>

                    {product.short_description && (
                      <p className="text-gray-600 text-sm line-clamp-2 mb-2">
                        {product.short_description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {hasVariations ? (
                        priceRange ? (
                          <div className="flex flex-col">
                            <span className="font-bold text-lg text-primary">
                              From {formatPrice(
                                priceRange.min,
                                product.currency || storeCurrency
                              )}
                            </span>
                            {priceRange.min !== priceRange.max && (
                              <span className="text-sm text-gray-600">
                                Up to {formatPrice(
                                  priceRange.max,
                                  product.currency || storeCurrency
                                )}
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="flex flex-col">
                            <span className="font-bold text-lg text-primary">
                              {formatPrice(
                                effectivePrice,
                                product.currency || storeCurrency
                              )}
                            </span>
                            <span className="text-sm text-gray-600">
                              {product.product_variations.length} variants available
                            </span>
                          </div>
                        )
                      ) : (
                        <PromotionalPriceRow
                          product={product}
                          storeCurrency={product.currency || storeCurrency}
                        />
                      )}
                    </div>

                    <div className="pointer-events-auto flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const slug = getProductSlug(product);
                          warmProductNavigation(router, product, {
                            recordListScrollForBack: true,
                          });
                          router.push(`/product/${slug}`);
                        }}
                      >
                        View Details
                      </Button>
                      {(!isOutOfStock || product.enable_quote_request) && hasVariations && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const slug = getProductSlug(product);
                            warmProductNavigation(router, product, {
                              recordListScrollForBack: true,
                            });
                            router.push(`/product/${slug}`);
                          }}
                        >
                          <ShoppingCart className="h-4 w-4 mr-1" />
                          Select Options
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
                </div>
              </Card>
            );
          }

          // Grid view (existing code with improvements)
          return (
            <Card
              key={product.id}
              className="group relative hover:shadow-lg transition-all duration-300 overflow-hidden"
            >
              <CardContent className="relative p-0">
                <Link
                  href={`/product/${getProductSlug(product)}`}
                  onMouseEnter={() => warmProductNavigation(router, product)}
                  onTouchStart={() => warmProductNavigation(router, product)}
                  onClick={() =>
                    warmProductNavigation(router, product, {
                      recordListScrollForBack: true,
                    })
                  }
                  className="absolute inset-0 z-[1] cursor-pointer touch-manipulation rounded-[inherit] [-webkit-tap-highlight-color:transparent]"
                  aria-label={`View ${product.name}`}
                />
                <div className="relative z-[2] pointer-events-none">
                {/* Product Image */}
                <div className="relative aspect-square overflow-hidden">
                  <ProductSaleFlag product={product} />
                  <div className="absolute top-2 right-2 z-10 flex flex-col gap-1">
                    {product.product_variations && product.product_variations.length > 0 && (
                      <Badge
                        variant="outline"
                        className="rounded-full border-blue-200 bg-blue-50/95 px-1.5 py-0.5 text-[9px] font-semibold uppercase leading-tight tracking-wide text-blue-900"
                      >
                        {product.product_variations.length} variants
                      </Badge>
                    )}
                    {!getProductPromotion(product) &&
                      !hasPromotionalPricing(product) &&
                      product.status === "on-sale" &&
                      !isOutOfStock && (
                      <Badge variant="sale" className="text-xs font-bold">
                        On Sale
                      </Badge>
                    )}
                  </div>

                  <ProductImagePreview
                    itemName={product.name}
                    productName={product.name}
                    imageUrl={imageUrl}
                    hasImage={productHasImage}
                    isLoading={needsBatchImages ? isImageLoading : false}
                    width={400}
                    height={400}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    showPreview={false}
                  />

                  {/* Quick Actions */}
                  <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-8 w-8 bg-white/90 backdrop-blur-sm border-white/20 hover:bg-white hover:shadow-md"
                    >
                      <Heart className="h-4 w-4 text-gray-700 hover:text-red-500 transition-colors" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-8 w-8 bg-white/90 backdrop-blur-sm border-white/20 hover:bg-white hover:shadow-md"
                    >
                      <Eye className="h-4 w-4 text-gray-700 hover:text-blue-500 transition-colors" />
                    </Button>
                  </div>

                  {/* Bottom overlay reserved for future actions (Quick Add removed) */}
                </div>

                {/* Product Info */}
                <div className="p-4 space-y-3">
                  {/* Rating */}
                  <div className="flex items-center gap-1">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${
                            i < 4
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">(24)</span>
                  </div>

                  {/* Product Name */}
                  <h3 className="font-medium text-sm line-clamp-2">
                    {product.name}
                  </h3>

                  {/* Price */}
                  <div className="flex items-center gap-2">
                    {hasVariations ? (
                      priceRange ? (
                        <div className="flex flex-col">
                          <span className="font-semibold text-primary text-lg">
                            From {formatPrice(
                              priceRange.min,
                              product.currency || storeCurrency
                            )}
                          </span>
                          {priceRange.min !== priceRange.max && (
                            <span className="text-sm text-gray-600">
                              Up to {formatPrice(
                                priceRange.max,
                                product.currency || storeCurrency
                              )}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col">
                          <span className="font-semibold text-primary text-lg">
                            {formatPrice(
                              effectivePrice,
                              product.currency || storeCurrency
                            )}
                          </span>
                          <span className="text-sm text-gray-600">
                            {product.product_variations.length} variants available
                          </span>
                        </div>
                      )
                    ) : (
                      <PromotionalPriceRow
                        product={product}
                        storeCurrency={product.currency || storeCurrency}
                      />
                    )}
                  </div>

                  {/* Stock Information */}
                  <div className="flex items-center gap-2 text-sm">
                    {productStock > 0 ? (
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-green-700 font-medium">
                          {productStock} in stock
                        </span>
                        {product.type === "variable" && (
                          <span className="text-gray-500 text-xs">
                            ({product.product_variations?.length || 0} variants)
                          </span>
                        )}
                      </div>
                    ) : product.type === "variable" ? (
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-blue-700 font-medium">
                          {product.product_variations?.length || 0} variants available
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="text-red-700 font-medium">
                          Out of stock
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Stock Status */}
                  {!product.enable_quote_request && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            isOutOfStock ? "bg-red-500" : "bg-green-500"
                          }`}
                        ></div>
                        <span className="text-xs text-gray-600">
                          {isOutOfStock ? "Out of Stock" : "In Stock"}
                        </span>
                      </div>
                      <span className="text-xs text-gray-600">
                        {product.type === "variable"
                          ? `${product.product_variations?.length || 0} variants`
                          : "Simple product"}
                      </span>
                    </div>
                  )}
                </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
    </section>
  );
};

export default Products;
