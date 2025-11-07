"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  ZoomIn, 
  ZoomOut,
  RotateCw,
  Download,
  X
} from "lucide-react";
import { getOptimizedImageUrl, IMAGE_SIZES } from "@/lib/imageUtils";

interface EnhancedProductGalleryProps {
  images: Array<{ position: string; image_id: string }>;
}

const EnhancedProductGallery = ({ images }: EnhancedProductGalleryProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);

  const processedImages = images?.map((img) => ({
    id: img.image_id,
    main: getOptimizedImageUrl(img.image_id, IMAGE_SIZES.PRODUCT_DETAIL),
    thumb: getOptimizedImageUrl(img.image_id, { width: 100, height: 100 }),
    fullsize: getOptimizedImageUrl(img.image_id, { width: 1200, height: 1200 }),
    original: getOptimizedImageUrl(img.image_id)
  })) || [];

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === processedImages.length - 1 ? 0 : prev + 1
    );
    resetImageState();
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? processedImages.length - 1 : prev - 1
    );
    resetImageState();
  };

  const resetImageState = () => {
    setZoomLevel(1);
    setRotation(0);
    setIsZoomed(false);
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.5, 3));
    setIsZoomed(true);
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => {
      const newLevel = Math.max(prev - 0.5, 1);
      if (newLevel === 1) setIsZoomed(false);
      return newLevel;
    });
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  if (!processedImages.length) {
    return (
      <div className="space-y-4">
        <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
          <span className="text-muted-foreground">No images available</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Image Display */}
      <div className="relative group">
        <div className="aspect-square relative overflow-hidden rounded-lg border bg-muted/10">
          <Image
            src={processedImages[currentImageIndex]?.main}
            alt={`Product image ${currentImageIndex + 1}`}
            fill
            className="object-cover transition-transform duration-300 hover:scale-105"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority={currentImageIndex === 0}
          />
          
          {/* Image Controls Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors">
            {/* Navigation Arrows */}
            {processedImages.length > 1 && (
              <>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={prevImage}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={nextImage}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}

            {/* Zoom & Fullscreen Controls */}
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
                <DialogTrigger asChild>
                  <Button variant="secondary" size="icon">
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-7xl w-full h-full p-0 bg-black">
                  <FullscreenGallery
                    images={processedImages}
                    currentIndex={currentImageIndex}
                    onClose={() => setIsFullscreen(false)}
                    onNavigate={setCurrentImageIndex}
                  />
                </DialogContent>
              </Dialog>
            </div>

            {/* Image Counter */}
            {processedImages.length > 1 && (
              <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
                {currentImageIndex + 1} / {processedImages.length}
              </div>
            )}
          </div>
        </div>

        {/* Zoom Indicator */}
        {isZoomed && (
          <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
            {Math.round(zoomLevel * 100)}%
          </div>
        )}
      </div>

      {/* Thumbnail Gallery */}
      {processedImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {processedImages.map((image, index) => (
            <button
              key={image.id}
              onClick={() => {
                setCurrentImageIndex(index);
                resetImageState();
              }}
              className={`relative flex-shrink-0 w-16 h-16 rounded border-2 overflow-hidden transition-all ${
                index === currentImageIndex
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-muted hover:border-muted-foreground"
              }`}
            >
              <Image
                src={image.thumb}
                alt={`Thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}

      {/* Image Actions */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>High-resolution images</span>
          <span>•</span>
          <span>360° view available</span>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm">
            <Download className="h-4 w-4 mr-1" />
            Download
          </Button>
        </div>
      </div>
    </div>
  );
};

// Fullscreen Gallery Component
const FullscreenGallery = ({ 
  images, 
  currentIndex, 
  onClose, 
  onNavigate 
}: {
  images: any[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.5, 4));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.5, 0.5));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);

  const nextImage = () => {
    onNavigate(currentIndex === images.length - 1 ? 0 : currentIndex + 1);
    setZoomLevel(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  const prevImage = () => {
    onNavigate(currentIndex === 0 ? images.length - 1 : currentIndex - 1);
    setZoomLevel(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  return (
    <div className="relative w-full h-full bg-black flex items-center justify-center">
      {/* Close Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
        onClick={onClose}
      >
        <X className="h-6 w-6" />
      </Button>

      {/* Controls */}
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20"
          onClick={handleZoomIn}
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20"
          onClick={handleZoomOut}
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20"
          onClick={handleRotate}
        >
          <RotateCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Navigation */}
      {images.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 z-10"
            onClick={prevImage}
          >
            <ChevronLeft className="h-8 w-8" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 z-10"
            onClick={nextImage}
          >
            <ChevronRight className="h-8 w-8" />
          </Button>
        </>
      )}

      {/* Main Image */}
      <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
        <div
          className="relative transition-transform duration-200 cursor-move"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${zoomLevel}) rotate(${rotation}deg)`,
          }}
        >
          <Image
            src={images[currentIndex]?.fullsize}
            alt={`Fullscreen image ${currentIndex + 1}`}
            width={800}
            height={800}
            className="max-w-full max-h-full object-contain"
            draggable={false}
          />
        </div>
      </div>

      {/* Image Counter */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded">
        {currentIndex + 1} of {images.length}
      </div>

      {/* Zoom Level */}
      <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded">
        {Math.round(zoomLevel * 100)}%
      </div>
    </div>
  );
};

export default EnhancedProductGallery;
