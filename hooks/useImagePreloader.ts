"use client";

import { useEffect } from 'react';
import { getOptimizedImageUrl } from '@/lib/imageUtils';

interface UseImagePreloaderOptions {
  images: string[];
  priority?: boolean;
  width?: number;
  height?: number;
}

export const useImagePreloader = ({ 
  images, 
  priority = false, 
  width = 400, 
  height = 400 
}: UseImagePreloaderOptions) => {
  useEffect(() => {
    if (!images.length) return;

    const preloadPromises: Promise<void>[] = [];

    // Preload images immediately for instant display
    images.forEach((imageSrc, index) => {
      if (!imageSrc || imageSrc === '/placeholder.svg') return;

      const optimizedUrl = getOptimizedImageUrl(imageSrc, {
        width,
        height,
        quality: priority ? 90 : 80
      });

      // Create preload link
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = optimizedUrl;
      link.crossOrigin = 'anonymous';
      
      // Add to head immediately for all images since we're loading all at once
      document.head.appendChild(link);

      // Also fetch the image immediately for instant display
      const preloadPromise = new Promise<void>((resolve) => {
        const img = new window.Image();
        img.src = optimizedUrl;
        img.onload = () => {
          console.log(`📸 Image preloaded: ${imageSrc}`);
          resolve();
        };
        img.onerror = () => {
          console.warn(`⚠️ Failed to preload image: ${imageSrc}`);
          resolve();
        };
      });
      
      preloadPromises.push(preloadPromise);
    });

    // Wait for all images to preload
    Promise.all(preloadPromises).then(() => {
      console.log(`✅ All ${images.length} images preloaded successfully`);
    });

    // Cleanup function
    return () => {
      const links = document.querySelectorAll('link[rel="preload"][as="image"]');
      links.forEach(link => {
        if (document.head.contains(link)) {
          document.head.removeChild(link);
        }
      });
    };
  }, [images, priority, width, height]);
};

export default useImagePreloader;
