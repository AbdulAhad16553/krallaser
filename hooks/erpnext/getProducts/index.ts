import { productService } from '@/lib/erpnext/services/productService';
import { useState, useEffect, useCallback } from 'react';

export interface Product {
  id: string;
  name: string;
  short_description?: string;
  detailed_desc?: string;
  type: string;
  currency: string;
  base_price: number;
  status: string;
  sale_price: number;
  sku: string;
  slug: string;
  enable_quote_request: boolean;
  product_images?: Array<{
    id: string;
    image_id: string;
    position: number;
  }>;
  product_variations?: Array<{
    sale_price: number;
    base_price: number;
    sku: string;
  }>;
}

export interface StockInfo {
  sku: string;
  available_quantity: number;
  reserved_quantity: number;
  total_quantity: number;
  warehouse_id: string;
  store_warehouse?: {
    name: string;
  };
}

// Cache configuration
const CACHE_KEY = 'products_cache';
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes in milliseconds

interface CacheData {
  products: Product[];
  timestamp: number;
}

// Cache utility functions
const getCachedProducts = (): Product[] | null => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    
    const cacheData: CacheData = JSON.parse(cached);
    const now = Date.now();
    
    // Check if cache is still valid
    if (now - cacheData.timestamp > CACHE_EXPIRY) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    
    return cacheData.products;
  } catch (error) {
    console.error('Error reading from cache:', error);
    localStorage.removeItem(CACHE_KEY);
    return null;
  }
};

const setCachedProducts = (products: Product[]): void => {
  try {
    const cacheData: CacheData = {
      products,
      timestamp: Date.now()
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
  } catch (error) {
    console.error('Error writing to cache:', error);
  }
};

// Cache invalidation utility
export const clearProductsCache = (): void => {
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
};

// Check if cache exists and is valid
export const isProductsCacheValid = (): boolean => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return false;
    
    const cacheData: CacheData = JSON.parse(cached);
    const now = Date.now();
    
    return (now - cacheData.timestamp) <= CACHE_EXPIRY;
  } catch (error) {
    return false;
  }
};

export const useProducts = (storeId?: string) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [stockInfo, setStockInfo] = useState<StockInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async (forceRefresh = false) => {
    try {
      // Check cache first if not forcing refresh
      if (!forceRefresh) {
        const cachedProducts = getCachedProducts();
        if (cachedProducts && cachedProducts.length > 0) {
          setProducts(cachedProducts);
          setLoading(false);
          return;
        }
      }

      setLoading(true);
      setError(null);

      // Fetch products from our API endpoint
      const response = await fetch('/api/products');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch products');
      }
      
      const erpnextProducts = data.products || [];
      
      // The API already returns products in the correct format
      const transformedProducts: Product[] = erpnextProducts;

      setProducts(transformedProducts);
      
      // Cache the products
      setCachedProducts(transformedProducts);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts, storeId]);

  return {
    products,
    stockInfo,
    loading,
    error,
    refetch: () => fetchProducts(true) // Force refresh when refetch is called
  };
};

export const useProduct = (productSlug: string, storeId?: string) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [stockInfo, setStockInfo] = useState<StockInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch single product from ERPNext
      const erpnextProduct = await productService.getProduct(productSlug);
      
      // Transform ERPNext product to match our interface
      const transformedProduct: Product = {
        id: erpnextProduct.name,
        name: erpnextProduct.item_name,
        short_description: erpnextProduct.description,
        detailed_desc: erpnextProduct.description,
        type: 'simple',
        currency: 'USD',
        base_price: erpnextProduct.standard_rate,
        status: erpnextProduct.disabled ? 'inactive' : 'active',
        sale_price: erpnextProduct.standard_rate,
      sku: erpnextProduct.item_code || erpnextProduct.name || 'item',
      slug: (erpnextProduct.item_code || erpnextProduct.name || 'item').toLowerCase().replace(/\s+/g, '-'),
        enable_quote_request: true,
        product_images: erpnextProduct.website_image ? [{
          id: 'img-1',
          image_id: erpnextProduct.website_image,
          position: 1
        }] : [],
        product_variations: erpnextProduct.has_variants ? [{
          sale_price: erpnextProduct.standard_rate,
          base_price: erpnextProduct.standard_rate,
          sku: erpnextProduct.item_code
        }] : []
      };

      setProduct(transformedProduct);

      // Fetch stock information for this product
      const stockData = await productService.getStockBalance({ item_code: productSlug });
      const transformedStock: StockInfo[] = stockData.map(stock => ({
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
      console.error('Error fetching product:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch product');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productSlug) {
      fetchProduct();
    }
  }, [productSlug, storeId]);

  return {
    product,
    stockInfo,
    loading,
    error,
    refetch: fetchProduct
  };
};

export const useSearchProducts = (searchTerm: string, storeId?: string) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchProducts = async (term: string) => {
    if (!term.trim()) {
      setProducts([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const erpnextProducts = await productService.searchProducts(term);
      
      const transformedProducts: Product[] = erpnextProducts.map((product, index) => ({
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
    } catch (err) {
      console.error('Error searching products:', err);
      setError(err instanceof Error ? err.message : 'Failed to search products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchTerm) {
      searchProducts(searchTerm);
    }
  }, [searchTerm, storeId]);

  return {
    products,
    loading,
    error,
    searchProducts
  };
};
