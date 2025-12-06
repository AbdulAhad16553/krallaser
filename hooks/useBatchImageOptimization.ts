"use client";

import { useState, useEffect, useCallback } from 'react';
import { imageCache, getCachedOptimizedUrl } from '@/lib/imageCache';

interface OptimizedImage {
  imageId: string;
  optimizedUrl: string;
  thumbnailUrl: string;
  success: boolean;
  error?: string;
}

interface BatchOptimizationResult {
  error: string;
  success: boolean;
  optimizedImages: OptimizedImage[];
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
  timestamp: string;
}

interface UseBatchImageOptimizationOptions {
  imageIds: string[];
  width?: number;
  height?: number;
  quality?: number;
  format?: string;
  enabled?: boolean;
}

export const useBatchImageOptimization = ({
  imageIds,
  width = 400,
  height = 400,
  quality = 80,
  format = 'webp',
  enabled = true
}: UseBatchImageOptimizationOptions) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [optimizedImages, setOptimizedImages] = useState<Map<string, OptimizedImage>>(new Map());
  const [summary, setSummary] = useState<{ total: number; successful: number; failed: number } | null>(null);

  const optimizeImages = useCallback(async () => {
    if (!enabled || !imageIds.length) return;

    setIsLoading(true);
    setIsError(false);
    setError(null);

    try {
      console.log(`🚀 Starting batch optimization for ${imageIds.length} images...`);
      const startTime = performance.now();

      // Check cache first for instant results
      const cachedResults = new Map<string, OptimizedImage>();
      const uncachedIds: string[] = [];

      imageIds.forEach(imageId => {
        const cacheKey = `${imageId}-${width}-${height}-${quality}`;
        const cachedUrl = imageCache.get(cacheKey);
        
        if (cachedUrl) {
          cachedResults.set(imageId, {
            imageId,
            optimizedUrl: cachedUrl,
            thumbnailUrl: getCachedOptimizedUrl(imageId, { width: 100, height: 100, quality: 70 }),
            success: true
          });
        } else {
          uncachedIds.push(imageId);
        }
      });

      console.log(`📦 Found ${cachedResults.size} cached images, optimizing ${uncachedIds.length} new images`);

      let batchResults: OptimizedImage[] = [];
      
      if (uncachedIds.length > 0) {
        const response = await fetch('/api/batch-optimized-images', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            imageIds: uncachedIds,
            options: { width, height, quality, format }
          }),
        });

        const data: BatchOptimizationResult = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to optimize images');
        }

        batchResults = data.optimizedImages;
        
        // Cache the new results
        batchResults.forEach(img => {
          if (img.success) {
            const cacheKey = `${img.imageId}-${width}-${height}-${quality}`;
            imageCache.set(cacheKey, img.optimizedUrl);
          }
        });
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Combine cached and new results
      const allResults = [...Array.from(cachedResults.values()), ...batchResults];
      const imageMap = new Map<string, OptimizedImage>();
      allResults.forEach(img => {
        imageMap.set(img.imageId, img);
      });

      const successful = allResults.filter(img => img.success).length;
      const total = imageIds.length;

      console.log(`✅ Batch optimization completed in ${duration.toFixed(2)}ms`);
      console.log(`📊 Results: ${successful}/${total} images optimized successfully`);

      setOptimizedImages(imageMap);
      setSummary({
        total,
        successful,
        failed: total - successful
      });

    } catch (err) {
      console.error('❌ Batch image optimization failed:', err);
      setIsError(true);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [imageIds, width, height, quality, format, enabled]);

  // Auto-optimize when imageIds change
  useEffect(() => {
    if (enabled && imageIds.length > 0) {
      optimizeImages();
    }
  }, [optimizeImages, enabled]);

  // Helper function to get optimized URL for a specific image
  const getOptimizedUrl = useCallback((imageId: string): string => {
    const optimized = optimizedImages.get(imageId);
    return optimized?.success ? optimized.optimizedUrl : '/placeholder.svg';
  }, [optimizedImages]);

  // Helper function to get thumbnail URL for a specific image
  const getThumbnailUrl = useCallback((imageId: string): string => {
    const optimized = optimizedImages.get(imageId);
    return optimized?.success ? optimized.thumbnailUrl : '/placeholder.svg';
  }, [optimizedImages]);

  // Helper function to check if an image was successfully optimized
  const isImageOptimized = useCallback((imageId: string): boolean => {
    const optimized = optimizedImages.get(imageId);
    return optimized?.success || false;
  }, [optimizedImages]);

  return {
    isLoading,
    isError,
    error,
    optimizedImages,
    summary,
    getOptimizedUrl,
    getThumbnailUrl,
    isImageOptimized,
    optimizeImages,
    // Progress indicators
    progress: summary ? (summary.successful / summary.total) * 100 : 0,
    isComplete: summary ? summary.successful === summary.total : false
  };
};

export default useBatchImageOptimization;
