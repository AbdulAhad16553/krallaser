"use client";

import { useState, useEffect } from 'react';

interface ItemImageData {
  item_name: string;
  item_name_display: string;
  image: string | null;
  optimized_image: string | null;
  thumbnail: string | null;
  has_image: boolean;
  success: boolean;
}

interface UseItemImageOptions {
  itemName: string;
  enabled?: boolean;
}

export const useItemImage = ({ itemName, enabled = true }: UseItemImageOptions) => {
  const [imageData, setImageData] = useState<ItemImageData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchItemImage = async () => {
    if (!itemName || !enabled) return;

    try {
      setLoading(true);
      setError(null);

      console.log(`🖼️ Fetching image for item: ${itemName}`);
      
      const response = await fetch(`/api/item-image?item_name=${encodeURIComponent(itemName)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch item image');
      }

      console.log(`✅ Image fetched for ${itemName}:`, data);
      setImageData(data);
    } catch (err) {
      console.error(`❌ Error fetching image for ${itemName}:`, err);
      setError(err instanceof Error ? err.message : 'Failed to fetch image');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (itemName && enabled) {
      fetchItemImage();
    }
  }, [itemName, enabled]);

  return {
    imageData,
    loading,
    error,
    refetch: fetchItemImage,
    hasImage: imageData?.has_image || false,
    optimizedImage: imageData?.optimized_image,
    thumbnail: imageData?.thumbnail,
    originalImage: imageData?.image
  };
};

export default useItemImage;
