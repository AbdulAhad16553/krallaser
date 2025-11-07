"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, ShoppingCart, Eye, Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getOptimizedImageUrl, IMAGE_SIZES } from "@/lib/imageUtils";
import {
  formatPrice,
  getEffectivePrice,
  hasDiscount,
  calculateDiscountPercent,
  getBasePriceForDisplay,
} from "@/lib/currencyUtils";

interface RelatedProductsProps {
  products: any[];
  currentStock?: any[];
  currentProductId: string;
  storeCurrency: string;
  storeData?: any;
}

const RelatedProducts = ({
  products,
  currentStock = [],
  currentProductId,
  storeCurrency,
  storeData,
}: RelatedProductsProps) => {
  // Get dynamic colors from store data
  const primaryColor = storeData?.store_detail?.primary_color || "#3B82F6";

  // Filter out current product and limit to 4 related products
  const relatedProducts = products
    .filter((product) => product.id !== currentProductId)
    .slice(0, 4);

  if (!relatedProducts.length) {
    return null;
  }

  return (
    <div className="mt-16 space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">You Might Also Like</h2>
        <p className="text-muted-foreground">
          Similar products that other customers have purchased
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {relatedProducts.map((product) => {
          const featuredImage = product.product_images?.find(
            (img: any) => img.position === "featured"
          );

          const productHasDiscount = hasDiscount(product);
          const basePriceForDisplay = getBasePriceForDisplay(product);
          const discountPercent = calculateDiscountPercent(
            basePriceForDisplay,
            getEffectivePrice(product)
          );

          return (
            <Card
              key={product.id}
              className="group hover:shadow-lg transition-all duration-300"
            >
              <CardContent className="p-0">
                {/* Product Image */}
                <div className="relative aspect-square overflow-hidden rounded-t-lg">
                  <Link href={`/product/${product.slug}`}>
                    <Image
                      src={getOptimizedImageUrl(
                        featuredImage?.image_id,
                        IMAGE_SIZES.PRODUCT_CARD
                      )}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    />
                  </Link>

                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {productHasDiscount && (
                      <Badge variant="discount" className="text-xs">
                        -{discountPercent}%
                      </Badge>
                    )}
                    {product.status === "on-sale" && (
                      <Badge variant="sale" className="text-xs">
                        Sale
                      </Badge>
                    )}
                  </div>

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
                  <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      className="w-full text-white font-medium"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <ShoppingCart className="h-4 w-4 mr-1" />
                      Quick Add
                    </Button>
                  </div>
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
                              : "text-muted-foreground"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">(24)</span>
                  </div>

                  {/* Product Name */}
                  <Link href={`/product/${product.slug}`}>
                    <h3 className="font-medium text-sm line-clamp-2 hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                  </Link>

                  {/* Price */}
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-primary">
                      {formatPrice(
                        getEffectivePrice(product),
                        product.currency || storeCurrency
                      )}
                    </span>
                    {productHasDiscount && (
                      <span className="text-sm text-muted-foreground line-through">
                        {formatPrice(
                          basePriceForDisplay,
                          product.currency || storeCurrency
                        )}
                      </span>
                    )}
                  </div>

                  {/* Stock Status */}
                  {!product.enable_quote_request && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs text-muted-foreground">
                          In Stock
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {product.type === "variable"
                          ? "Multiple options"
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

      {/* View All Button */}
      <div className="text-center">
        <Button variant="outline" size="lg" asChild>
          <Link href="/shop">View All Products</Link>
        </Button>
      </div>
    </div>
  );
};

export default RelatedProducts;
