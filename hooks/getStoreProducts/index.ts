"use client";

import { useState, useEffect } from 'react';

export interface StoreTemplate {
  name: string;
  item_name: string;
  item_group: string;
  stock_uom: string;
  image: string | null;
  variants: StoreVariant[];
}

export interface StoreVariant {
  name: string;
  item_name: string;
  variant_of: string;
  attributes: any[];
  image: string | null;
}

export interface StoreProductsResponse {
  success: boolean;
  total_templates: number;
  templates: StoreTemplate[];
}

export const useStoreProducts = () => {
  const [products, setProducts] = useState<StoreTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStoreProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/fetchStore');
      const data: StoreProductsResponse = await response.json();
      
      if (data.success) {
        setProducts(data.templates);
      } else {
        setError('Failed to fetch store products');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStoreProducts();
  }, []);

  return {
    products,
    loading,
    error,
    refetch: fetchStoreProducts
  };
};

// Transform store template to match existing product interface
export const transformStoreTemplateToProduct = (template: StoreTemplate) => {
  // Extract unique attributes from variants
  const allAttributes = template.variants.flatMap(variant => variant.attributes || []);
  const uniqueAttributes = Array.from(new Set(allAttributes.map(attr => attr.attribute || attr.name)));
  
  // Create product attributes structure
  const productAttributes = uniqueAttributes.map((attrName, index) => {
    const attributeValues = Array.from(new Set(
      allAttributes
        .filter(attr => (attr.attribute || attr.name) === attrName)
        .map(attr => attr.attribute_value || attr.value)
    ));
    
    return {
      id: `attr-${index}`,
      name: attrName,
      product_attributes_values: attributeValues.map((value, valueIndex) => ({
        id: `val-${index}-${valueIndex}`,
        value: value
      }))
    };
  });

  return {
    id: template.name,
    name: template.item_name,
    short_description: `${template.item_name} - ${template.item_group}`,
    detailed_desc: `${template.item_name} - ${template.item_group}. Available variants: ${template.variants.map(v => v.item_name).join(', ')}`,
    type: template.variants.length > 0 ? 'variable' : 'simple',
    currency: 'USD',
    base_price: 0, // Will be set from variants
    sale_price: 0, // Will be set from variants
    status: 'active',
    sku: template.name,
    slug: template.name.toLowerCase().replace(/\s+/g, '-'),
    enable_quote_request: true,
    product_images: template.image ? [{
      id: 'img-1',
      image_id: template.image,
      position: 1
    }] : [],
    product_variations: template.variants.map((variant, index) => ({
      id: `var-${index}`,
      sku: variant.name,
      base_price: 0, // Default price, should be fetched from ERPNext
      sale_price: 0, // Default price, should be fetched from ERPNext
      product_variation_attributes: (variant.attributes || []).map((attr, attrIndex) => ({
        attribute_id: productAttributes.find(pa => pa.name === (attr.attribute || attr.name))?.id || `attr-${attrIndex}`,
        attribute_value_id: productAttributes
          .find(pa => pa.name === (attr.attribute || attr.name))
          ?.product_attributes_values
          .find(pav => pav.value === (attr.attribute_value || attr.value))?.id || `val-${attrIndex}`
      }))
    })),
    product_attributes: productAttributes,
    current_stock: [], // Will be populated from stock data
    // Store original template data for reference
    _template: template
  };
};

// Fetch a specific template product by slug (client-side version)
export const getStoreTemplateProduct = async (slug: string) => {
  try {
    const response = await fetch('/api/fetchStore');
    const data: StoreProductsResponse = await response.json();
    
    if (data.success) {
      console.log('Looking for slug:', slug);
      console.log('Available templates:', data.templates.map(t => t.name));
      
      // Find the template that matches the slug
      const template = data.templates.find(t => {
        const templateSlug = t.name.toLowerCase().replace(/\s+/g, '-');
        console.log('Comparing:', templateSlug, 'with', slug.toLowerCase());
        return templateSlug === slug.toLowerCase();
      });
      
      if (template) {
        console.log('Found template:', template);
        return {
          product: {
            products: [transformStoreTemplateToProduct(template)]
          },
          currentStock: [] // Will be populated from stock data
        };
      } else {
        console.log('No template found for slug:', slug);
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching store template product:', error);
    return null;
  }
};

