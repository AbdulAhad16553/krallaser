"use client";

import React, { useState } from 'react';
import { useFastImageLoading } from '@/hooks/useFastImageLoading';
import { ProgressiveImage } from '@/components/ui/progressive-image';
import { Button } from '@/components/ui/button';
import { getErpnextImageUrl } from '@/lib/erpnextImageUtils';
import { X, ZoomIn, Loader2 } from 'lucide-react';

interface InstantImagePreviewProps {
  itemName: string;
  productName: string;
  className?: string;
  width?: number;
  height?: number;
  showPreview?: boolean;
  onClick?: () => void;
}

export const InstantImagePreview: React.FC<InstantImagePreviewProps> = ({
  itemName,
  productName,
  className = '',
  width = 400,
  height = 400,
  showPreview = true,
  onClick
}) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  const {
    isLoading,
    isError,
    getOptimizedUrl,
    getThumbnailUrl,
    hasImage,
    getImagePath,
    isOptimized,
    format,
    quality
  } = useFastImageLoading({
    itemName,
    enabled: !!itemName
  });

  const handleImageClick = () => {
    if (hasImage() && showPreview) {
      setIsPreviewOpen(true);
    }
    onClick?.();
  };

  const closePreview = () => {
    setIsPreviewOpen(false);
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
          <span className="text-xs text-gray-500">Loading image...</span>
        </div>
      </div>
    );
  }

  if (isError || !hasImage()) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
        <div className="text-center text-gray-500">
          <div className="text-sm">No image available</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`relative group ${className}`}>
        <ProgressiveImage
          src={getErpnextImageUrl(getImagePath() || undefined)}
          alt={productName}
          width={width}
          height={height}
          className="object-cover cursor-pointer transition-transform group-hover:scale-105"
          onClick={handleImageClick}
          showPreview={showPreview}
        />
        
        {/* Preview overlay */}
        {showPreview && hasImage() && (
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <ZoomIn className="h-6 w-6 text-white" />
          </div>
        )}

        {/* Optimization indicator */}
        {isOptimized && (
          <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
            {format.toUpperCase()} {quality}%
          </div>
        )}
      </div>

      {/* Full-screen preview modal */}
      {isPreviewOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={closePreview}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center">
            <button
              onClick={closePreview}
              className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-75 transition-all"
            >
              <X className="h-6 w-6" />
            </button>
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={getErpnextImageUrl(getImagePath() || undefined)}
                alt={productName}
                className="max-w-full max-h-full object-contain rounded-lg"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default InstantImagePreview;
