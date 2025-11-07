"use client";

import { useState, useEffect, useCallback } from 'react';
import { imagesCache, cacheUtils } from '@/lib/clientCache';

interface ItemImageData {
  item_name: string;
  item_name_display: string;
  image: string | null;
  image_url: string;
  has_image: boolean;
  success: boolean;
  error?: string;
}

interface UseBatchItemImagesOptions {
  itemNames: string[];
  enabled?: boolean;
}

export const useBatchItemImages = ({
  itemNames,
  enabled = true
}: UseBatchItemImagesOptions) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageData, setImageData] = useState<Map<string, ItemImageData>>(new Map());
  const [summary, setSummary] = useState<{
    total: number;
    successful: number;
    failed: number;
    duration: number;
  } | null>(null);

  // Helper function to ensure imageData is always a Map
  const ensureImageDataIsMap = useCallback((data: any): Map<string, ItemImageData> => {
    if (data instanceof Map) {
      return data;
    }
    
    if (data && typeof data === 'object') {
      const map = new Map<string, ItemImageData>();
      Object.entries(data).forEach(([key, value]) => {
        if (typeof key === 'string' && value && typeof value === 'object') {
          map.set(key, value as ItemImageData);
        }
      });
      return map;
    }
    
    return new Map<string, ItemImageData>();
  }, []);

  const loadImages = useCallback(async () => {
    if (!enabled || !itemNames.length) return;

    setIsLoading(true);
    setIsError(false);
    setError(null);

    try {
      // Create cache key for this batch of items
      const cacheKey = `batch-images-${itemNames.sort().join('-')}`;
      
      // Check client-side cache first
      const cachedData = imagesCache.get(cacheKey);
      if (cachedData) {
        console.log(`⚡ Loading images from client cache for ${itemNames.length} items`);
        
        try {
          // Ensure cached data is properly formatted
          console.log('🔍 Loading from cache:', { 
            cacheKey, 
            cachedData,
            imageDataType: typeof cachedData.imageData,
            imageDataKeys: cachedData.imageData ? Object.keys(cachedData.imageData).length : 0,
            imageDataSample: cachedData.imageData ? Object.keys(cachedData.imageData).slice(0, 3) : 'no imageData'
          });
          const imageMap = ensureImageDataIsMap(cachedData.imageData);
          console.log('🔍 Converted to Map:', { 
            imageMapSize: imageMap.size, 
            isMap: imageMap instanceof Map,
            sampleEntries: Array.from(imageMap.entries()).slice(0, 3)
          });
          if (imageMap instanceof Map) {
            setImageData(imageMap);
            setSummary(cachedData.summary);
            setIsLoading(false);
            console.log('✅ Cache loaded successfully');
            return;
          } else {
            throw new Error('Failed to convert cached data to Map');
          }
        } catch (error) {
          console.warn('⚠️ Corrupted cache data detected, clearing cache and reloading from server', error);
          // Clear corrupted cache entry
          imagesCache.delete(cacheKey);
          // Continue to server fetch below
        }
      }

      console.log(`🚀 Batch loading images for ${itemNames.length} items from server...`);
      const startTime = performance.now();

      const response = await fetch('/api/batch-item-images', {
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
      const imageMap = new Map<string, ItemImageData>();
      console.log('🔍 Server response:', { imageResults: data.imageResults?.length, summary: data.summary });
      
      if (data.imageResults && Array.isArray(data.imageResults)) {
        data.imageResults.forEach((result: ItemImageData) => {
          if (result && result.success && result.item_name) {
            imageMap.set(result.item_name, result);
            console.log('🔍 Added to Map:', { itemName: result.item_name, hasImage: result.has_image, imageUrl: result.image_url });
          }
        });
      }

      console.log('🔍 Final Map size:', imageMap.size);
      console.log('🔍 Map entries sample:', Array.from(imageMap.entries()).slice(0, 3));

      // Ensure we have a valid Map before setting state
      if (imageMap instanceof Map) {
        // Debug: Log what we're storing in cache
        console.log('🔍 Storing in cache:', { 
          cacheKey, 
          imageMapSize: imageMap.size,
          sampleEntries: Array.from(imageMap.entries()).slice(0, 3)
        });
        
        // Convert Map to plain object for localStorage serialization
        const imageDataObject = Object.fromEntries(imageMap);
        console.log('🔍 Converting Map to object for cache:', { 
          mapSize: imageMap.size, 
          objectKeys: Object.keys(imageDataObject).length,
          sampleKeys: Object.keys(imageDataObject).slice(0, 3),
          sampleValues: Object.values(imageDataObject).slice(0, 2)
        });
        
        // Cache the response
        imagesCache.set(cacheKey, {
          imageData: imageDataObject,
          summary: data.summary
        });

        setImageData(imageMap);
        setSummary(data.summary);
        console.log('✅ Server data loaded successfully');
      } else {
        throw new Error('Failed to create valid image Map from server response');
      }

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

  // Note: Cache cleanup is handled globally, not per hook to avoid clearing cache during navigation

  // Ensure imageData is always a Map (defensive programming)
  useEffect(() => {
    if (!imageData || !(imageData instanceof Map)) {
      console.warn('🛡️ Defensive fix: Converting imageData to Map', { 
        currentType: typeof imageData,
        isMap: imageData instanceof Map,
        hasGet: typeof imageData?.get === 'function'
      });
      const safeImageData = ensureImageDataIsMap(imageData);
      if (safeImageData !== imageData) {
        setImageData(safeImageData);
      }
    }
  }, [imageData, ensureImageDataIsMap]);

  // Helper functions with robust Map validation
  const getImageData = useCallback((itemName: string): ItemImageData | null => {
    try {
      // More robust Map detection
      if (!imageData || !(imageData instanceof Map) || typeof imageData.get !== 'function') {
        console.warn('imageData is not a Map, attempting to fix...', { 
          imageData, 
          itemName, 
          isMap: imageData instanceof Map,
          hasGet: typeof imageData?.get === 'function'
        });
        const safeImageData = ensureImageDataIsMap(imageData);
        return safeImageData.get(itemName) || null;
      }
      return imageData.get(itemName) || null;
    } catch (error) {
      console.warn('Error accessing image data:', error);
      return null;
    }
  }, [imageData, ensureImageDataIsMap]);

  const getImageUrl = useCallback((itemName: string): string => {
    try {
      // More robust Map detection
      if (!imageData || !(imageData instanceof Map) || typeof imageData.get !== 'function') {
        console.warn('imageData is not a Map, attempting to fix...', { 
          imageData, 
          itemName, 
          isMap: imageData instanceof Map,
          hasGet: typeof imageData?.get === 'function'
        });
        const safeImageData = ensureImageDataIsMap(imageData);
        const data = safeImageData.get(itemName);
        const url = data?.image_url || '/placeholder.svg';
        console.log('🔍 getImageUrl (fixed):', { itemName, url, hasData: !!data });
        return url;
      }
      const data = imageData.get(itemName);
      const url = data?.image_url || '/placeholder.svg';
      console.log('🔍 getImageUrl:', { itemName, url, hasData: !!data, imageDataSize: imageData.size });
      return url;
    } catch (error) {
      console.warn('Error getting image URL:', error);
      return '/placeholder.svg';
    }
  }, [imageData, ensureImageDataIsMap]);

  const hasImage = useCallback((itemName: string): boolean => {
    try {
      // More robust Map detection
      if (!imageData || !(imageData instanceof Map) || typeof imageData.get !== 'function') {
        console.warn('imageData is not a Map, attempting to fix...', { 
          imageData, 
          itemName, 
          isMap: imageData instanceof Map,
          hasGet: typeof imageData?.get === 'function'
        });
        const safeImageData = ensureImageDataIsMap(imageData);
        const data = safeImageData.get(itemName);
        const hasImg = data?.has_image || false;
        console.log('🔍 hasImage (fixed):', { itemName, hasImg, hasData: !!data });
        return hasImg;
      }
      const data = imageData.get(itemName);
      const hasImg = data?.has_image || false;
      console.log('🔍 hasImage:', { itemName, hasImg, hasData: !!data, imageDataSize: imageData.size });
      return hasImg;
    } catch (error) {
      console.warn('Error checking if image exists:', error);
      return false;
    }
  }, [imageData, ensureImageDataIsMap]);

  const isImageLoaded = useCallback((itemName: string): boolean => {
    try {
      // More robust Map detection
      if (!imageData || !(imageData instanceof Map) || typeof imageData.has !== 'function') {
        console.warn('imageData is not a Map, attempting to fix...', { 
          imageData, 
          itemName, 
          isMap: imageData instanceof Map,
          hasHas: typeof imageData?.has === 'function'
        });
        const safeImageData = ensureImageDataIsMap(imageData);
        return safeImageData.has(itemName);
      }
      return imageData.has(itemName);
    } catch (error) {
      console.warn('Error checking if image is loaded:', error);
      return false;
    }
  }, [imageData, ensureImageDataIsMap]);

  return {
    isLoading,
    isError,
    error,
    imageData,
    summary,
    getImageData,
    getImageUrl,
    hasImage,
    isImageLoaded,
    loadImages,
    // Progress indicators
    progress: summary ? (summary.successful / summary.total) * 100 : 0,
    isComplete: summary ? summary.successful === summary.total : false
  };
};

export default useBatchItemImages;
