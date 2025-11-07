"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Package, CheckCircle } from "lucide-react";
import { formatPrice } from "@/lib/currencyUtils";

interface VariationSelectorProps {
  productVariations: any[];
  onVariationSelect: (variation: any) => void;
  selectedVariation?: any;
  storeCurrency: string;
}

export default function VariationSelector({
  productVariations = [],
  onVariationSelect,
  selectedVariation,
  storeCurrency
}: VariationSelectorProps) {
  const [availableVariations, setAvailableVariations] = useState<any[]>([]);

  useEffect(() => {
    // Filter variations that have stock > 0
    const variationsWithStock = productVariations.filter((variation: any) => {
      let stock = 0;
      if (variation.stock && variation.stock.totalStock !== undefined) {
        stock = variation.stock.totalStock;
      }
      return stock > 0;
    });
    
    setAvailableVariations(variationsWithStock);
  }, [productVariations]);

  const handleVariationClick = (variation: any) => {
    onVariationSelect(variation);
  };

  const getVariationStock = (variation: any) => {
    if (variation.stock && variation.stock.totalStock !== undefined) {
      return variation.stock.totalStock;
    }
    return 0;
  };

  const getVariationPrice = (variation: any) => {
    return variation.sale_price > 0 ? variation.sale_price : variation.base_price;
  };

  const getVariationDisplayName = (variation: any) => {
    if (variation.attributes && variation.attributes.length > 0) {
      const attributeStrings = variation.attributes.map((attr: any) => 
        `${attr.attribute}: ${attr.attribute_value}`
      );
      return `${variation.name} (${attributeStrings.join(', ')})`;
    }
    return variation.name;
  };

  if (availableVariations.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No variations available in stock</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Package className="h-5 w-5" />
          Available Variations ({availableVariations.length} options)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {availableVariations.map((variation, index) => {
            const stock = getVariationStock(variation);
            const price = getVariationPrice(variation);
            const displayName = getVariationDisplayName(variation);
            const isSelected = selectedVariation?.id === variation.id;
            const isInStock = stock > 0;

            return (
              <Card
                key={variation.id || index}
                className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                  isSelected 
                    ? 'ring-2 ring-primary bg-primary/5 border-primary' 
                    : 'hover:border-primary/50'
                } ${!isInStock ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => isInStock && handleVariationClick(variation)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm text-gray-900 line-clamp-2">
                        {displayName}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        SKU: {variation.sku}
                      </p>
                    </div>
                    {isSelected && (
                      <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 ml-2" />
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="font-bold text-lg text-primary">
                        {formatPrice(price, variation.currency || storeCurrency)}
                      </span>
                      {variation.sale_price > 0 && variation.base_price > variation.sale_price && (
                        <span className="text-sm text-gray-500 line-through">
                          {formatPrice(variation.base_price, variation.currency || storeCurrency)}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex flex-col items-end">
                      <Badge 
                        variant={stock > 10 ? "default" : stock > 0 ? "secondary" : "destructive"}
                        className="text-xs"
                      >
                        {stock} in stock
                      </Badge>
                      {stock <= 10 && stock > 0 && (
                        <span className="text-xs text-orange-600 mt-1">
                          Low stock
                        </span>
                      )}
                    </div>
                  </div>

                  {isSelected && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <Button
                        size="sm"
                        className="w-full"
                        disabled={!isInStock}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        {isInStock ? 'Selected - Ready to Add to Cart' : 'Out of Stock'}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {selectedVariation && (
          <div className="mt-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-primary" />
              <span className="font-medium text-sm text-primary">
                Selected Variation
              </span>
            </div>
            <p className="text-sm text-gray-700">
              {getVariationDisplayName(selectedVariation)}
            </p>
            <p className="text-sm text-gray-600">
              Price: {formatPrice(getVariationPrice(selectedVariation), selectedVariation.currency || storeCurrency)} | 
              Stock: {getVariationStock(selectedVariation)} units
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
