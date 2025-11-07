"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Skeleton } from './skeleton';
import { getOptimizedImageUrl, IMAGE_SIZES } from '@/lib/imageUtils';

interface ProgressiveImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  priority?: boolean;
  sizes?: string;
  onLoad?: () => void;
  onError?: () => void;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  onClick?: () => void;
  showPreview?: boolean;
}

export const ProgressiveImage: React.FC<ProgressiveImageProps> = ({
  src,
  alt,
  width,
  height,
  fill = false,
  className = '',
  priority = false,
  sizes,
  onLoad,
  onError,
  placeholder = 'blur',
  blurDataURL,
  onClick,
  showPreview = false
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [loadStartTime, setLoadStartTime] = useState<number>(0);
  const imgRef = useRef<HTMLDivElement>(null);

  // Get optimized image URL
  const optimizedSrc = React.useMemo(() => {
    if (!src || src === '/placeholder.svg') return src;
    
    // Use optimized image URL for better performance
    return getOptimizedImageUrl(src, {
      width: width || 400,
      height: height || 400,
      quality: priority ? 90 : 80
    });
  }, [src, width, height, priority]);

  // Preload images for priority items and immediate fetching
  useEffect(() => {
    if (optimizedSrc && optimizedSrc !== '/placeholder.svg') {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = optimizedSrc;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
      
      // Also fetch the image immediately for instant display
      const img = new window.Image();
      img.src = optimizedSrc;
      img.onload = () => {
        console.log(`📸 Image preloaded: ${alt}`);
      };
      
      return () => {
        if (document.head.contains(link)) {
          document.head.removeChild(link);
        }
      };
    }
  }, [optimizedSrc, alt]);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || isInView) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            setLoadStartTime(performance.now());
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '200px', // Start loading 200px before entering viewport for faster loading
        threshold: 0.1
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority, isInView]);

  const handleLoad = () => {
    const loadTime = performance.now() - loadStartTime;
    console.log(`📸 Image loaded: ${alt} in ${loadTime.toFixed(2)}ms`);
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    console.error(`❌ Image failed to load: ${src}`);
    setIsError(true);
    onError?.();
  };

  // Generate blur placeholder
  const generateBlurPlaceholder = () => {
    const canvas = `<svg width="${width || 400}" height="${height || 400}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
      <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#9ca3af" font-family="system-ui" font-size="14">
        Loading...
      </text>
    </svg>`;
    
    return `data:image/svg+xml;base64,${Buffer.from(canvas).toString('base64')}`;
  };

  const defaultBlurDataURL = blurDataURL || generateBlurPlaceholder();

  if (isError) {
    return (
      <div 
        ref={imgRef}
        className={`flex items-center justify-center bg-gray-100 ${className}`}
        style={fill ? {} : { width, height }}
      >
        <div className="text-gray-400 text-sm">Image unavailable</div>
      </div>
    );
  }

  if (!isInView) {
    return (
      <div 
        ref={imgRef}
        className={`${className}`}
        style={fill ? {} : { width, height }}
      >
        <Skeleton className="w-full h-full" />
      </div>
    );
  }

  return (
    <div 
      ref={imgRef}
      className={`relative ${className}`}
      style={fill ? {} : { width, height }}
    >
      {/* Blur placeholder - Skip for priority images for instant loading */}
      {!isLoaded && !priority && (
        <div className="absolute inset-0 z-10">
          <Image
            src={defaultBlurDataURL}
            alt=""
            fill={fill}
            width={!fill ? width : undefined}
            height={!fill ? height : undefined}
            className="object-cover blur-sm"
            priority={priority}
          />
        </div>
      )}

      {/* Main image */}
      <Image
        src={optimizedSrc}
        alt={alt}
        fill={fill}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        className={`object-cover transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } ${showPreview ? 'cursor-pointer hover:scale-105' : ''}`}
        onLoad={handleLoad}
        onError={handleError}
        priority={priority}
        sizes={sizes}
        placeholder={placeholder}
        blurDataURL={defaultBlurDataURL}
        unoptimized={false}
        onClick={onClick}
      />
      
      {/* Preview overlay */}
      {showPreview && isLoaded && (
        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center opacity-0 hover:opacity-100">
          <div className="text-white text-sm font-medium">
            Click to preview
          </div>
        </div>
      )}

      {/* Loading indicator - Minimal for priority images */}
      {!isLoaded && !isError && (
        <div className={`absolute inset-0 z-20 flex items-center justify-center ${
          priority ? 'bg-transparent' : 'bg-white/80'
        }`}>
          <div className={`animate-spin rounded-full border-b-2 border-gray-900 ${
            priority ? 'h-4 w-4' : 'h-8 w-8'
          }`}></div>
        </div>
      )}
    </div>
  );
};

// Hook for managing multiple progressive images
export const useProgressiveImages = (images: string[], batchSize: number = 3) => {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [loadingImages, setLoadingImages] = useState<Set<string>>(new Set());
  const [currentBatch, setCurrentBatch] = useState(0);

  const loadNextBatch = () => {
    const startIndex = currentBatch * batchSize;
    const endIndex = Math.min(startIndex + batchSize, images.length);
    const batchImages = images.slice(startIndex, endIndex);

    batchImages.forEach((imageSrc, index) => {
      setTimeout(() => {
        setLoadingImages(prev => new Set(prev).add(imageSrc));
        
        // Simulate progressive loading
        const img = new window.Image();
        img.onload = () => {
          setTimeout(() => {
            setLoadedImages(prev => new Set(prev).add(imageSrc));
            setLoadingImages(prev => {
              const newSet = new Set(prev);
              newSet.delete(imageSrc);
              return newSet;
            });
          }, index * 200); // Stagger loading
        };
        img.src = imageSrc;
      }, index * 100);
    });

    setCurrentBatch(prev => prev + 1);
  };

  const isImageLoaded = (imageSrc: string) => loadedImages.has(imageSrc);
  const isImageLoading = (imageSrc: string) => loadingImages.has(imageSrc);
  const hasMoreBatches = currentBatch * batchSize < images.length;

  return {
    loadNextBatch,
    isImageLoaded,
    isImageLoading,
    hasMoreBatches,
    loadedCount: loadedImages.size,
    totalCount: images.length
  };
};

export default ProgressiveImage;
