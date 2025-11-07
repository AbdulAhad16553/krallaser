"use client";

import { useState, useEffect, useCallback } from 'react';
import { productsCache, cacheUtils } from '@/lib/clientCache';

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalProducts: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  limit: number;
  offset: number;
}

interface Product {
  id: string;
  name: string;
  base_price: number;
  sale_price: number;
  currency: string;
  type: 'simple' | 'variable';
  product_variations?: any[];
  product_images?: any[];
  stock?: any;
  [key: string]: any;
}

interface UsePaginatedProductsOptions {
  initialPage?: number;
  pageSize?: number;
  autoLoad?: boolean;
}

interface UsePaginatedProductsReturn {
  products: Product[];
  pagination: PaginationInfo | null;
  loading: boolean;
  error: string | null;
  loadPage: (page: number) => Promise<void>;
  loadNextPage: () => Promise<void>;
  loadPrevPage: () => Promise<void>;
  refresh: () => Promise<void>;
  hasMore: boolean;
  isLoadingMore: boolean;
}

export const usePaginatedProducts = (
  options: UsePaginatedProductsOptions = {}
): UsePaginatedProductsReturn => {
  const {
    initialPage = 1,
    pageSize = 12,
    autoLoad = true
  } = options;

  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const loadPage = useCallback(async (page: number) => {
    try {
      setLoading(true);
      setError(null);

      // Create cache key
      const cacheKey = `products-page-${page}-limit-${pageSize}`;
      
      // Check client-side cache first
      const cachedData = productsCache.get(cacheKey);
      if (cachedData) {
        console.log(`⚡ Serving products page ${page} from client cache`);
        setProducts(cachedData.products);
        setPagination(cachedData.pagination);
        setLoading(false);
        return;
      }

      console.log(`🔄 Loading products page ${page} from server...`);
      
      // Only add cache-busting in development when explicitly refreshing
      const cacheParam = process.env.NODE_ENV === 'development' && page === 1 ? `&t=${Date.now()}` : '';
      const response = await fetch(`/api/products?page=${page}&limit=${pageSize}${cacheParam}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch products');
      }

      console.log(`✅ Loaded ${data.products.length} products for page ${page} (${data.loadTime}ms)`);
      
      // Cache the response
      productsCache.set(cacheKey, {
        products: data.products,
        pagination: data.pagination
      });
      
      setProducts(data.products);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Error loading products:', err);
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [pageSize]);

  const loadNextPage = useCallback(async () => {
    if (!pagination?.hasNextPage || isLoadingMore) return;

    try {
      setIsLoadingMore(true);
      setError(null);

      const nextPage = pagination.currentPage + 1;
      const cacheKey = `products-page-${nextPage}-limit-${pageSize}`;
      
      // Check client-side cache first
      const cachedData = productsCache.get(cacheKey);
      if (cachedData) {
        console.log(`⚡ Loading next page ${nextPage} from client cache`);
        setProducts(prev => [...prev, ...cachedData.products]);
        setPagination(cachedData.pagination);
        setIsLoadingMore(false);
        return;
      }

      console.log(`🔄 Loading next page ${nextPage} from server...`);
      
      const response = await fetch(`/api/products?page=${nextPage}&limit=${pageSize}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch products');
      }

      console.log(`✅ Loaded ${data.products.length} more products`);
      
      // Cache the response
      productsCache.set(cacheKey, {
        products: data.products,
        pagination: data.pagination
      });
      
      // Append new products to existing ones
      setProducts(prev => [...prev, ...data.products]);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Error loading next page:', err);
      setError(err instanceof Error ? err.message : 'Failed to load more products');
    } finally {
      setIsLoadingMore(false);
    }
  }, [pagination, pageSize, isLoadingMore]);

  const loadPrevPage = useCallback(async () => {
    if (!pagination?.hasPrevPage) return;

    const prevPage = pagination.currentPage - 1;
    await loadPage(prevPage);
  }, [pagination, loadPage]);

  const refresh = useCallback(async () => {
    // Clear cache for current page
    if (pagination) {
      const cacheKey = `products-page-${pagination.currentPage}-limit-${pageSize}`;
      productsCache.delete(cacheKey);
    }
    
    if (pagination) {
      await loadPage(pagination.currentPage);
    } else {
      await loadPage(initialPage);
    }
  }, [pagination, loadPage, initialPage, pageSize]);

  // Auto-load initial page
  useEffect(() => {
    if (autoLoad) {
      loadPage(initialPage);
    }
  }, [autoLoad, initialPage, loadPage]);

  // Note: Cache cleanup is handled globally, not per hook to avoid clearing cache during navigation

  return {
    products,
    pagination,
    loading,
    error,
    loadPage,
    loadNextPage,
    loadPrevPage,
    refresh,
    hasMore: pagination?.hasNextPage || false,
    isLoadingMore
  };
};

// Hook for infinite scroll
export const useInfiniteProducts = (
  pageSize: number = 12
): UsePaginatedProductsReturn => {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const loadMore = useCallback(async () => {
    if (isLoadingMore || (pagination && !pagination.hasNextPage)) return;

    try {
      setIsLoadingMore(true);
      setError(null);

      const nextPage = currentPage + 1;
      console.log(`🔄 Loading more products (page ${nextPage})...`);
      
      const response = await fetch(`/api/products?page=${nextPage}&limit=${pageSize}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch products');
      }

      console.log(`✅ Loaded ${data.products.length} more products`);
      
      // Append new products to existing ones
      setAllProducts(prev => [...prev, ...data.products]);
      setPagination(data.pagination);
      setCurrentPage(nextPage);
    } catch (err) {
      console.error('Error loading more products:', err);
      setError(err instanceof Error ? err.message : 'Failed to load more products');
    } finally {
      setIsLoadingMore(false);
    }
  }, [currentPage, pagination, pageSize, isLoadingMore]);

  const loadPage = useCallback(async (page: number) => {
    try {
      setLoading(true);
      setError(null);

      console.log(`🔄 Loading products page ${page}...`);
      
      const response = await fetch(`/api/products?page=${page}&limit=${pageSize}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch products');
      }

      console.log(`✅ Loaded ${data.products.length} products for page ${page}`);
      
      setAllProducts(data.products);
      setPagination(data.pagination);
      setCurrentPage(page);
    } catch (err) {
      console.error('Error loading products:', err);
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [pageSize]);

  const loadNextPage = loadMore;
  const loadPrevPage = useCallback(async () => {
    if (currentPage > 1) {
      await loadPage(currentPage - 1);
    }
  }, [currentPage, loadPage]);

  const refresh = useCallback(async () => {
    setAllProducts([]);
    setCurrentPage(1);
    await loadPage(1);
  }, [loadPage]);

  // Load initial page
  useEffect(() => {
    loadPage(1);
  }, [loadPage]);

  return {
    products: allProducts,
    pagination,
    loading,
    error,
    loadPage,
    loadNextPage,
    loadPrevPage,
    refresh,
    hasMore: pagination?.hasNextPage || false,
    isLoadingMore
  };
};

export default usePaginatedProducts;
