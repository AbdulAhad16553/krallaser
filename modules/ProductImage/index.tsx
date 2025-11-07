"use client"

import React, { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ChevronRight, ChevronLeft } from "lucide-react"
import { getOptimizedImageUrl, IMAGE_SIZES } from "@/lib/imageUtils"

const ProductImage = ({ productImages }: { productImages: Array<{ position: string; image_id: string }> }) => {

    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const [isClient, setIsClient] = useState(false)

    useEffect(() => {
        setIsClient(true)
    }, [])

    const images = productImages?.map((img) => ({
        id: img.image_id,
        // Main display image - optimized for the container size
        main: getOptimizedImageUrl(img.image_id, IMAGE_SIZES.PRODUCT_DETAIL),
        // Thumbnail for dots navigation
        thumb: getOptimizedImageUrl(img.image_id, IMAGE_SIZES.THUMB_SMALL),
        // Original for full-screen view (if needed)
        original: getOptimizedImageUrl(img.image_id)
    })) || []

    const prevImage = () => {
        setCurrentImageIndex((prevIndex) =>
            prevIndex === 0 ? images.length - 1 : prevIndex - 1
        )
    }

    const nextImage = () => {
        setCurrentImageIndex((prevIndex) =>
            prevIndex === images.length - 1 ? 0 : prevIndex + 1
        )
    }

    if (!isClient || images.length === 0) {
        return (
            <div className="relative">
                <div className="aspect-square relative bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-gray-500">Loading...</span>
                </div>
            </div>
        )
    }

    return (
        <div className="relative">
            <div className="aspect-square relative">
                <Image
                    src={images[currentImageIndex]?.main}
                    alt={`Product Image ${currentImageIndex + 1}`}
                    fill
                    className="object-cover rounded-lg"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority={currentImageIndex === 0}
                />
            </div>
            {images.length > 1 && (
                <>
                    <Button
                        variant="outline"
                        size="icon"
                        className="absolute top-1/2 left-2 transform -translate-y-1/2"
                        onClick={prevImage}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        className="absolute top-1/2 right-2 transform -translate-y-1/2"
                        onClick={nextImage}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </>
            )}
            {images.length > 1 && (
                <div className="flex justify-center mt-4 space-x-2">
                    {images.map((_, index) => (
                        <Button
                            key={index}
                            variant={index === currentImageIndex ? "default" : "outline"}
                            size="icon"
                            className="w-3 h-3 rounded-full p-0"
                            onClick={() => setCurrentImageIndex(index)}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

export default ProductImage
