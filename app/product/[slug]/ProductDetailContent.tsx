
"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Package, DollarSign, Tag, Info, X, ZoomIn, ShoppingCart, Plus, Minus, ChevronLeft, ChevronRight, FileImage } from 'lucide-react';
import Image from 'next/image';
import AttributeFilter from '@/common/AttributeFilter';
import { AddToCart } from '@/sub/cart/addToCart';
import { getErpnextImageUrl } from '@/lib/erpnextImageUtils';
import ProductDescription from '@/components/ProductDescription';
import QuotationDialog from '@/components/QuotationDialog';

interface Product {
  name: string;
  item_name: string;
  item_group: string;
  stock_uom: string;
  description?: string;
  price?: number;
  currency?: string;
  image?: string;
  custom_quotation_item?: number;
  stock?: {
    totalStock: number;
  };
  attachments?: Array<{
    name: string;
    file_name: string;
    file_url: string;
    attached_to_name: string;
    is_private: number;
  }>;
  variants?: Array<{
    name: string;
    item_name: string;
    price?: number;
    currency?: string;
    image?: string;
    stock?: {
      totalStock: number;
    };
    attributes?: Array<{
      attribute: string;
      attribute_value: string;
    }>;
  }>;
}

interface ProductDetailContentProps {
  slug: string;
}

export default function ProductDetailContent({ slug }: ProductDetailContentProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // New attribute filter state
  const [selectedAttributes, setSelectedAttributes] = useState<Array<{attribute: string, attribute_value: string}>>([]);
  
  // Image gallery states
  const [galleryImages, setGalleryImages] = useState<Array<{
    url: string;
    alt: string;
    type: 'main' | 'attachment';
  }>>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showImagePreview, setShowImagePreview] = useState(false);
  
  // Cart functionality states
  const [selectedVariation, setSelectedVariation] = useState<any>(null);
  const [showAddToCart, setShowAddToCart] = useState(false);
  const [quantity, setQuantity] = useState(1);
  
  // Quotation dialog state
  const [showQuotationDialog, setShowQuotationDialog] = useState(false);

  // Check if product is custom quotation item
  const isCustomQuotationItem = product?.custom_quotation_item === 1;

  // Initialize gallery images from product data
  useEffect(() => {
    if (product) {
      const images: Array<{url: string, alt: string, type: 'main' | 'attachment'}> = [];
      
      // Add main product image if exists
      if (product.image) {
        images.push({
          url: getErpnextImageUrl(product.image),
          alt: product.item_name,
          type: 'main'
        });
      }
      
      // Add attachment images
      if (product.attachments && product.attachments.length > 0) {
        // Filter only image attachments and add to gallery
        const imageAttachments = product.attachments.filter(att => {
          const fileName = att.file_name.toLowerCase();
          return fileName.endsWith('.jpg') || 
                 fileName.endsWith('.jpeg') || 
                 fileName.endsWith('.png') || 
                 fileName.endsWith('.gif') ||
                 fileName.endsWith('.webp') ||
                 fileName.endsWith('.bmp') ||
                 fileName.endsWith('.svg');
        });
        
        imageAttachments.forEach((attachment, index) => {
          images.push({
            url: getErpnextImageUrl(attachment.file_url),
            alt: attachment.file_name || `Attachment ${index + 1}`,
            type: 'attachment'
          });
        });
      }
      
      setGalleryImages(images);
    }
  }, [product]);

  // Helper function to open image preview
  const openImagePreview = (index: number) => {
    setCurrentImageIndex(index);
    setShowImagePreview(true);
  };

  // Helper function to close image preview
  const closeImagePreview = () => {
    setShowImagePreview(false);
  };

  // Navigate to next image
  const nextImage = () => {
    if (galleryImages.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length);
    }
  };

  // Navigate to previous image
  const prevImage = () => {
    if (galleryImages.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
    }
  };

  // Handle attribute changes from the new filter
  const handleAttributeChange = (attributes: Array<{attribute: string, attribute_value: string}>) => {
    setSelectedAttributes(attributes);
  };

  // Handle variation selection for custom quotation items
  const handleVariationClick = (variant: any) => {
    // For custom quotation items, always allow selection regardless of stock
    if (isCustomQuotationItem) {
      setSelectedVariation(variant);
      // For custom quotation items, show request quote dialog directly
      setShowQuotationDialog(true);
    } 
    // For non-custom items, only allow if in stock
    else if ((variant as any).stock && (variant as any).stock.totalStock > 0) {
      setSelectedVariation(variant);
      setShowAddToCart(true);
    }
  };

  // Handle adding simple product to cart
  const handleSimpleProductAddToCart = () => {
    if (product && !isTemplate && product.stock && product.stock.totalStock > 0) {
      const cartItem = {
        id: product.name,
        name: product.item_name,
        description: product.description || "",
        type: "item",
        basePrice: product.price || 0,
        salePrice: product.price || 0,
        category: product.item_group || "product",
        currency: product.currency || "PKR",
        bundleItems: [],
        quantity: quantity,
        image: product.image,
        sku: product.name,
        variationId: product.name,
        filterConds: [],
      };

      AddToCart(cartItem, quantity);
      setQuantity(1);
    }
  };

  // Handle adding variation to cart
  const handleAddToCart = () => {
    if (selectedVariation && selectedVariation.stock && selectedVariation.stock.totalStock > 0) {
      const cartItem = {
        id: selectedVariation.name,
        name: selectedVariation.item_name,
        description: selectedVariation.description || product?.description || "",
        type: "item",
        basePrice: selectedVariation.price || 0,
        salePrice: selectedVariation.price || 0,
        category: product?.item_group || "product",
        currency: selectedVariation.currency || "PKR",
        bundleItems: [],
        quantity: quantity,
        image: selectedVariation.image || product?.image,
        sku: selectedVariation.name,
        variationId: selectedVariation.name,
        filterConds: [],
      };

      AddToCart(cartItem, quantity);
      setQuantity(1);
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/product/${slug}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch product');
        }
        
        setProduct(data.product);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch product');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  const isTemplate = product?.variants && product?.variants.length > 0;
  const isSimpleProductInStock = product && !isTemplate && product.stock && product.stock.totalStock > 0;

  // Filter and sort variations
  const filteredVariations = useMemo(() => {
    if (!product?.variants) return [];
    
    if (selectedAttributes.length === 0) {
      return product.variants;
    }
    
    return product.variants.filter(variant => {
      return selectedAttributes.every(selectedAttr => {
        const matchingAttributes = variant.attributes?.filter((attr: any) => 
          attr.attribute === selectedAttr.attribute
        ) || [];
        
        return matchingAttributes.some((attr: any) => 
          attr.attribute_value === selectedAttr.attribute_value
        );
      });
    });
  }, [product?.variants, selectedAttributes]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="h-96 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-24 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-24 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
            <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto text-center py-12">
        <div className="text-red-600 mb-4">
          <Package className="h-16 w-16 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Product Not Found</h2>
          <p className="text-gray-600 mb-6">{error}</p>
        </div>
        <Button onClick={() => router.back()} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-6xl mx-auto text-center py-12">
        <div className="text-gray-600 mb-4">
          <Package className="h-16 w-16 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Product Not Found</h2>
          <p className="text-gray-600 mb-6">The requested product could not be found.</p>
        </div>
        <Button onClick={() => router.back()} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Back Button */}
      {/* <Button 
        onClick={() => router.back()} 
        variant="outline" 
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Products
      </Button> */}
      <Button 
        onClick={() => console.log(product)} 
        variant="outline" 
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        BProducts
      </Button>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="space-y-6">
          {/* Main Image Preview */}
          <div className="aspect-square bg-gray-100 rounded-lg relative group overflow-hidden">
            {galleryImages.length > 0 ? (
              <div className="relative w-full h-full">
                <Image
                  src={galleryImages[0].url}
                  alt={galleryImages[0].alt}
                  fill
                  className="object-cover cursor-pointer transition-transform group-hover:scale-105"
                  onClick={() => openImagePreview(0)}
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                  <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                </div>
                
                {/* Image count badge */}
                {galleryImages.length > 1 && (
                  <div className="absolute top-4 right-4 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                    {galleryImages.length} images
                  </div>
                )}
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-center text-gray-500">
                <div>
                  <Package className="h-24 w-24 mx-auto mb-4" />
                  <p>No image available</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Image Thumbnails Grid */}
          {galleryImages.length > 1 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-700">Gallery Images</h3>
                <span className="text-xs text-gray-500">{galleryImages.length} images</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {galleryImages.map((image, index) => (
                  <div 
                    key={index}
                    className="aspect-square bg-gray-100 rounded-md relative group overflow-hidden cursor-pointer"
                    onClick={() => openImagePreview(index)}
                  >
                    <Image
                      src={image.url}
                      alt={image.alt}
                      fill
                      className="object-cover transition-transform group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200" />
                    
                    {/* Image type badge */}
                    {image.type === 'attachment' && (
                      <div className="absolute top-1 left-1">
                        <FileImage className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
      
          
          {/* Description */}
          <ProductDescription description={product.description} />
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              {isTemplate && (
                <Badge variant="outline">
                  <Tag className="h-3 w-3 mr-1" />
                  Template Product
                </Badge>
              )}
              {isCustomQuotationItem && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  <Info className="h-3 w-3 mr-1" />
                  Request Quote
                </Badge>
              )}
              {!isTemplate && !isCustomQuotationItem && product.stock && product.stock.totalStock > 0 && (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <Info className="h-3 w-3 mr-1" />
                  In Stock: {product.stock.totalStock}
                </Badge>
              )}
              {!isTemplate && !isCustomQuotationItem && product.stock && product.stock.totalStock === 0 && (
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                  <Info className="h-3 w-3 mr-1" />
                  Out of Stock
                </Badge>
              )}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.item_name}</h1>
            <p className="text-gray-600 text-lg">Item Code: {product.name}</p>
          </div>

          {/* Price */}
          {product.price && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <span className="text-2xl font-bold text-green-600">
                  {product.currency} {product.price.toLocaleString()}
                </span>
              </div>
            </div>
          )}

          <Separator />

          {/* Simple Product Add to Cart Section */}
          {!isTemplate && isSimpleProductInStock && !isCustomQuotationItem && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Add to Cart</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center border rounded-md">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="px-4 py-2 min-w-[60px] text-center">
                    {quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={quantity >= (product.stock?.totalStock || 0)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* <Button 
                  onClick={handleSimpleProductAddToCart}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Add to Cart
                </Button> */}
              </div>
              
              <div className="text-sm text-gray-600">
                Total: {product.currency} {(product.price !== undefined ? (product.price * quantity).toLocaleString() : "-")}
              </div>
            </div>
          )}

          {/* Variations */}
          {isTemplate && product.variants && product.variants.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  Available Variations ({filteredVariations.length} of {product.variants.length})
                </h3>
              </div>

              {/* New Attribute Filter */}
              <AttributeFilter
                templateItemName={product.name}
                onAttributeChange={handleAttributeChange}
                selectedAttributes={selectedAttributes}
              />

              {/* Price List for Filtered Variations */}
              {selectedAttributes.length > 0 && filteredVariations.length > 0 ? (
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <DollarSign className="h-5 w-5 mr-2 text-green-600" />
                      Available {isCustomQuotationItem ? "Configurations" : "Prices"} ({filteredVariations.length} options)
                    </h3>
                    
                    <div className="space-y-2">
                      {filteredVariations.map((variant, index) => {
                        const variantInStock = (variant as any).stock && (variant as any).stock.totalStock > 0;
                        const isSelectable = isCustomQuotationItem || variantInStock;
                        
                        return (
                          <div 
                            key={variant.name}
                            className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                              isSelectable 
                                ? 'bg-white hover:shadow-md cursor-pointer hover:border-green-300' 
                                : 'bg-gray-50 opacity-60 cursor-not-allowed'
                            } ${selectedVariation?.name === variant.name ? 'border-green-400 ring-1 ring-green-200' : ''}`}
                            onClick={() => isSelectable && handleVariationClick(variant)}
                          >
                            <div className="flex-1 flex items-center space-x-3">
                              {variant.image && (
                                <div className="relative w-12 h-12 rounded-lg overflow-hidden group cursor-pointer" onClick={(e) => {
                                  e.stopPropagation();
                                  // Add variant image to gallery for preview if not already there
                                  const variantImageUrl = getErpnextImageUrl(variant.image);
                                  const existingIndex = galleryImages.findIndex(img => img.url === variantImageUrl);
                                  if (existingIndex >= 0) {
                                    openImagePreview(existingIndex);
                                  }
                                }}>
                                  <Image
                                    src={getErpnextImageUrl(variant.image)}
                                    alt={variant.item_name}
                                    width={48}
                                    height={48}
                                    className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                  />
                                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                                    <ZoomIn className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                                  </div>
                                </div>
                              )}
                              <div className="flex-1">
                                <h4 className="font-medium text-sm text-gray-900 line-clamp-1">
                                  {variant.item_name}
                                </h4>
                                <div className="text-xs text-gray-600">
                                  {variant.attributes?.map((attr, idx) => (
                                    <span key={idx}>
                                      {attr.attribute_value}
                                      {idx < (variant.attributes?.length || 0) - 1 ? ' • ' : ''}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                            {variant.price && (
                              <div className="flex items-center space-x-2">
                                <span className="text-lg font-bold text-green-600">
                                  {variant.currency} {variant.price.toLocaleString()}
                                </span>
                                {isCustomQuotationItem ? (
                                  <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                    Request Quote
                                  </Badge>
                                ) : variantInStock ? (
                                  <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                    {(variant as any).stock.totalStock} in stock
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                                    Out of stock
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* Add to Cart Section - Only for non-custom items */}
                  {!isCustomQuotationItem && showAddToCart && selectedVariation && (
                    <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-green-800">Selected Variation</h4>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => {
                              setShowAddToCart(false);
                              setSelectedVariation(null);
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">{selectedVariation.item_name}</p>
                            <p className="text-xs text-gray-600">SKU: {selectedVariation.name}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-600">
                              {selectedVariation.currency} {selectedVariation.price?.toLocaleString()}
                            </p>
                            <p className="text-xs text-green-600">
                              {(selectedVariation as any).stock?.totalStock} in stock
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="flex items-center border rounded-md">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setQuantity(Math.max(1, quantity - 1))}
                              disabled={quantity <= 1}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="px-4 py-2 min-w-[60px] text-center">
                              {quantity}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setQuantity(quantity + 1)}
                              disabled={quantity >= ((selectedVariation as any).stock?.totalStock || 0)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <Button 
                            onClick={handleAddToCart}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                          >
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            Add to Cart
                          </Button>
                        </div>
                        
                        <div className="text-sm text-gray-600">
                          Total: {selectedVariation.currency} {(selectedVariation.price * quantity).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select variations to see prices</h3>
                  <p className="text-gray-600 mb-4">Choose your preferred specifications above to view available {isCustomQuotationItem ? "configurations" : "prices"}.</p>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="space-y-4">
            {/* Show Request Quote button for custom quotation items OR when simple product is out of stock */}
            {(isCustomQuotationItem || (!isTemplate && product.stock && product.stock.totalStock === 0)) ? (
              <Button 
                size="lg" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => setShowQuotationDialog(true)}
                disabled={isTemplate && isCustomQuotationItem && !selectedVariation}
              >
                Request Quote
              </Button>
            ) : null}
            
            {/* Add to Cart button for simple products in stock */}
            {!isTemplate && isSimpleProductInStock && !isCustomQuotationItem && (
              <Button 
                size="lg"
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                onClick={handleSimpleProductAddToCart}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                Add to Cart
              </Button>
            )}
            
            <Button 
              variant="outline" 
              size="lg" 
              className="w-full"
            >
              Contact Sales
            </Button>
          </div>

          {/* Product Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Product Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Item Code:</span>
                <span className="font-medium">{product.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Group:</span>
                <span className="font-medium">{product.item_group}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">UOM:</span>
                <span className="font-medium">{product.stock_uom}</span>
              </div>
              {!isTemplate && product.stock && !isCustomQuotationItem && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Stock Available:</span>
                  <span className={`font-medium ${product.stock.totalStock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {product.stock.totalStock} {product.stock_uom}
                  </span>
                </div>
              )}
              {isTemplate && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Variations:</span>
                  <span className="font-medium">{product.variants?.length || 0}</span>
                </div>
              )}
              {isCustomQuotationItem && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium text-blue-600">Custom Quotation Item</span>
                </div>
              )}
              {product.attachments && product.attachments.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Attachments:</span>
                  <span className="font-medium">{product.attachments.length}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Enhanced Image Preview Modal with Navigation */}
      {showImagePreview && galleryImages.length > 0 && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
          onClick={closeImagePreview}
        >
          <div className="relative max-w-6xl max-h-[90vh] w-full h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 px-4">
              <div className="text-white">
                <h3 className="font-semibold">{galleryImages[currentImageIndex].alt}</h3>
                <p className="text-sm text-gray-300">
                  Image {currentImageIndex + 1} of {galleryImages.length}
                </p>
              </div>
              <button
                onClick={closeImagePreview}
                className="bg-black/50 text-white rounded-full p-2 hover:bg-black/75 transition-all z-20"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            {/* Main Image Container */}
            <div className="relative flex-1 flex items-center justify-center overflow-hidden">
              {/* Previous Button */}
              {galleryImages.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    prevImage();
                  }}
                  className="absolute left-4 z-10 bg-black/50 text-white rounded-full p-3 hover:bg-black/75 transition-all"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
              )}
              
              {/* Image */}
              <div className="relative w-full h-full flex items-center justify-center">
                <Image
                  src={galleryImages[currentImageIndex].url}
                  alt={galleryImages[currentImageIndex].alt}
                  width={800}
                  height={600}
                  className="max-w-full max-h-full object-contain"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              
              {/* Next Button */}
              {galleryImages.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImage();
                  }}
                  className="absolute right-4 z-10 bg-black/50 text-white rounded-full p-3 hover:bg-black/75 transition-all"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              )}
            </div>
            
            {/* Thumbnails Strip */}
            {galleryImages.length > 1 && (
              <div className="mt-4 px-4">
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {galleryImages.map((image, index) => (
                    <div
                      key={index}
                      className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden cursor-pointer border-2 ${
                        currentImageIndex === index 
                          ? 'border-blue-500 ring-2 ring-blue-300' 
                          : 'border-transparent hover:border-white'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentImageIndex(index);
                      }}
                    >
                      <Image
                        src={image.url}
                        alt={`Thumbnail ${index + 1}`}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Keyboard navigation info */}
            <div className="text-center text-gray-400 text-xs mt-2">
              Use ← → arrow keys or click on thumbnails to navigate
            </div>
          </div>
        </div>
      )}
      
      {/* Quotation Dialog */}
      {product && (
        <QuotationDialog
          open={showQuotationDialog}
          onClose={() => setShowQuotationDialog(false)}
          product={product}
          selectedVariation={selectedVariation}
        />
      )}
    </div>
  );
}