import { productService } from '@/lib/erpnext/services/productService';
import { useState, useEffect } from 'react';

export interface Category {
  id: string;
  name: string;
  slug: string;
  image_id?: string;
  featured: boolean;
  parent_id?: string;
}

export const useCategories = (storeId?: string) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch categories from ERPNext
      const erpnextCategories = await productService.getCategories();
      
      // Transform ERPNext categories to match our interface
      const transformedCategories: Category[] = erpnextCategories
        .filter(category => !category.is_group) // Only get leaf categories
        .map(category => ({
          id: category.name,
          name: category.item_group_name,
          slug: category.name.toLowerCase().replace(/\s+/g, '-'),
          image_id: category.image,
          featured: false, // You can customize this based on your needs
          parent_id: category.parent_item_group
        }));

      setCategories(transformedCategories);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [storeId]);

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories
  };
};

export const useCategoryProducts = (categorySlug: string, storeId?: string) => {
  const [products, setProducts] = useState<any[]>([]);
  const [stockInfo, setStockInfo] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategoryProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch products by category from ERPNext
      const erpnextProducts = await productService.getProductsByCategory(categorySlug);
      
      // Transform ERPNext products to match our interface
      const transformedProducts = erpnextProducts.map((product, index) => ({
        id: product.name,
        name: product.item_name,
        short_description: product.description,
        detailed_desc: product.description,
        type: 'simple',
        currency: 'USD',
        base_price: product.standard_rate,
        status: product.disabled ? 'inactive' : 'active',
        sale_price: product.standard_rate,
        sku: product.item_code || product.name || `item-${index}`,
        slug: (product.item_code || product.name || `item-${index}`).toLowerCase().replace(/\s+/g, '-'),
        enable_quote_request: true,
        product_images: product.website_image ? [{
          id: `img-${index}`,
          image_id: product.website_image,
          position: 1
        }] : [],
        product_variations: product.has_variants ? [{
          sale_price: product.standard_rate,
          base_price: product.standard_rate,
          sku: product.item_code
        }] : []
      }));

      setProducts(transformedProducts);

      // Fetch stock information
      const stockData = await productService.getStockBalance();
      const transformedStock = stockData.map(stock => ({
        sku: stock.item_code,
        available_quantity: stock.actual_qty,
        reserved_quantity: stock.reserved_qty,
        total_quantity: stock.projected_qty,
        warehouse_id: stock.warehouse,
        store_warehouse: {
          name: stock.warehouse
        }
      }));

      setStockInfo(transformedStock);
    } catch (err) {
      console.error('Error fetching category products:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch category products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (categorySlug) {
      fetchCategoryProducts();
    }
  }, [categorySlug, storeId]);

  return {
    products,
    stockInfo,
    loading,
    error,
    refetch: fetchCategoryProducts
  };
};
