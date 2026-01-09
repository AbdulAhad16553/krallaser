"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ProgressiveImage } from "@/components/ui/progressive-image";
import {
  formatPrice,
  getEffectivePrice,
  hasDiscount,
  getBasePriceForDisplay,
  getPriceRange,
} from "@/lib/currencyUtils";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Heart, Eye, Star } from "lucide-react";
import ProductImagePreview from "@/components/ProductImagePreview";
import { useBatchItemImages } from "@/hooks/useBatchItemImages";
import { Skeleton } from "@/components/ui/skeleton";

interface HomeProductsProps {
  companyId: string;
  storeId: string;
  currentStock?: any[];
  storeCurrency: string;
  className?: string;
  initialProducts?: any[];
}

// Home Products Skeleton
const HomeProductsSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
    {[...Array(8)].map((_, i) => (
      <Card key={i} className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
        <CardContent className="p-0">
          <Skeleton className="aspect-square w-full" />
          <div className="p-4 space-y-3">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, j) => (
                <Skeleton key={j} className="h-3 w-3" />
              ))}
            </div>
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

const HomeProducts: React.FC<HomeProductsProps> = ({
  companyId,
  storeId,
  currentStock = [],
  storeCurrency,
  className = "",
  initialProducts = []
}) => {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>(initialProducts || []);
  const [loading, setLoading] = useState(!(initialProducts && initialProducts.length > 0));
  const [error, setError] = useState<string | null>(null);

  // Prepare batch image loading like /shop
  const itemNames = React.useMemo(() => products.map(p => p.sku).filter(Boolean), [products]);
  const {
    isLoading: isImageLoading,
    getImageUrl,
    hasImage,
  } = useBatchItemImages({
    itemNames,
    enabled: products.length > 0
  });

  // Fetch products on component mount
  useEffect(() => {
    let isCancelled = false;
    const fetchProducts = async () => {
      try {
        // If we already have server-provided products, don't flash loading skeleton
        if (!products.length) {
          setLoading(true);
        }
        setError(null);

        console.log('🔄 Fetching 8 products for home page...');

        const response = await fetch(`/api/products?page=1&limit=8`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch products');
        }

        console.log(`✅ Loaded ${data.products.length} products for home page`);
        // Ensure we only keep 8 items even if API returns more
        if (!isCancelled) {
          setProducts((data.products || []).slice(0, 8));
        }
      } catch (err) {
        console.error('Error loading products:', err);
        // Only surface the error if we have no fallback data
        if (!products.length) {
          setError(err instanceof Error ? err.message : 'Failed to load products');
        } else {
          console.warn('Using initial products fallback for home page');
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchProducts();
    return () => {
      isCancelled = true;
    };
  }, []);

  // Calculate product stock
  const calculateProductStock = (product: any) => {
    if (product.type === "variable") {
      let totalStock = 0;
      product.product_variations?.forEach((variation: any) => {
        if (variation.stock && variation.stock.totalStock !== undefined) {
          totalStock += variation.stock.totalStock;
        } else {
          const variationStock = currentStock
            .filter((stock: any) => stock.sku === variation.sku)
            .reduce((sum: number, stock: any) => sum + (stock?.available_quantity || 0), 0);
          totalStock += variationStock;
        }
      });
      return totalStock;
    } else {
      if (product.stock && product.stock.totalStock !== undefined) {
        return product.stock.totalStock;
      }
      return currentStock
        .filter((stock: any) => stock.sku === product.sku)
        .reduce((sum: number, stock: any) => sum + (stock?.available_quantity || 0), 0);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className={className}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Featured Products</h2>
        </div>
        <HomeProductsSkeleton />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={className}>
        <div className="text-center py-16">
          <div className="text-red-400 mb-4">
            <ShoppingCart className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Error loading products
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Empty state
  if (!loading && products.length === 0) {
    return (
      <div className={className}>
        <div className="text-center py-16">
          <div className="text-gray-400 mb-4">
            <ShoppingCart className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No products available
          </h3>
          <p className="text-gray-600">Check back later for new products!</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Featured Products</h2>
          <p className="text-sm text-gray-600 mt-1">
            Showing {Math.min(products.length, 8)} of our best products
          </p>
        </div>
        <Link href="/shop">
          <Button className="text-white animated-button">
            View All Products
          </Button>
        </Link>
      </div>

      {/* Products Grid - 4 columns to match categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.slice(0, 8).map((product: any, index: number) => {
          // Resolve image via batch image loader (same approach as /shop)
          const imageUrl = getImageUrl(product.sku);
          const productHasImage = hasImage(product.sku);

          const productStock = calculateProductStock(product);
          const isOutOfStock = product.type === "variable" ? false : productStock <= 0;
          const effectivePrice = getEffectivePrice(product);
          const productHasDiscount = hasDiscount(product);
          const basePriceForDisplay = getBasePriceForDisplay(product);
          const priceRange = getPriceRange(product);
          const hasVariations = product.product_variations && product.product_variations.length > 0;
          
          // Create unique key
          const uniqueKey = `${product.id || product.sku || product.name}-${index}-${product.type || 'simple'}`;

          return (
            <Card
              key={uniqueKey}
              className="group hover:shadow-lg transition-all duration-300 overflow-hidden"
            >
              <CardContent className="p-0">
                {/* Product Image */}
                <div className="relative aspect-square overflow-hidden">
                  <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
                    {hasVariations && (
                      <Badge
                        variant="outline"
                        className="text-xs font-bold bg-blue-100 text-blue-800 border-blue-300"
                      >
                        {product.product_variations.length} variants
                      </Badge>
                    )}
                    {product.status === "on-sale" && !isOutOfStock && (
                      <Badge variant="sale" className="text-xs font-bold">
                        On Sale
                      </Badge>
                    )}
                    {isOutOfStock && !product.enable_quote_request && (
                      <Badge
                        variant="destructive"
                        className="text-xs font-bold"
                      >
                        Out of Stock
                      </Badge>
                    )}
                    {productStock > 0 &&
                      productStock <= 5 &&
                      product.status !== "on-sale" && (
                        <Badge
                          variant="outline"
                          className="text-xs font-bold bg-orange-100 text-orange-800 border-orange-300"
                        >
                          Low Stock
                        </Badge>
                      )}
                  </div>

                  <Link href={`/product/${encodeURIComponent(product.sku)}`}>
                    <ProductImagePreview
                      itemName={product.sku}
                      productName={product.name}
                      imageUrl={imageUrl}
                      hasImage={productHasImage}
                      isLoading={isImageLoading}
                      width={400}
                      height={400}
                      className="w-full h-full"
                      showPreview={true}
                    />
                  </Link>

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
                  <Link href={`/product/${encodeURIComponent(product.sku)}`}>
                    <h3 className="font-medium text-sm line-clamp-2 hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                  </Link>

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
                      <>
                        <span className="font-semibold text-primary text-lg">
                          {formatPrice(
                            effectivePrice,
                            product.currency || storeCurrency
                          )}
                        </span>
                        {productHasDiscount && (
                          <span className="text-sm text-gray-500 line-through">
                            {formatPrice(
                              basePriceForDisplay,
                              product.currency || storeCurrency
                            )}
                          </span>
                        )}
                      </>
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
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* View All Button - Bottom */}
      <div className="flex justify-center mt-8">
        <Link href="/shop">
          <Button size="lg" className="px-8 py-3 text-white animated-button">
            View All Products
          </Button>
        </Link>
      </div>
      
    </div>
  );
};

export default HomeProducts;
