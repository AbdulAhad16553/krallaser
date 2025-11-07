"use client";

import { useState, useEffect, useCallback } from 'react';

interface FastImageData {
  item_name: string;
  item_name_display: string;
  image: string;
  optimized_image: string;
  thumbnail: string;
  has_image: boolean;
  success: boolean;
  performance: {
    api_call_time: number;
    optimized: boolean;
    format: string;
    quality: number;
  };
}

interface UseFastImageLoadingOptions {
  itemName: string;
  enabled?: boolean;
}

export const useFastImageLoading = ({
  itemName,
  enabled = true
}: UseFastImageLoadingOptions) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageData, setImageData] = useState<FastImageData | null>(null);

  const loadImage = useCallback(async () => {
    if (!enabled || !itemName) return;

    setIsLoading(true);
    setIsError(false);
    setError(null);

    try {
      console.log(`🚀 Loading fast image for: ${itemName}`);
      const startTime = performance.now();

      const response = await fetch(`/api/product-image-fast?item_name=${encodeURIComponent(itemName)}`);
      const data: FastImageData = await response.json();

      if (!response.ok) {
        throw new Error('Failed to load image');
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      console.log(`✅ Fast image loaded in ${duration.toFixed(2)}ms for: ${itemName}`);

      setImageData(data);

    } catch (err) {
      console.error('❌ Fast image loading failed:', err);
      setIsError(true);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [itemName, enabled]);

  // Auto-load when itemName changes
  useEffect(() => {
    if (enabled && itemName) {
      loadImage();
    }
  }, [loadImage, enabled]);

  // Helper functions
  const getOptimizedUrl = useCallback((): string => {
    return imageData?.optimized_image || '/placeholder.svg';
  }, [imageData]);

  const getThumbnailUrl = useCallback((): string => {
    return imageData?.thumbnail || '/placeholder.svg';
  }, [imageData]);

  const hasImage = useCallback((): boolean => {
    return imageData?.has_image || false;
  }, [imageData]);

  const getImagePath = useCallback((): string | null => {
    return imageData?.image || null;
  }, [imageData]);

  return {
    isLoading,
    isError,
    error,
    imageData,
    getOptimizedUrl,
    getThumbnailUrl,
    hasImage,
    getImagePath,
    loadImage,
    // Performance metrics
    isOptimized: imageData?.performance?.optimized || false,
    format: imageData?.performance?.format || 'unknown',
    quality: imageData?.performance?.quality || 0
  };
};

export default useFastImageLoading;
