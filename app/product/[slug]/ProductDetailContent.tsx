// "use client";

// import { useState, useEffect, useMemo } from 'react';
// import { useRouter } from 'next/navigation';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import { Separator } from '@/components/ui/separator';
// import { ArrowLeft, Package, DollarSign, Tag, Info, X, ZoomIn, ShoppingCart, Plus, Minus } from 'lucide-react';
// import Image from 'next/image';
// import AttributeFilter from '@/common/AttributeFilter';
// import { AddToCart } from '@/sub/cart/addToCart';
// import { getErpnextImageUrl } from '@/lib/erpnextImageUtils';
// import ProductDescription from '@/components/ProductDescription';
// import QuotationDialog from '@/components/QuotationDialog';

// interface Product {
//   name: string;
//   item_name: string;
//   item_group: string;
//   stock_uom: string;
//   description?: string;
//   price?: number;
//   currency?: string;
//   image?: string;
//   custom_quotation_item?: number;
//   variants?: Array<{
//     name: string;
//     item_name: string;
//     price?: number;
//     currency?: string;
//     image?: string;
//     stock?: {
//       totalStock: number;
//     };
//     attributes?: Array<{
//       attribute: string;
//       attribute_value: string;
//     }>;
//   }>;
// }

// interface ProductDetailContentProps {
//   slug: string;
// }

// export default function ProductDetailContent({ slug }: ProductDetailContentProps) {
//   const [product, setProduct] = useState<Product | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const router = useRouter();

  
//   // New attribute filter state
//   const [selectedAttributes, setSelectedAttributes] = useState<Array<{attribute: string, attribute_value: string}>>([]);
  
//   // Image preview states
//   const [previewImage, setPreviewImage] = useState<string | null>(null);
//   const [previewAlt, setPreviewAlt] = useState<string>('');
  
//   // Cart functionality states
//   const [selectedVariation, setSelectedVariation] = useState<any>(null);
//   const [showAddToCart, setShowAddToCart] = useState(false);
//   const [quantity, setQuantity] = useState(1);
  
//   // Quotation dialog state
//   const [showQuotationDialog, setShowQuotationDialog] = useState(false);

//   // Helper function to generate full image URL
//   const getFullImageUrl = (imagePath: string | undefined): string | null => {
//     if (!imagePath) return null;
//     return `https://${process.env.NEXT_PUBLIC_ERPNEXT_DOMAIN}${imagePath}`;
//   };

//   // Helper function to open image preview
//   const openImagePreview = (imagePath: string | undefined, alt: string) => {
//     const fullUrl = getFullImageUrl(imagePath);
//     if (fullUrl) {
//       setPreviewImage(fullUrl);
//       setPreviewAlt(alt);
//     }
//   };

//   // Helper function to close image preview
//   const closeImagePreview = () => {
//     setPreviewImage(null);
//     setPreviewAlt('');
//   };

//   // Handle attribute changes from the new filter
//   const handleAttributeChange = (attributes: Array<{attribute: string, attribute_value: string}>) => {
//     setSelectedAttributes(attributes);
//   };

//   // Handle variation selection and cart functionality
//   const handleVariationClick = (variant: any) => {
//     if ((variant as any).stock && (variant as any).stock.totalStock > 0) {
//       setSelectedVariation(variant);
//       setShowAddToCart(true);
//     }
//   };

//   const handleAddToCart = () => {
//     if (selectedVariation) {
//       const cartItem = {
//         id: product?.name || selectedVariation.name,
//         name: selectedVariation.item_name,
//         description: product?.description || "",
//         type: "item",
//         basePrice: selectedVariation.price || 0,
//         salePrice: selectedVariation.price || 0,
//         category: product?.item_group || "product",
//         currency: selectedVariation.currency || "PKR",
//         bundleItems: [],
//         quantity: quantity,
//         image: selectedVariation.image,
//         sku: selectedVariation.name,
//         variationId: selectedVariation.name,
//         filterConds: [],
//       };

//       AddToCart(cartItem, quantity);
//       // Reset states after adding to cart
//       setSelectedVariation(null);
//       setShowAddToCart(false);
//       setQuantity(1);
//     }
//   };

//   useEffect(() => {
//     const fetchProduct = async () => {
//       try {
//         setLoading(true);
//         setError(null);
        
//         const response = await fetch(`/api/product/${slug}`);
//         const data = await response.json();
        
//         if (!response.ok) {
//           throw new Error(data.error || 'Failed to fetch product');
//         }
        
//         setProduct(data.product);
//       } catch (err) {
//         console.error('Error fetching product:', err);
//         setError(err instanceof Error ? err.message : 'Failed to fetch product');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProduct();
//   }, [slug]);

//   const isTemplate = product?.variants && product?.variants.length > 0;

//   // Filter and sort variations - now using ERPNext API attributes
//   const filteredVariations = useMemo(() => {
//     if (!product?.variants) return [];
    
//     // If no attributes are selected, return all variants
//     if (selectedAttributes.length === 0) {
//       return product.variants;
//     }
    
//     // Filter variants based on selected attributes
//     return product.variants.filter(variant => {
//       // Check if this variant matches all selected attributes
//       return selectedAttributes.every(selectedAttr => {
//         // Find the variant's attributes that match the selected attribute name
//         const matchingAttributes = variant.attributes?.filter((attr: any) => 
//           attr.attribute === selectedAttr.attribute
//         ) || [];
        
//         // Check if any of the matching attributes has the selected value
//         return matchingAttributes.some((attr: any) => 
//           attr.attribute_value === selectedAttr.attribute_value
//         );
//       });
//     });
//   }, [product?.variants, selectedAttributes]);


//   if (loading) {
//     return (
//       <div className="max-w-6xl mx-auto">
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//           <div className="space-y-4">
//             <div className="h-96 bg-gray-200 rounded-lg animate-pulse"></div>
//             <div className="grid grid-cols-2 gap-4">
//               <div className="h-24 bg-gray-200 rounded animate-pulse"></div>
//               <div className="h-24 bg-gray-200 rounded animate-pulse"></div>
//             </div>
//           </div>
//           <div className="space-y-6">
//             <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
//             <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
//             <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
//             <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="max-w-6xl mx-auto text-center py-12">
//         <div className="text-red-600 mb-4">
//           <Package className="h-16 w-16 mx-auto mb-4" />
//           <h2 className="text-2xl font-bold mb-2">Product Not Found</h2>
//           <p className="text-gray-600 mb-6">{error}</p>
//         </div>
//         <Button onClick={() => router.back()} variant="outline">
//           <ArrowLeft className="h-4 w-4 mr-2" />
//           Go Back
//         </Button>
//       </div>
//     );
//   }

//   if (!product) {
//     return (
//       <div className="max-w-6xl mx-auto text-center py-12">
//         <div className="text-gray-600 mb-4">
//           <Package className="h-16 w-16 mx-auto mb-4" />
//           <h2 className="text-2xl font-bold mb-2">Product Not Found</h2>
//           <p className="text-gray-600 mb-6">The requested product could not be found.</p>
//         </div>
//         <Button onClick={() => router.back()} variant="outline">
//           <ArrowLeft className="h-4 w-4 mr-2" />
//           Go Back
//         </Button>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-6xl mx-auto">
//       {/* Back Button */}
//       <Button 
//         onClick={() => router.back()} 
//         variant="outline" 
//         className="mb-6"
//       >
//         <ArrowLeft className="h-4 w-4 mr-2" />
//         Back to Products
//       </Button>
  
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//         {/* Product Images */}
//         <div className="space-y-4">
//           <div className="aspect-square bg-gray-100 rounded-lg relative group overflow-hidden">
//             {product.image ? (
//               <div className="relative w-full h-full">
//                 <Image
//                   src={getErpnextImageUrl(product.image)}
//                   alt={product.item_name}
//                   fill
//                   className="object-cover cursor-pointer transition-transform group-hover:scale-105"
//                   onClick={() => openImagePreview(product.image, product.item_name)}
//                 />
//                 <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
//                   <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
//                 </div>
//               </div>
//             ) : (
//               <div className="absolute inset-0 flex items-center justify-center text-center text-gray-500">
//                 <div>
//                   <Package className="h-24 w-24 mx-auto mb-4" />
//                   <p>No image available</p>
//                 </div>
//               </div>
//             )}
//           </div>
          
//           {/* Description */}
//           <ProductDescription description={product.description} />
//         </div>

//         {/* Product Details */}
//         <div className="space-y-6">
//           <div>
//             <div className="flex items-center gap-2 mb-2">
//               {isTemplate && (
//                 <Badge variant="outline">
//                   <Tag className="h-3 w-3 mr-1" />
//                   Template Product
//                 </Badge>
//               )}
//             </div>
//             <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.item_name}</h1>
//             <p className="text-gray-600 text-lg">Item Code: {product.name}</p>
//           </div>


//           {/* Price */}
//           {product.price && (
//             <div className="space-y-2">
//               <div className="flex items-center gap-2">
//                 <DollarSign className="h-5 w-5 text-green-600" />
//                 <span className="text-2xl font-bold text-green-600">
//                   {product.currency} {product.price.toLocaleString()}
//                 </span>
//               </div>
//             </div>
//           )}

//           <Separator />

        

//           {/* Variations */}
//           {isTemplate && product.variants && product.variants.length > 0 && (
//             <div className="space-y-6">
//               <div className="flex items-center justify-between">
//                 <h3 className="text-lg font-semibold">
//                   Available Variations ({filteredVariations.length} of {product.variants.length})
//                 </h3>
//               </div>

//               {/* New Attribute Filter */}
//               <AttributeFilter
//                 templateItemName={product.name}
//                 onAttributeChange={handleAttributeChange}
//                 selectedAttributes={selectedAttributes}
//               />

//               {/* Price List for Filtered Variations - Only show when attributes are selected */}
//               {selectedAttributes.length > 0 && filteredVariations.length > 0 ? (
//                 <div className="space-y-4">
//                   <div className="bg-gray-50 rounded-lg p-4">
//                     <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
//                       <DollarSign className="h-5 w-5 mr-2 text-green-600" />
//                       Available Prices ({filteredVariations.length} options)
//                     </h3>
                    
//                     <div className="space-y-2">
//                       {filteredVariations.map((variant, index) => (
//                         <div 
//                           key={variant.name}
//                           className={`flex items-center justify-between p-3 bg-white rounded-lg border transition-all ${
//                             (variant as any).stock && (variant as any).stock.totalStock > 0 
//                               ? 'hover:shadow-md cursor-pointer hover:border-green-300' 
//                               : 'opacity-60 cursor-not-allowed'
//                           }`}
//                           onClick={() => handleVariationClick(variant)}
//                         >
//                           <div className="flex-1 flex items-center space-x-3">
//                             {variant.image && (
//                               <div className="relative w-12 h-12 rounded-lg overflow-hidden group cursor-pointer" onClick={(e) => {
//                                 e.stopPropagation();
//                                 openImagePreview(variant.image, variant.item_name);
//                               }}>
//                                 <Image
//                                   src={getErpnextImageUrl(variant.image)}
//                                   alt={variant.item_name}
//                                   width={48}
//                                   height={48}
//                                   className="w-full h-full object-cover transition-transform group-hover:scale-110"
//                                 />
//                                 <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
//                                   <ZoomIn className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
//                                 </div>
//                               </div>
//                             )}
//                             <div className="flex-1">
//                               <h4 className="font-medium text-sm text-gray-900 line-clamp-1">
//                                 {variant.item_name}
//                               </h4>
//                             </div>
//                           </div>
//                           {variant.price && (
//                             <div className="flex items-center space-x-2">
//                               <span className="text-lg font-bold text-green-600">
//                                 {variant.currency} {variant.price.toLocaleString()}
//                               </span>
//                               {(variant as any).stock && (variant as any).stock.totalStock > 0 ? (
//                                 <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
//                                   {(variant as any).stock.totalStock} in stock
//                                 </Badge>
//                               ) : (
//                                 <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
//                                   Out of stock
//                                 </Badge>
//                               )}
//                             </div>
//                           )}
//                         </div>
//                       ))}
//                     </div>
//                   </div>
                  
//                   {/* Add to Cart Section - Shows when variation is selected */}
//                   {showAddToCart && selectedVariation && (
//                     <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
//                       <div className="space-y-4">
//                         <div className="flex items-center justify-between">
//                           <h4 className="font-semibold text-green-800">Selected Variation</h4>
//                           <Button 
//                             variant="ghost" 
//                             size="sm" 
//                             onClick={() => {
//                               setShowAddToCart(false);
//                               setSelectedVariation(null);
//                             }}
//                           >
//                             <X className="h-4 w-4" />
//                           </Button>
//                         </div>
                        
//                         <div className="flex items-center justify-between">
//                           <div>
//                             <p className="font-medium text-sm">{selectedVariation.item_name}</p>
//                             <p className="text-xs text-gray-600">SKU: {selectedVariation.name}</p>
//                           </div>
//                           <div className="text-right">
//                             <p className="font-bold text-green-600">
//                               {selectedVariation.currency} {selectedVariation.price?.toLocaleString()}
//                             </p>
//                             <p className="text-xs text-green-600">
//                               {(selectedVariation as any).stock?.totalStock} in stock
//                             </p>
//                           </div>
//                         </div>
                        
//                         <div className="flex items-center gap-4">
//                           <div className="flex items-center border rounded-md">
//                             <Button
//                               variant="ghost"
//                               size="icon"
//                               onClick={() => setQuantity(Math.max(1, quantity - 1))}
//                               disabled={quantity <= 1}
//                             >
//                               <Minus className="h-4 w-4" />
//                             </Button>
//                             <span className="px-4 py-2 min-w-[60px] text-center">
//                               {quantity}
//                             </span>
//                             <Button
//                               variant="ghost"
//                               size="icon"
//                               onClick={() => setQuantity(quantity + 1)}
//                               disabled={quantity >= ((selectedVariation as any).stock?.totalStock || 0)}
//                             >
//                               <Plus className="h-4 w-4" />
//                             </Button>
//                           </div>
                          
//                           <Button 
//                             onClick={handleAddToCart}
//                             className="flex-1 bg-green-600 hover:bg-green-700 text-white"
//                           >
//                             <ShoppingCart className="mr-2 h-4 w-4" />
//                             Add to Cart
//                           </Button>
//                         </div>
                        
//                         <div className="text-sm text-gray-600">
//                           Total: {selectedVariation.currency} {(selectedVariation.price * quantity).toLocaleString()}
//                         </div>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               ) : (
//                 <div className="text-center py-8">
//                   <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
//                   <h3 className="text-lg font-medium text-gray-900 mb-2">Select variations to see prices</h3>
//                   <p className="text-gray-600 mb-4">Choose your preferred specifications above to view available prices.</p>
//                 </div>
//               )}
//             </div>
//           )}


//           {/* Actions */}
//           <div className="space-y-4">
//           {product?.custom_quotation_item === 1 && (
//   <Button 
//     size="lg" 
//     className="w-full"
//     onClick={() => setShowQuotationDialog(true)}
//   >
//     Request Quote
//   </Button>
// )}

            
//             <Button 
//               variant="outline" 
//               size="lg" 
//               className="w-full"
//             >
//               Contact Sales
//             </Button>
//           </div>

//           {/* Product Info */}
//           <Card>
//             <CardHeader>
//               <CardTitle className="text-lg">Product Information</CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-2">
//               <div className="flex justify-between">
//                 <span className="text-gray-600">Item Code:</span>
//                 <span className="font-medium">{product.name}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-gray-600">Group:</span>
//                 <span className="font-medium">{product.item_group}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-gray-600">UOM:</span>
//                 <span className="font-medium">{product.stock_uom}</span>
//               </div>
//               {isTemplate && (
//                 <div className="flex justify-between">
//                   <span className="text-gray-600">Variations:</span>
//                   <span className="font-medium">{product.variants?.length || 0}</span>
//                 </div>
//               )}
//             </CardContent>
//           </Card>
//         </div>
//       </div>

//       {/* Image Preview Modal */}
//       {previewImage && (
//         <div 
//           className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
//           onClick={closeImagePreview}
//         >
//           <div className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center">
//             <button
//               onClick={closeImagePreview}
//               className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-75 transition-all"
//             >
//               <X className="h-6 w-6" />
//             </button>
//             <div className="relative w-full h-full flex items-center justify-center">
//               <Image
//                 src={previewImage}
//                 alt={previewAlt}
//                 width={800}
//                 height={600}
//                 className="max-w-full max-h-full object-contain rounded-lg"
//                 onClick={(e) => e.stopPropagation()}
//               />
//             </div>
//           </div>
//         </div>
//       )}
      
//       {/* Quotation Dialog */}
//       {product && (
//         <QuotationDialog
//           open={showQuotationDialog}
//           onClose={() => setShowQuotationDialog(false)}
//           product={product}
//         />
//       )}
//     </div>
//   );
// }
"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Package, DollarSign, Tag, Info, X, ZoomIn, ShoppingCart, Plus, Minus } from 'lucide-react';
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
  
  // Image preview states
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewAlt, setPreviewAlt] = useState<string>('');
  
  // Cart functionality states
  const [selectedVariation, setSelectedVariation] = useState<any>(null);
  const [showAddToCart, setShowAddToCart] = useState(false);
  const [quantity, setQuantity] = useState(1);
  
  // Quotation dialog state
  const [showQuotationDialog, setShowQuotationDialog] = useState(false);

  // Helper function to generate full image URL
  const getFullImageUrl = (imagePath: string | undefined): string | null => {
    if (!imagePath) return null;
    return `https://${process.env.NEXT_PUBLIC_ERPNEXT_DOMAIN}${imagePath}`;
  };

  // Helper function to open image preview
  const openImagePreview = (imagePath: string | undefined, alt: string) => {
    const fullUrl = getFullImageUrl(imagePath);
    if (fullUrl) {
      setPreviewImage(fullUrl);
      setPreviewAlt(alt);
    }
  };

  // Helper function to close image preview
  const closeImagePreview = () => {
    setPreviewImage(null);
    setPreviewAlt('');
  };

  // Handle attribute changes from the new filter
  const handleAttributeChange = (attributes: Array<{attribute: string, attribute_value: string}>) => {
    setSelectedAttributes(attributes);
  };

  // Handle variation selection and cart functionality
  const handleVariationClick = (variant: any) => {
    if ((variant as any).stock && (variant as any).stock.totalStock > 0) {
      setSelectedVariation(variant);
      setShowAddToCart(true);
    }
  };

  const handleAddToCart = () => {
    if (selectedVariation) {
      // For template product variations
      const cartItem = {
        id: product?.name || selectedVariation.name,
        name: selectedVariation.item_name,
        description: product?.description || "",
        type: "item",
        basePrice: selectedVariation.price || 0,
        salePrice: selectedVariation.price || 0,
        category: product?.item_group || "product",
        currency: selectedVariation.currency || "PKR",
        bundleItems: [],
        quantity: quantity,
        image: selectedVariation.image,
        sku: selectedVariation.name,
        variationId: selectedVariation.name,
        filterConds: [],
      };

      AddToCart(cartItem, quantity);
      // Reset states after adding to cart
      setSelectedVariation(null);
      setShowAddToCart(false);
      setQuantity(1);
    } else if (product && !isTemplate && product.stock && product.stock.totalStock > 0) {
      // For simple products
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
      // Reset quantity after adding to cart
      setQuantity(1);
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
      // Optionally show a success message or toast here
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

  // Filter and sort variations - now using ERPNext API attributes
  const filteredVariations = useMemo(() => {
    if (!product?.variants) return [];
    
    // If no attributes are selected, return all variants
    if (selectedAttributes.length === 0) {
      return product.variants;
    }
    
    // Filter variants based on selected attributes
    return product.variants.filter(variant => {
      // Check if this variant matches all selected attributes
      return selectedAttributes.every(selectedAttr => {
        // Find the variant's attributes that match the selected attribute name
        const matchingAttributes = variant.attributes?.filter((attr: any) => 
          attr.attribute === selectedAttr.attribute
        ) || [];
        
        // Check if any of the matching attributes has the selected value
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
      <Button 
        onClick={() => router.back()} 
        variant="outline" 
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Products
      </Button>
  
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="aspect-square bg-gray-100 rounded-lg relative group overflow-hidden">
            {product.image ? (
              <div className="relative w-full h-full">
                <Image
                  src={getErpnextImageUrl(product.image)}
                  alt={product.item_name}
                  fill
                  className="object-cover cursor-pointer transition-transform group-hover:scale-105"
                  onClick={() => openImagePreview(product.image, product.item_name)}
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                  <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                </div>
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
              {!isTemplate && product.stock && product.stock.totalStock > 0 && (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <Info className="h-3 w-3 mr-1" />
                  In Stock: {product.stock.totalStock}
                </Badge>
              )}
              {!isTemplate && product.stock && product.stock.totalStock === 0 && (
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
          {!isTemplate && isSimpleProductInStock && (
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
                
                <Button 
                  onClick={handleSimpleProductAddToCart}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Add to Cart
                </Button>
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

              {/* Price List for Filtered Variations - Only show when attributes are selected */}
              {selectedAttributes.length > 0 && filteredVariations.length > 0 ? (
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <DollarSign className="h-5 w-5 mr-2 text-green-600" />
                      Available Prices ({filteredVariations.length} options)
                    </h3>
                    
                    <div className="space-y-2">
                      {filteredVariations.map((variant, index) => (
                        <div 
                          key={variant.name}
                          className={`flex items-center justify-between p-3 bg-white rounded-lg border transition-all ${
                            (variant as any).stock && (variant as any).stock.totalStock > 0 
                              ? 'hover:shadow-md cursor-pointer hover:border-green-300' 
                              : 'opacity-60 cursor-not-allowed'
                          }`}
                          onClick={() => handleVariationClick(variant)}
                        >
                          <div className="flex-1 flex items-center space-x-3">
                            {variant.image && (
                              <div className="relative w-12 h-12 rounded-lg overflow-hidden group cursor-pointer" onClick={(e) => {
                                e.stopPropagation();
                                openImagePreview(variant.image, variant.item_name);
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
                            </div>
                          </div>
                          {variant.price && (
                            <div className="flex items-center space-x-2">
                              <span className="text-lg font-bold text-green-600">
                                {variant.currency} {variant.price.toLocaleString()}
                              </span>
                              {(variant as any).stock && (variant as any).stock.totalStock > 0 ? (
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
                      ))}
                    </div>
                  </div>
                  
                  {/* Add to Cart Section - Shows when variation is selected */}
                  {showAddToCart && selectedVariation && (
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
                  <p className="text-gray-600 mb-4">Choose your preferred specifications above to view available prices.</p>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="space-y-4">
            {/* Show Request Quote button for custom quotation items OR when simple product is out of stock */}
            {product?.custom_quotation_item === 1 || (!isTemplate && product.stock && product.stock.totalStock === 0) ? (
              <Button 
                size="lg" 
                className="w-full"
                onClick={() => setShowQuotationDialog(true)}
              >
                Request Quote
              </Button>
            ) : null}
            
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
              {!isTemplate && product.stock && (
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
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Image Preview Modal */}
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
      
      {/* Quotation Dialog */}
      {product && (
        <QuotationDialog
          open={showQuotationDialog}
          onClose={() => setShowQuotationDialog(false)}
          product={product}
        />
      )}
    </div>
  );
}