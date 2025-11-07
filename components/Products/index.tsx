"use client";

import React, { useState } from "react";
import ProductSkeleton from "@/common/Skeletons/Products";
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
import { AddToCart } from "@/sub/cart/addToCart";
import { CartAnimationDialog } from "@/common/CartAnimationDialog";

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
  const [cartDialogOpen, setCartDialogOpen] = useState(false);
  const [selectedProductImage, setSelectedProductImage] = useState<any>(null);

  // Extract item names for batch image loading
  const itemNames = React.useMemo(() => {
    return products?.map((product: any) => product.sku).filter(Boolean) || [];
  }, [products]);

  // Batch load images for all items
  const {
    isLoading: isImageLoading,
    getImageUrl,
    hasImage,
    isImageLoaded
  } = useBatchItemImages({
    itemNames,
    enabled: products && products.length > 0
  });

  // Handle quick add to cart
  const handleQuickAdd = (product: any) => {
    // Calculate product stock
    const productStock = calculateProductStock(product, currentStock);
    
    // Only add to cart if product has stock > 0
    if (productStock > 0) {
      const result = AddToCart(product, 1);
      
      if (result.success) {
        // Set the product image for animation
        const featuredImage = product?.product_images?.find(
          (image: any) => image.position === "featured"
        );
        setSelectedProductImage(featuredImage);
        setCartDialogOpen(true);
        
        // Auto close dialog after 2 seconds
        setTimeout(() => {
          setCartDialogOpen(false);
        }, 2000);
      }
    }
  };

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
          
          // Get image URL from batch loading
          const imageUrl = getImageUrl(product.sku);
          const productHasImage = hasImage(product.sku);

          // Calculate real stock for this product
          const productStock = calculateProductStock(product, currentStock);
          const isOutOfStock = product.type === "variable" ? false : productStock <= 0;
          const effectivePrice = getEffectivePrice(product);
          const productHasDiscount = hasDiscount(product);
          const basePriceForDisplay = getBasePriceForDisplay(product);
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
                        {/* Variation Count Badge */}
                        {product.product_variations && product.product_variations.length > 0 && (
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

          // Grid view (existing code with improvements)
          return (
            <Card
              key={product.id}
              className="group hover:shadow-lg transition-all duration-300 overflow-hidden"
            >
              <CardContent className="p-0">
                {/* Product Image */}
                <div className="relative aspect-square overflow-hidden">
                  {/* Status Badge - Moved inside the relative container */}
                  <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
                    {/* Variation Count Badge - Show for products with variations */}
                    {product.product_variations && product.product_variations.length > 0 && (
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

                  {/* Quick Add to Cart - Only show for simple products (no variations) */}
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
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {/* Cart Animation Dialog */}
      <CartAnimationDialog
        isOpen={cartDialogOpen}
        onOpenChange={setCartDialogOpen}
        productImageSrc={selectedProductImage}
      />
    </section>
  );
};

export default Products;
