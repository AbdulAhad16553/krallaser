"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { X, ZoomIn, Loader2 } from 'lucide-react';

interface ProductImagePreviewProps {
  itemName: string;
  productName: string;
  imageUrl: string;
  hasImage: boolean;
  isLoading?: boolean;
  className?: string;
  width?: number;
  height?: number;
  showPreview?: boolean;
  onClick?: () => void;
}

export const ProductImagePreview: React.FC<ProductImagePreviewProps> = ({
  itemName,
  productName,
  imageUrl,
  hasImage,
  isLoading = false,
  className = '',
  width = 400,
  height = 400,
  showPreview = true,
  onClick
}) => {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewAlt, setPreviewAlt] = useState<string>('');
  
  // Helper function to open image preview (same as product detail)
  const openImagePreview = (imagePath: string | undefined, alt: string) => {
    if (imagePath && imagePath !== '/placeholder.svg') {
      setPreviewImage(imagePath);
      setPreviewAlt(alt);
    }
  };

  // Helper function to close image preview (same as product detail)
  const closeImagePreview = () => {
    setPreviewImage(null);
    setPreviewAlt('');
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

  // Check if we have a valid image URL (more lenient than just hasImage)
  const hasValidImageUrl = imageUrl && imageUrl !== '/placeholder.svg' && imageUrl !== '';
  
  if (!hasValidImageUrl) {
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
        <div className="relative w-full h-full">
          <Image
            src={imageUrl}
            alt={productName}
            width={width}
            height={height}
            className="object-cover cursor-pointer transition-transform group-hover:scale-105"
            onClick={() => openImagePreview(imageUrl, productName)}
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
            <ZoomIn className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          </div>
        </div>
      </div>

      {/* Image Preview Modal - Exact same as product detail page */}
      {previewImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={closeImagePreview}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center">
            <button
              onClick={closeImagePreview}
              className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-75 transition-all"
            >
              <X className="h-6 w-6" />
            </button>
            <div className="relative w-full h-full flex items-center justify-center">
              <Image
                src={previewImage}
                alt={previewAlt}
                width={800}
                height={600}
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

export default ProductImagePreview;
