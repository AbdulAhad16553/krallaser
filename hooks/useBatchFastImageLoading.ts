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

interface BatchFastImageLoadingOptions {
  itemNames: string[];
  enabled?: boolean;
}

export const useBatchFastImageLoading = ({
  itemNames,
  enabled = true
}: BatchFastImageLoadingOptions) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageData, setImageData] = useState<Map<string, FastImageData>>(new Map());
  const [summary, setSummary] = useState<{
    total: number;
    successful: number;
    failed: number;
    duration: number;
  } | null>(null);

  const loadImages = useCallback(async () => {
    if (!enabled || !itemNames.length) return;

    setIsLoading(true);
    setIsError(false);
    setError(null);

    try {
      console.log(`🚀 Batch loading images for ${itemNames.length} items...`);
      const startTime = performance.now();

      const response = await fetch('/api/batch-product-images-fast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemNames
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load images');
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      console.log(`✅ Batch image loading completed in ${duration.toFixed(2)}ms`);
      console.log(`📊 Results: ${data.summary.successful}/${data.summary.total} images loaded successfully`);

      // Convert array to Map for O(1) lookup
      const imageMap = new Map<string, FastImageData>();
      data.imageResults.forEach((result: FastImageData) => {
        if (result.success) {
          imageMap.set(result.item_name, result);
        }
      });

      setImageData(imageMap);
      setSummary(data.summary);

    } catch (err) {
      console.error('❌ Batch image loading failed:', err);
      setIsError(true);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [itemNames, enabled]);

  // Auto-load when itemNames change
  useEffect(() => {
    if (enabled && itemNames.length > 0) {
      loadImages();
    }
  }, [loadImages, enabled]);

  // Helper functions
  const getImageData = useCallback((itemName: string): FastImageData | null => {
    if (!imageData || typeof imageData.get !== 'function') {
      return null;
    }
    return imageData.get(itemName) || null;
  }, [imageData]);

  const getOptimizedUrl = useCallback((itemName: string): string => {
    if (!imageData || typeof imageData.get !== 'function') {
      return '/placeholder.svg';
    }
    const data = imageData.get(itemName);
    return data?.optimized_image || '/placeholder.svg';
  }, [imageData]);

  const getThumbnailUrl = useCallback((itemName: string): string => {
    if (!imageData || typeof imageData.get !== 'function') {
      return '/placeholder.svg';
    }
    const data = imageData.get(itemName);
    return data?.thumbnail || '/placeholder.svg';
  }, [imageData]);

  const hasImage = useCallback((itemName: string): boolean => {
    if (!imageData || typeof imageData.get !== 'function') {
      return false;
    }
    const data = imageData.get(itemName);
    return data?.has_image || false;
  }, [imageData]);

  const isImageLoaded = useCallback((itemName: string): boolean => {
    if (!imageData || typeof imageData.has !== 'function') {
      return false;
    }
    return imageData.has(itemName);
  }, [imageData]);

  return {
    isLoading,
    isError,
    error,
    imageData,
    summary,
    getImageData,
    getOptimizedUrl,
    getThumbnailUrl,
    hasImage,
    isImageLoaded,
    loadImages,
    // Progress indicators
    progress: summary ? (summary.successful / summary.total) * 100 : 0,
    isComplete: summary ? summary.successful === summary.total : false
  };
};

export default useBatchFastImageLoading;
