"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ProgressiveImage } from "@/components/ui/progressive-image";
import { usePaginatedProducts } from "@/hooks/usePaginatedProducts";
import { useBatchItemImages } from "@/hooks/useBatchItemImages";
import ProductImagePreview from "@/components/ProductImagePreview";
import PerformanceMonitor from "@/components/PerformanceMonitor";
import {
  formatPrice,
  getEffectivePrice,
  hasDiscount,
  getBasePriceForDisplay,
  getPriceRange,
} from "@/lib/currencyUtils";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Heart, Eye, Star } from "lucide-react";
import { AddToCart } from "@/sub/cart/addToCart";
import { CartAnimationDialog } from "@/common/CartAnimationDialog";
import { Skeleton } from "@/components/ui/skeleton";

interface PaginatedProductsProps {
  companyId: string;
  storeId: string;
  currentStock?: any[];
  storeCurrency: string;
  viewMode?: "grid" | "list";
  paginationMode?: "pagination" | "infinite" | "load-more";
  pageSize?: number;
  className?: string;
  selectedCategory?: string;
  searchTerm?: string;
  sortBy?: "newest" | "oldest" | "price-low" | "price-high" | "name" | "name-desc";
}

// Enhanced Product Skeleton
const ProductSkeleton = ({ viewMode = "grid" }: { viewMode?: "grid" | "list" }) => {
  if (viewMode === "list") {
    return (
      <Card className="flex flex-row h-32 overflow-hidden">
        <Skeleton className="w-32 h-32 flex-shrink-0" />
        <div className="flex-1 p-4 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-4 w-1/4" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
      <CardContent className="p-0">
        <Skeleton className="aspect-square w-full" />
        <div className="p-4 space-y-3">
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-3 w-3" />
            ))}
          </div>
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </CardContent>
    </Card>
  );
};

// Product Grid Skeleton
const ProductsGridSkeleton = ({ count = 12, viewMode = "grid" }: { count?: number; viewMode?: "grid" | "list" }) => (
  <div className={viewMode === "grid" 
    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
    : "space-y-4"
  }>
    {[...Array(count)].map((_, i) => (
      <ProductSkeleton key={i} viewMode={viewMode} />
    ))}
  </div>
);

const PaginatedProducts: React.FC<PaginatedProductsProps> = ({
  companyId,
  storeId,
  currentStock = [],
  storeCurrency,
  viewMode = "grid",
  paginationMode = "pagination",
  pageSize = 12,
  className = "",
  selectedCategory = "all",
  searchTerm = "",
  sortBy = "newest"
}) => {
  const router = useRouter();
  const [cartDialogOpen, setCartDialogOpen] = useState(false);
  const [selectedProductImage, setSelectedProductImage] = useState<any>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState({
    totalImages: 0,
    cachedImages: 0,
    optimizedImages: 0,
    loadTime: 0,
    cacheHitRate: 0,
    optimizationTime: 0
  });

  // Load all products at once - no pagination
  const paginatedProducts = usePaginatedProducts({
    pageSize, // Respect provided page size
    autoLoad: true
  });

  const {
    products,
    pagination,
    loading,
    error,
    loadPage,
    loadNextPage,
    hasMore,
    isLoadingMore
  } = paginatedProducts;

  // Apply category/search/sort filters
  const visibleProducts = React.useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    // Filter by category and search
    let filtered = products.filter((product) => {
      const matchesCategory = selectedCategory && selectedCategory !== "all" ? product.item_group === selectedCategory : true;
      const matchesSearch = normalizedSearch
        ? (product.name?.toLowerCase().includes(normalizedSearch) ||
          product.short_description?.toLowerCase().includes(normalizedSearch) ||
          product.sku?.toLowerCase().includes(normalizedSearch))
        : true;
      return matchesCategory && matchesSearch;
    });

    // Remove duplicates based on stable key
    filtered = filtered.filter((product: any, index: number, array: any[]) => {
      const productKey = `${product.id || product.sku || product.name}`;
      const firstIndex = array.findIndex(
        (p: any) => `${p.id || p.sku || p.name}` === productKey
      );
      return firstIndex === index;
    });

    // Sort
    const sorted = [...filtered];
    switch (sortBy) {
      case "price-low":
        sorted.sort((a, b) => (a.sale_price || a.base_price || 0) - (b.sale_price || b.base_price || 0));
        break;
      case "price-high":
        sorted.sort((a, b) => (b.sale_price || b.base_price || 0) - (a.sale_price || a.base_price || 0));
        break;
      case "name":
        sorted.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        break;
      case "name-desc":
        sorted.sort((a, b) => (b.name || "").localeCompare(a.name || ""));
        break;
      case "oldest":
        sorted.reverse(); // API returns newest first, so reverse for oldest
        break;
      default:
        break;
    }

    return sorted;
  }, [products, selectedCategory, searchTerm, sortBy]);

  // Extract image IDs for batch optimization
  const imageIds = React.useMemo(() => {
    return products
      .map(product => {
        const featuredImage = product?.product_images?.find(
          (image: any) => image.position === "featured"
        );
        return featuredImage?.image_id;
      })
      .filter(Boolean);
  }, [products]);

  // Extract item names for batch image loading
  const itemNames = React.useMemo(() => {
    return products.map(product => product.sku).filter(Boolean);
  }, [products]);

  // Batch load images for all items with loader
  const {
    isLoading: isImageLoading,
    isError: imageError,
    getImageUrl,
    hasImage,
    isImageLoaded,
    progress: imageLoadingProgress,
    isComplete: isImageLoadingComplete,
    summary: imageLoadingSummary
  } = useBatchItemImages({
    itemNames,
    enabled: products.length > 0
  });

  // Update performance metrics for batch image loading
  React.useEffect(() => {
    if (imageLoadingSummary) {
      setPerformanceMetrics(prev => ({
        ...prev,
        totalImages: imageLoadingSummary.total,
        optimizedImages: imageLoadingSummary.successful,
        cacheHitRate: (imageLoadingSummary.successful / imageLoadingSummary.total) * 100,
        optimizationTime: imageLoadingSummary.duration
      }));
    }
  }, [imageLoadingSummary]);

  // Remove complex preloading - use direct URLs

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

  // Handle quick add to cart
  const handleQuickAdd = (product: any) => {
    const productStock = calculateProductStock(product);
    
    if (productStock > 0) {
      const result = AddToCart(product, 1);
      
      if (result.success) {
        const featuredImage = product?.product_images?.find(
          (image: any) => image.position === "featured"
        );
        setSelectedProductImage(featuredImage);
        setCartDialogOpen(true);
        
        setTimeout(() => {
          setCartDialogOpen(false);
        }, 2000);
      }
    }
  };

  // Debug: Check for duplicate products
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development' && products.length > 0) {
      const productNames = products.map(p => p.id || p.sku || p.name);
      const duplicates = productNames.filter((name, index) => productNames.indexOf(name) !== index);
      
      if (duplicates.length > 0) {
        console.log('🔍 Duplicate products detected:', duplicates);
        console.log('📊 Total products:', products.length);
        console.log('🔍 Unique products:', new Set(productNames).size);
      }
    }
  }, [products]);

  // Loading state
  if (loading && products.length === 0) {
    return (
      <div className={className}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Products</h2>
        </div>
        <ProductsGridSkeleton count={pageSize} viewMode={viewMode} />
      </div>
    );
  }

  // Show image loading progress
  if (isImageLoading && products.length > 0) {
    return (
      <div className={className}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Products</h2>
          <div className="text-sm text-gray-600">
            Loading images... {Math.round(imageLoadingProgress)}%
          </div>
        </div>
        <div className="space-y-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${imageLoadingProgress}%` }}
            ></div>
          </div>
          <ProductsGridSkeleton count={pageSize} viewMode={viewMode} />
        </div>
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
          <h2 className="text-2xl font-bold">Products</h2>
          <p className="text-sm text-gray-600 mt-1">
            Showing {visibleProducts.length} product{visibleProducts.length === 1 ? "" : "s"}
          </p>
        </div>
      </div>

      {/* Products Grid */}
      <div
        className={
          viewMode === "grid"
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            : "space-y-4"
        }
      >
        {visibleProducts
          .map((product: any, index: number) => {
            // All products are loaded at once, so all images get priority
            const isFirstPage = true;
          const featuredImage = product?.product_images?.find(
            (image: any) => image.position === "featured"
          );
          
          // Get image URL from batch loading
          const imageUrl = getImageUrl(product.sku);
          const productHasImage = hasImage(product.sku);

          const productStock = calculateProductStock(product);
          const isOutOfStock = product.type === "variable" ? false : productStock <= 0;
          const effectivePrice = getEffectivePrice(product);
          const productHasDiscount = hasDiscount(product);
          const basePriceForDisplay = getBasePriceForDisplay(product);
          const priceRange = getPriceRange(product);
          const hasVariations = product.product_variations && product.product_variations.length > 0;
          
          // Create unique key combining multiple identifiers
          const baseId = product.id || product.sku || product.name || `product-${index}`;
          const uniqueKey = `${baseId}-${index}-${product.type || 'simple'}`;
          
          // Debug logging for duplicate products (development only)
          if (process.env.NODE_ENV === 'development') {
            const productIdentifier = product.id || product.sku || product.name;
            if (productIdentifier === 'Cotton Swab Small') {
              console.log(`🔍 Product details:`, {
                id: product.id,
                sku: product.sku,
                name: product.name,
                type: product.type,
                index,
                uniqueKey,
                baseId
              });
            }
          }

          if (viewMode === "list") {
            return (
              <Card
                key={uniqueKey}
                className="flex flex-row h-32 overflow-hidden hover:shadow-lg transition-all duration-300"
              >
                {/* Product Image */}
                <div className="w-32 h-32 flex-shrink-0">
                  <Link href={`/product/${encodeURIComponent(product.sku)}`}>
                    <ProductImagePreview
                      itemName={product.sku}
                      productName={product.name}
                      imageUrl={imageUrl}
                      hasImage={productHasImage}
                      isLoading={isImageLoading}
                      width={128}
                      height={128}
                      className="w-full h-full"
                      showPreview={true}
                    />
                  </Link>
                </div>

                {/* Product Info */}
                <div className="flex-1 p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <Link href={`/product/${encodeURIComponent(product.sku)}`}>
                        <h3 className="font-semibold text-lg hover:text-primary transition-colors line-clamp-2">
                          {product.name}
                        </h3>
                      </Link>
                      <div className="flex flex-col items-end gap-1">
                        {hasVariations && (
                          <Badge
                            variant="outline"
                            className="text-xs font-bold bg-blue-100 text-blue-800 border-blue-300"
                          >
                            {product.product_variations.length} variants
                          </Badge>
                        )}
                        {product.status === "on-sale" && !isOutOfStock && (
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
                        <>
                          <span className="font-bold text-lg text-primary">
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

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/product/${encodeURIComponent(product.sku)}`)}
                      >
                        View Details
                      </Button>
                      {(!isOutOfStock || product.enable_quote_request) && !hasVariations && (
                        <Button
                          size="sm"
                          className="text-white animated-button"
                          onClick={() => handleQuickAdd(product)}
                        >
                          <ShoppingCart className="h-4 w-4 mr-1" />
                          Quick Add
                        </Button>
                      )}
                      {(!isOutOfStock || product.enable_quote_request) && hasVariations && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/product/${encodeURIComponent(product.sku)}`)}
                        >
                          <ShoppingCart className="h-4 w-4 mr-1" />
                          Select Options
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          }

          // Grid view
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
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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

                  {/* Quick Add to Cart */}
                  {!hasVariations && (
                    <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        className="w-full text-white font-medium"
                        disabled={isOutOfStock && !product.enable_quote_request}
                        onClick={() => handleQuickAdd(product)}
                      >
                        <ShoppingCart className="h-4 w-4 mr-1" />
                        {isOutOfStock && !product.enable_quote_request
                          ? "Out of Stock"
                          : "Quick Add"}
                      </Button>
                    </div>
                  )}
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

      {/* All products loaded - no pagination needed */}

      {/* Cart Animation Dialog */}
      <CartAnimationDialog
        isOpen={cartDialogOpen}
        onOpenChange={setCartDialogOpen}
        productImageSrc={selectedProductImage}
      />

      {/* Performance Monitor - Simplified for direct URLs */}
      {process.env.NODE_ENV === 'development' && (
        <PerformanceMonitor
          metrics={performanceMetrics}
          onRefresh={() => {
            setPerformanceMetrics(prev => ({ ...prev, loadTime: 0 }));
          }}
        />
      )}
    </div>
  );
};

export default PaginatedProducts;
