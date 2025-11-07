"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RefreshCw, Filter } from "lucide-react";

interface AttributeValue {
  attribute: string;
  attribute_value: string;
}

interface AttributeFilterProps {
  templateItemName: string;
  onAttributeChange: (attributes: AttributeValue[]) => void;
  selectedAttributes?: AttributeValue[];
  productVariations?: any[];
}

export default function AttributeFilter({
  templateItemName,
  onAttributeChange,
  selectedAttributes = [],
  productVariations = []
}: AttributeFilterProps) {
  const [attributes, setAttributes] = useState<AttributeValue[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch attributes from ERPNext API
  const fetchAttributes = async () => {
    if (!templateItemName) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Use our API route to fetch attributes
      const response = await fetch(`/api/attributes?template=${encodeURIComponent(templateItemName)}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch attributes: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setAttributes(data.attributes || []);
    } catch (err: any) {
      console.error('Error fetching attributes:', err);
      setError(err.message || 'Failed to fetch attributes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttributes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateItemName]);

  const handleAttributeChange = (attribute: string, value: string) => {
    const newAttributes = selectedAttributes.filter(attr => attr.attribute !== attribute);
    newAttributes.push({ attribute, attribute_value: value });
    onAttributeChange(newAttributes);
  };

  const handleReset = () => {
    onAttributeChange([]);
  };

  // Group attributes by attribute name
  const groupedAttributes = attributes.reduce((acc, attr) => {
    if (!acc[attr.attribute]) {
      acc[attr.attribute] = [];
    }
    acc[attr.attribute].push(attr.attribute_value);
    return acc;
  }, {} as Record<string, string[]>);

  // Function to get stock for a specific variation
  const getVariationStock = (attributeName: string, attributeValue: string) => {
    if (!productVariations || productVariations.length === 0) return 0;
    
    // Find variations that match this attribute combination
    const matchingVariations = productVariations.filter((variation: any) => {
      // Check if this variation has the matching attribute
      return variation.attributes?.some((attr: any) => 
        attr.attribute === attributeName && attr.attribute_value === attributeValue
      );
    });
    
    // Sum up stock from all matching variations
    let totalStock = 0;
    matchingVariations.forEach((variation: any) => {
      if (variation.stock && variation.stock.totalStock) {
        totalStock += variation.stock.totalStock;
      }
    });
    
    // Debug logging
    if (totalStock > 0) {
      console.log(`Stock for ${attributeName}: ${attributeValue}`, {
        matchingVariations: matchingVariations.length,
        totalStock,
        variations: matchingVariations.map(v => ({ name: v.name, stock: v.stock }))
      });
    }
    
    return totalStock;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            Loading attributes...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-red-600 text-center">
            Error: {error}
          </div>
          <Button 
            onClick={fetchAttributes} 
            variant="outline" 
            size="sm" 
            className="mt-2 w-full"
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (Object.keys(groupedAttributes).length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-gray-500 text-center">
            No attributes available for this product
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Filter className="h-5 w-5" />
          Product Attributes
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="ml-auto h-8 px-2 text-xs text-gray-600 hover:text-gray-900"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Reset
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(groupedAttributes).map(([attributeName, values]) => {
          const selectedValue = selectedAttributes.find(
            attr => attr.attribute === attributeName
          )?.attribute_value || 'all';

          return (
            <div key={attributeName} className="space-y-3">
              <Label className="text-sm font-medium text-gray-900">
                {attributeName}
              </Label>
              <RadioGroup
                value={selectedValue}
                onValueChange={(value) => handleAttributeChange(attributeName, value)}
                className="flex flex-wrap gap-3"
              >
                <div className="grid grid-cols-5 gap-2 w-full">
                  {values.map((value, index) => (
                    <div key={index} className="flex items-center space-x-2 w-full">
                      <RadioGroupItem 
                        value={value} 
                        id={`${attributeName}-${index}`} 
                      />
                      <Label htmlFor={`${attributeName}-${index}`} className="text-sm flex-1">
                        {value}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
