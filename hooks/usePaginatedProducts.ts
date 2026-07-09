"use client";

import { useState, useEffect, useCallback } from "react";
import { productsCache } from "@/lib/clientCache";

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
  type: "simple" | "variable";
  product_variations?: any[];
  product_images?: any[];
  stock?: any;
  [key: string]: any;
}

interface UsePaginatedProductsOptions {
  initialPage?: number;
  pageSize?: number;
  autoLoad?: boolean;
  mode?: "all" | "machine" | "parts";
  initialProducts?: Product[];
  /**
   * When true (default), loads every page from `/api/products` once so the UI can filter/search on the client.
   */
  loadFullCatalog?: boolean;
  /**
   * When true, skips per-item price/stock ERP calls for faster catalog listing.
   */
  light?: boolean;
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

const BATCH_LIMIT = 500;

export const usePaginatedProducts = (
  options: UsePaginatedProductsOptions = {}
): UsePaginatedProductsReturn => {
  const {
    initialPage = 1,
    pageSize = 12,
    autoLoad = true,
    mode = "all",
    initialProducts = [],
    loadFullCatalog = true,
    light = false,
  } = options;

  const hasInitialProducts = initialProducts.length > 0;
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [pagination, setPagination] = useState<PaginationInfo | null>(
    hasInitialProducts
      ? {
          currentPage: 1,
          totalPages: 1,
          totalProducts: initialProducts.length,
          hasNextPage: false,
          hasPrevPage: false,
          limit: initialProducts.length,
          offset: 0,
        }
      : null
  );
  const [loading, setLoading] = useState(autoLoad && !hasInitialProducts);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const loadFullCatalogFn = useCallback(async (background = false) => {
    try {
      if (!background) setLoading(true);
      setError(null);

      const modeParam = mode !== "all" ? `&mode=${mode}` : "";
      const lightParam = light ? "&light=1" : "";
      const nocacheParam =
        process.env.NODE_ENV === "development" ? "&nocache=1" : "";

      const acc: Product[] = [];
      let page = 1;

      while (true) {
        const response = await fetch(
          `/api/products?page=${page}&limit=${BATCH_LIMIT}${modeParam}${lightParam}${nocacheParam}`
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch products");
        }

        const batch = Array.isArray(data.products) ? data.products : [];
        acc.push(...batch);

        if (batch.length === 0) break;
        if (batch.length < BATCH_LIMIT) break;
        page += 1;
        if (page > 400) break;
      }

      setProducts(acc);
      setPagination({
        currentPage: 1,
        totalPages: 1,
        totalProducts: acc.length,
        hasNextPage: false,
        hasPrevPage: false,
        limit: acc.length || BATCH_LIMIT,
        offset: 0,
      });
    } catch (err) {
      console.error("Error loading catalog:", err);
      setError(err instanceof Error ? err.message : "Failed to load products");
    } finally {
      if (!background) setLoading(false);
    }
  }, [mode, light]);

  const loadPage = useCallback(
    async (page: number) => {
      if (loadFullCatalog) {
        await loadFullCatalogFn();
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const cacheKey = `products-v2-page-${page}-limit-${pageSize}-mode-${mode}`;
        const cachedData = productsCache.get(cacheKey);
        if (cachedData) {
          setProducts(cachedData.products);
          setPagination(cachedData.pagination);
          setLoading(false);
          return;
        }

        const modeParam = mode !== "all" ? `&mode=${mode}` : "";
        const lightParam = light ? "&light=1" : "";
        const nocacheParam =
          process.env.NODE_ENV === "development" ? "&nocache=1" : "";
        const response = await fetch(
          `/api/products?page=${page}&limit=${pageSize}${modeParam}${lightParam}${nocacheParam}`
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch products");
        }

        productsCache.set(cacheKey, {
          products: data.products,
          pagination: data.pagination,
        });

        setProducts(data.products);
        setPagination(data.pagination);
      } catch (err) {
        console.error("Error loading products:", err);
        setError(err instanceof Error ? err.message : "Failed to load products");
      } finally {
        setLoading(false);
      }
    },
    [loadFullCatalog, loadFullCatalogFn, pageSize, mode, light]
  );

  const loadNextPage = useCallback(async () => {
    if (loadFullCatalog || !pagination?.hasNextPage || isLoadingMore) return;

    try {
      setIsLoadingMore(true);
      setError(null);

      const nextPage = pagination.currentPage + 1;
      const cacheKey = `products-v2-page-${nextPage}-limit-${pageSize}-mode-${mode}`;

      const cachedData = productsCache.get(cacheKey);
      if (cachedData) {
        setProducts((prev) => [...prev, ...cachedData.products]);
        setPagination(cachedData.pagination);
        setIsLoadingMore(false);
        return;
      }

      const modeParam = mode !== "all" ? `&mode=${mode}` : "";
      const lightParam = light ? "&light=1" : "";
      const nocacheParam =
        process.env.NODE_ENV === "development" ? "&nocache=1" : "";
      const response = await fetch(
        `/api/products?page=${nextPage}&limit=${pageSize}${modeParam}${lightParam}${nocacheParam}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch products");
      }

      productsCache.set(cacheKey, {
        products: data.products,
        pagination: data.pagination,
      });

      setProducts((prev) => [...prev, ...data.products]);
      setPagination(data.pagination);
    } catch (err) {
      console.error("Error loading more products:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load more products"
      );
    } finally {
      setIsLoadingMore(false);
    }
  }, [loadFullCatalog, pagination, pageSize, isLoadingMore, mode, light]);

  const loadPrevPage = useCallback(async () => {
    if (!pagination?.hasPrevPage || loadFullCatalog) return;
    await loadPage(pagination.currentPage - 1);
  }, [pagination, loadPage, loadFullCatalog]);

  const refresh = useCallback(async () => {
    if (loadFullCatalog) {
      await loadFullCatalogFn();
      return;
    }
    if (pagination) {
      const cacheKey = `products-v2-page-${pagination.currentPage}-limit-${pageSize}-mode-${mode}`;
      productsCache.delete(cacheKey);
    }
    if (pagination) {
      await loadPage(pagination.currentPage);
    } else {
      await loadPage(initialPage);
    }
  }, [
    loadFullCatalog,
    loadFullCatalogFn,
    pagination,
    loadPage,
    initialPage,
    pageSize,
    mode,
  ]);

  useEffect(() => {
    if (autoLoad) {
      if (hasInitialProducts && loadFullCatalog) {
        loadFullCatalogFn(true);
      } else if (!hasInitialProducts) {
        loadPage(initialPage);
      }
    }
  }, [autoLoad, initialPage, loadPage, hasInitialProducts, loadFullCatalog, loadFullCatalogFn]);

  return {
    products,
    pagination,
    loading,
    error,
    loadPage,
    loadNextPage,
    loadPrevPage,
    refresh,
    hasMore: loadFullCatalog ? false : pagination?.hasNextPage || false,
    isLoadingMore,
  };
};

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

      const response = await fetch(
        `/api/products?page=${nextPage}&limit=${pageSize}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch products");
      }

      setAllProducts((prev) => [...prev, ...data.products]);
      setPagination(data.pagination);
      setCurrentPage(nextPage);
    } catch (err) {
      console.error("Error loading more products:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load more products"
      );
    } finally {
      setIsLoadingMore(false);
    }
  }, [currentPage, pagination, pageSize, isLoadingMore]);

  const loadPage = useCallback(
    async (page: number) => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/products?page=${page}&limit=${pageSize}`
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch products");
        }

        setAllProducts(data.products);
        setPagination(data.pagination);
        setCurrentPage(page);
      } catch (err) {
        console.error("Error loading products:", err);
        setError(err instanceof Error ? err.message : "Failed to load products");
      } finally {
        setLoading(false);
      }
    },
    [pageSize]
  );

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
    isLoadingMore,
  };
};

export default usePaginatedProducts;
