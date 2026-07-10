
"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { ArrowLeft, Package, DollarSign, Tag, Info, X, ZoomIn, ShoppingCart, Plus, Minus, ChevronLeft, ChevronRight, FileImage, CheckCircle, Quote, MessageCircle, Mail, Phone } from 'lucide-react';
import Image from 'next/image';
import AttributeFilter from '@/common/AttributeFilter';
import { AddToCart } from '@/sub/cart/addToCart';
import { getErpnextImageUrl } from '@/lib/erpnextImageUtils';
import { getProductDisplayName, productImageAlt } from '@/lib/productSeo';
import { motion } from "motion/react";
import ProductDescription from '@/components/ProductDescription';
import MachineProductGallery from '@/components/MachineProductGallery';
import QuotationDialog from '@/components/QuotationDialog';
import { ProductSkeleton } from '@/components/ui/product-skeleton';
import { getSavedProductPreview, saveProductPreview } from '@/lib/productNavigation';
import { getProductPromotion, calculatePromotionalPrice, getDisplayPromotion } from '@/lib/promotionUtils';
import { PromotionBanner, ProductSaleFlag } from '@/components/Products/PromotionBadge';
import { formatPrice } from '@/lib/currencyUtils';
import { currencyCode, trackViewContent } from '@/lib/metaPixel';

interface Product {
  name: string;
  item_name: string;
  item_group: string;
  stock_uom: string;
  description?: string;
  price?: number;
  base_price?: number;
  sale_price?: number;
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
  tags?: string[];
  promotion?: {
    title: string;
    discountPercentage?: number;
    discountAmount?: number;
    couponRequired?: boolean;
  };
  variants?: Array<{
    name: string;
    item_name: string;
    price?: number;
    base_price?: number;
    sale_price?: number;
    currency?: string;
    image?: string;
    promotion?: {
      title: string;
      discountPercentage?: number;
      discountAmount?: number;
      couponRequired?: boolean;
    };
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
  initialProduct?: Product | null;
}

export default function ProductDetailContent({ slug, initialProduct }: ProductDetailContentProps) {
  const previewProduct = getSavedProductPreview(slug);
  const [product, setProduct] = useState<Product | null>(initialProduct ?? previewProduct ?? null);
  const [loading, setLoading] = useState(!(initialProduct ?? previewProduct));
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
  const [quantity, setQuantity] = useState(1);
  
  // Quotation dialog state
  const [showQuotationDialog, setShowQuotationDialog] = useState(false);
  // Added to cart confirmation dialog
  const [showAddedToCartDialog, setShowAddedToCartDialog] = useState(false);
  // Phone number dialog (machine page)
  const [showPhoneDialog, setShowPhoneDialog] = useState(false);

  const MACHINE_CONTACT = {
    email: "krallaser@gmail.com",
    phone: "0322 4414443",
    whatsapp: "https://wa.me/923224414443",
  };

  // Check if product is custom quotation item (ERPNext may use custom_quotation_item or custom_custom_quotation_item)
  const isCustomQuotationItem =
    (product as any)?.custom_quotation_item === 1 ||
    (product as any)?.custom_custom_quotation_item === 1;

  // Meta Pixel — ViewContent when product detail is shown
  useEffect(() => {
    if (!product?.name) return;
    const value = Number(product.sale_price ?? product.price ?? product.base_price ?? 0);
    trackViewContent({
      content_name: product.item_name || product.name,
      content_ids: [product.name],
      content_category: product.item_group,
      currency: currencyCode(product.currency),
      value: value > 0 ? value : undefined,
    });
  }, [product?.name]);

  // Initialize gallery images from product data
  useEffect(() => {
    if (product) {
      const images: Array<{url: string, alt: string, type: 'main' | 'attachment'}> = [];
      
      const displayName = getProductDisplayName(product);
      const mainImagePath =
        (product as { website_image?: string }).website_image || product.image;

      if (mainImagePath) {
        images.push({
          url: getErpnextImageUrl(mainImagePath),
          alt: productImageAlt(displayName),
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
            alt: productImageAlt(displayName),
            type: 'attachment'
          });
        });
      }
      
      setGalleryImages(images);
      setCurrentImageIndex(0);
    }
  }, [product]);

  // Auto-advance gallery every 2 seconds when multiple images (main area)
  useEffect(() => {
    if (galleryImages.length <= 1 || showImagePreview) return;
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [galleryImages.length, showImagePreview]);

  // Auto-advance in lightbox every 2 seconds when multiple images
  useEffect(() => {
    if (!showImagePreview || galleryImages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [showImagePreview, galleryImages.length]);

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

  // Keyboard navigation for image preview
  useEffect(() => {
    if (!showImagePreview) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeImagePreview();
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'ArrowRight') nextImage();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showImagePreview, currentImageIndex, galleryImages.length]);

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
      // Ensure quantity starts from 1 when a valid variation is selected
      setQuantity((prev) => (prev && prev > 0 ? prev : 1));
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
        basePrice: product.base_price || product.price || 0,
        salePrice: product.sale_price || product.price || 0,
        category: product.item_group || "product",
        item_group: product.item_group,
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
      setShowAddedToCartDialog(true);
    }
  };

  // Auto-hide added-to-cart dialog after 2.5s (smooth close via Dialog animation)
  useEffect(() => {
    if (!showAddedToCartDialog) return;
    const timer = setTimeout(() => setShowAddedToCartDialog(false), 2500);
    return () => clearTimeout(timer);
  }, [showAddedToCartDialog]);

  useEffect(() => {
    if (initialProduct) {
      saveProductPreview(slug, initialProduct);
    }
  }, [initialProduct, slug]);

  useEffect(() => {
    if (initialProduct) return; // Server already provided final data
    const fetchProduct = async () => {
      try {
        if (!product) setLoading(true);
        setError(null);
        const response = await fetch(`/api/product/${slug}`, {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache" },
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to fetch product');
        setProduct(data.product);
        saveProductPreview(encodeURIComponent(slug), data.product);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch product');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug, initialProduct]);

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

  /** One filter match → that SKU; several matches → row the user clicked */
  const activeVariation = useMemo(() => {
    if (!isTemplate || !product?.variants?.length) return null;
    if (filteredVariations.length === 0) return null;
    if (filteredVariations.length === 1) {
      const v = filteredVariations[0];
      if (isCustomQuotationItem) return v;
      const stock = (v as any).stock?.totalStock ?? 0;
      return stock > 0 ? v : null;
    }
    if (
      selectedVariation &&
      filteredVariations.some((x) => x.name === selectedVariation.name)
    ) {
      return selectedVariation;
    }
    return null;
  }, [
    isTemplate,
    product?.variants,
    filteredVariations,
    isCustomQuotationItem,
    selectedVariation,
  ]);

  const showVariationList =
    filteredVariations.length > 0 &&
    (selectedAttributes.length > 0 ||
      (product?.variants?.length === 1 && filteredVariations.length === 1));

  const displayPromotion = useMemo(() => {
    if (!product) return null;
    const subject = activeVariation
      ? {
          ...product,
          ...activeVariation,
          promotion: activeVariation.promotion ?? product.promotion,
        }
      : product;
    return getDisplayPromotion(subject);
  }, [product, activeVariation]);

  const flagProduct = useMemo(() => {
    if (!product) return null;
    if (!activeVariation) return product;
    return {
      ...product,
      ...activeVariation,
      promotion: activeVariation.promotion ?? product.promotion,
    };
  }, [product, activeVariation]);

  const displayPrices = useMemo(() => {
    if (!product) return null;
    const cur = product.currency || "PKR";

    if (activeVariation) {
      const base = Number(
        activeVariation.base_price ?? activeVariation.price ?? 0
      );
      const sale = Number(
        activeVariation.sale_price ??
          activeVariation.price ??
          (displayPromotion
            ? calculatePromotionalPrice(base, displayPromotion)
            : base)
      );
      if (base > 0) return { base, sale, currency: activeVariation.currency || cur };
    }

    const base = Number(product.base_price ?? product.price ?? 0);
    const sale = Number(
      product.sale_price ??
        (displayPromotion && base > 0
          ? calculatePromotionalPrice(base, displayPromotion)
          : product.price ?? base)
    );
    if (base > 0) return { base, sale, currency: cur };
    return null;
  }, [product, activeVariation, displayPromotion]);

  const handleAddToCart = () => {
    if (
      activeVariation &&
      (activeVariation as any).stock &&
      (activeVariation as any).stock.totalStock > 0
    ) {
      const cartItem = {
        id: activeVariation.name,
        name: activeVariation.item_name,
        description: activeVariation.description || product?.description || "",
        type: "item",
        basePrice: activeVariation.base_price || activeVariation.price || 0,
        salePrice: activeVariation.sale_price || activeVariation.price || 0,
        category: product?.item_group || "product",
        item_group: product?.item_group,
        currency: activeVariation.currency || "PKR",
        bundleItems: [],
        quantity: quantity,
        image: activeVariation.image || product?.image,
        sku: activeVariation.name,
        variationId: activeVariation.name,
        filterConds: [],
      };

      AddToCart(cartItem, quantity);
      setQuantity(1);
      setShowAddedToCartDialog(true);
    }
  };

  if (loading) {
    return <ProductSkeleton />;
  }

  if (error) {
    return (
      <div className="mx-auto max-w-xl text-center py-24 px-4">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-neutral-100 mb-6">
          <Package className="h-10 w-10 text-neutral-500" />
        </div>
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">Product not found</h2>
        <p className="text-neutral-600 mb-8">{error}</p>
        <Button onClick={() => router.back()} variant="outline" className="rounded-xl">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go back
        </Button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-xl text-center py-24 px-4">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-neutral-100 mb-6">
          <Package className="h-10 w-10 text-neutral-500" />
        </div>
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">Product not found</h2>
        <p className="text-neutral-600 mb-8">The requested product could not be found.</p>
        <Button onClick={() => router.back()} variant="outline" className="rounded-xl">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go back
        </Button>
      </div>
    );
  }

  const currentImage = galleryImages[currentImageIndex];
  const displayName = getProductDisplayName(product);

  return (
    <div className={isCustomQuotationItem ? "min-h-screen bg-gradient-to-b from-neutral-50 to-slate-100/50" : ""}>
      {/* Floating quick actions sidebar (machines) */}
      {isCustomQuotationItem && (
        <div className="fixed left-0 top-1/2 z-40 -translate-y-1/2 flex flex-col gap-0.5 rounded-r-2xl border border-l-0 border-neutral-200/80 bg-white/95 backdrop-blur-sm shadow-xl py-3">
          <button
            type="button"
            onClick={() => {
              const el = document.getElementById("quote-variations");
              if (el) el.scrollIntoView({ behavior: "smooth" });
              else setShowQuotationDialog(true);
            }}
            className="flex flex-col items-center gap-1 px-4 py-2.5 hover:bg-neutral-50 transition-colors rounded-r-lg"
            title="Inquiry"
          >
            <FileImage className="h-5 w-5 text-neutral-600" />
            <span className="text-[10px] font-semibold uppercase tracking-wide text-neutral-500">Inquiry</span>
          </button>
          <button
            type="button"
            onClick={() => {
              const el = document.getElementById("quote-variations");
              if (el) el.scrollIntoView({ behavior: "smooth" });
              else setShowQuotationDialog(true);
            }}
            className="flex flex-col items-center gap-1 px-4 py-2.5 hover:bg-neutral-50 transition-colors rounded-r-lg"
            title="Variations"
          >
            <Tag className="h-5 w-5 text-neutral-600" />
            <span className="text-[10px] font-semibold uppercase tracking-wide text-neutral-500">Variations</span>
          </button>
          <a
            href={MACHINE_CONTACT.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-1 px-4 py-2.5 hover:bg-neutral-50 transition-colors rounded-r-lg"
            title="WhatsApp"
          >
            <MessageCircle className="h-5 w-5 text-emerald-600" />
            <span className="text-[10px] font-semibold uppercase tracking-wide text-neutral-500">WhatsApp</span>
          </a>
          <a
            href={`mailto:${MACHINE_CONTACT.email}`}
            className="flex flex-col items-center gap-1 px-4 py-2.5 hover:bg-neutral-50 transition-colors rounded-r-lg"
            title="Email"
          >
            <Mail className="h-5 w-5 text-neutral-600" />
            <span className="text-[10px] font-semibold uppercase tracking-wide text-neutral-500">Email</span>
          </a>
          <button
            type="button"
            onClick={() => setShowPhoneDialog(true)}
            className="flex flex-col items-center gap-1 px-4 py-2.5 hover:bg-neutral-50 transition-colors rounded-r-lg"
            title="Phone"
          >
            <Phone className="h-5 w-5 text-neutral-600" />
            <span className="text-[10px] font-semibold uppercase tracking-wide text-neutral-500">Call</span>
          </button>
        </div>
      )}

    <div className={`mx-auto max-w-7xl ${isCustomQuotationItem ? "pl-14 sm:pl-16" : ""}`}>
      {/* Breadcrumb - minimal international style */}
      <nav className="mb-8 flex items-center gap-1.5 text-sm text-neutral-500" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-neutral-900 transition-colors">Home</Link>
        <ChevronRight className="h-4 w-4 text-neutral-300 shrink-0" />
        <Link href="/shop" className="hover:text-neutral-900 transition-colors">Shop</Link>
        {product.item_group && (
          <>
            <ChevronRight className="h-4 w-4 text-neutral-300 shrink-0" />
            <Link href={`/shop?group=${encodeURIComponent(product.item_group)}`} className="hover:text-neutral-900 transition-colors truncate max-w-[140px] sm:max-w-none">
              {product.item_group}
            </Link>
          </>
        )}
        <ChevronRight className="h-4 w-4 text-neutral-300 shrink-0" />
        <span className="text-neutral-900 font-medium truncate max-w-[200px] sm:max-w-md" aria-current="page">{product.item_name}</span>
      </nav>

      {/* Machine hero: product name + hero image */}
      {isCustomQuotationItem && (
        <div className="mb-10 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <span className="inline-flex items-center rounded-full bg-neutral-900 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-white">
              Industrial Equipment
            </span>
            <h1 className="mt-4 text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl md:text-4xl lg:text-[2.5rem] leading-tight">
              {product.item_name}
            </h1>
            <p className="mt-2 text-sm text-neutral-500 font-mono">
              Ref: {product.name}
            </p>
            {product.tags && product.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="rounded-full border-neutral-300 bg-white text-xs text-neutral-700"
                  >
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="relative w-full overflow-hidden rounded-2xl bg-neutral-100 shadow-xl ring-1 ring-neutral-200/50"
          >
            {galleryImages.length > 0 ? (
              <figure className="relative aspect-[21/9] w-full min-h-[200px] sm:min-h-[240px] bg-neutral-100">
                <Image
                  src={galleryImages[0].url}
                  alt={galleryImages[0].alt}
                  fill
                  className="object-cover cursor-zoom-in transition-transform duration-500 hover:scale-[1.02]"
                  onClick={() => openImagePreview(0)}
                  sizes="100vw"
                  priority
                />
                <figcaption className="sr-only">{displayName}</figcaption>
                {galleryImages.length > 1 && (
                  <button
                    onClick={() => openImagePreview(0)}
                    className="absolute bottom-4 right-4 rounded-full bg-white/90 backdrop-blur-sm px-4 py-2 text-sm font-medium text-neutral-800 shadow-lg hover:bg-white transition-colors flex items-center gap-2"
                  >
                    <ZoomIn className="h-4 w-4" />
                    View gallery ({galleryImages.length})
                  </button>
                )}
              </figure>
            ) : (
              <div className="flex aspect-[21/9] min-h-[200px] w-full items-center justify-center bg-neutral-100 text-neutral-400">
                <Package className="h-16 w-16 opacity-40" />
                <span className="ml-3 text-sm font-medium">No image available</span>
              </div>
            )}
          </motion.div>
        </div>
      )}

      <div className={`grid grid-cols-1 gap-6 lg:gap-10 ${isCustomQuotationItem ? "lg:grid-cols-1" : "lg:grid-cols-12"}`}>
        {/* Main content: full-width for quote items (HSG-style), otherwise 7-col */}
        <div className={isCustomQuotationItem ? "w-full space-y-5" : "lg:col-span-7 space-y-8"}>
          {/* Main Image – only for non-quotation items */}
          {!isCustomQuotationItem && (
          <figure className="aspect-square bg-neutral-100 rounded-2xl overflow-hidden ring-1 ring-neutral-200/60 shadow-lg relative group">
            <ProductSaleFlag
              product={flagProduct ?? product}
              compact={false}
              className="!top-3 !left-3"
            />
            {galleryImages.length > 0 && currentImage ? (
              <div className="relative w-full h-full">
                <Image
                  src={currentImage.url}
                  alt={currentImage.alt}
                  fill
                  className="object-cover cursor-zoom-in transition-transform duration-300 group-hover:scale-[1.02]"
                  onClick={() => openImagePreview(currentImageIndex)}
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  priority
                />
                <figcaption className="sr-only">{displayName}</figcaption>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200 flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/90 text-slate-800 rounded-full p-3 shadow-lg">
                    <ZoomIn className="h-6 w-6" />
                  </span>
                </div>
                {galleryImages.length > 1 && (
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-neutral-800 text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg">
                    {currentImageIndex + 1} / {galleryImages.length}
                  </div>
                )}
              </div>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                <Package className="h-20 w-20 mb-3 opacity-60" />
                <p className="text-sm font-medium">No image available</p>
              </div>
            )}
          </figure>
          )}

          {/* Thumbnails – hidden for quotation items */}
          {!isCustomQuotationItem && galleryImages.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-thin">
              {galleryImages.map((image, index) => (
                <button
                  key={index}
                  type="button"
                  className={`relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden ring-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-400 ${
                    currentImageIndex === index
                      ? 'ring-neutral-900 shadow-lg scale-[1.02]'
                      : 'ring-transparent hover:ring-neutral-300'
                  }`}
                  onClick={() => setCurrentImageIndex(index)}
                  aria-label={`View ${image.alt}`}
                >
                  <Image
                    src={image.url}
                    alt={image.alt}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                  {image.type === 'attachment' && (
                    <div className="absolute top-1 left-1 rounded bg-black/50 p-0.5">
                      <FileImage className="h-3 w-3 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Machine gallery + trust (quotation items only — description for regular items is under Add to cart) */}
          {isCustomQuotationItem && (
          <section className="pt-0">
              <>
                <MachineProductGallery
                  product={{
                    item_name: product.item_name,
                    description: product.description,
                    attachments: product.attachments,
                  }}
                  isMachine={true}
                />
                {/* Trust indicator for machine detail */}
                <div className="mt-8 rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm">
                  <Quote className="h-10 w-10 text-neutral-300" aria-hidden />
                  <blockquote className="mt-3 text-neutral-700 text-base leading-relaxed">
                    &ldquo;We have been using their equipment for over three years. Outstanding reliability and excellent after-sales support. Highly recommend for industrial applications.&rdquo;
                  </blockquote>
                  <footer className="mt-4 flex flex-wrap items-center gap-x-3 text-sm">
                    <span className="font-semibold text-neutral-900">— Manufacturing Director</span>
                    <span className="text-neutral-500">Leading Industrial Solutions</span>
                  </footer>
                </div>
              </>
          </section>
          )}
        </div>

        {/* Right: Sticky product info & actions (hidden for quote items – use hero + variations below) */}
        {!isCustomQuotationItem && (
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-24 space-y-6">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2">
              {isTemplate && (
                <Badge variant="outline" className="text-xs font-semibold border-neutral-300 text-neutral-700 rounded-full px-3">
                  <Tag className="h-3 w-3 mr-1.5" />
                  Configurable
                </Badge>
              )}
              {isCustomQuotationItem && (
                <Badge className="bg-neutral-900 text-white text-xs font-semibold rounded-full px-3 border-0">
                  <Info className="h-3 w-3 mr-1.5" />
                  Request Quote
                </Badge>
              )}
              {!isTemplate && !isCustomQuotationItem && product.stock && product.stock.totalStock > 0 && (
                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-semibold rounded-full px-3">
                  Available
                </Badge>
              )}
              {!isTemplate && !isCustomQuotationItem && product.stock && product.stock.totalStock === 0 && (
                <Badge variant="outline" className="text-amber-700 border-amber-200 bg-amber-50 text-xs font-semibold rounded-full px-3">
                  Out of Stock
                </Badge>
              )}
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight leading-tight mb-2">
                {product.item_name}
              </h1>
              <p className="text-neutral-500 text-sm font-mono tracking-wide">Ref: {product.name}</p>
              {product.tags && product.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {product.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="rounded-full border-neutral-300 bg-white text-xs text-neutral-700"
                    >
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {displayPromotion && (
              <PromotionBanner
                promotion={displayPromotion}
                basePrice={displayPrices?.base}
                salePrice={displayPrices?.sale}
                currency={displayPrices?.currency}
              />
            )}

            {/* Price */}
            {displayPrices && displayPrices.sale > 0 && (
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="text-2xl sm:text-3xl font-bold text-red-600 tracking-tight">
                  {formatPrice(displayPrices.sale, displayPrices.currency)}
                </span>
                {displayPrices.base > displayPrices.sale && (
                  <span className="text-lg sm:text-xl text-neutral-400 line-through">
                    {formatPrice(displayPrices.base, displayPrices.currency)}
                  </span>
                )}
                <span className="text-neutral-500 text-sm w-full sm:w-auto">
                  / {product.stock_uom}
                </span>
                {displayPromotion?.discountPercentage ? (
                  <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-sm font-semibold text-red-600">
                    Save {displayPromotion.discountPercentage}%
                  </span>
                ) : null}
              </div>
            )}

            <Separator className="bg-neutral-200" />

          {/* Simple Product Add to Cart Section */}
          {!isTemplate && isSimpleProductInStock && !isCustomQuotationItem && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center border border-slate-300 rounded-lg bg-white">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-l-md hover:bg-slate-100"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="px-4 py-2 min-w-[52px] text-center font-medium tabular-nums">
                    {quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-r-md hover:bg-slate-100"
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={quantity >= (product.stock?.totalStock || 0)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="text-sm text-slate-600">
                  Subtotal: <span className="font-semibold text-slate-900">{product.currency} {(product.price !== undefined ? (product.price * quantity).toLocaleString() : '—')}</span>
                </div>
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

              {/* Variations list and always-visible Add to Cart panel */}
              <div className="space-y-4">
                {showVariationList ? (
                  <div className="rounded-2xl border border-neutral-200 bg-neutral-50/80 p-5">
                    <h3 className="text-sm font-semibold text-neutral-700 uppercase tracking-wider mb-4">
                      {isCustomQuotationItem ? "Configurations" : "Available options"} ({filteredVariations.length})
                    </h3>
                    <div className="space-y-2">
                      {filteredVariations.map((variant) => {
                        const variantInStock =
                          (variant as any).stock && (variant as any).stock.totalStock > 0;
                        const isSelectable = isCustomQuotationItem || variantInStock;
                        const isSelected = activeVariation?.name === variant.name;
                        return (
                          <div
                            key={variant.name}
                            className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                              isSelectable
                                ? "bg-white hover:shadow-sm cursor-pointer hover:border-neutral-300"
                                : "bg-neutral-100/80 opacity-70 cursor-not-allowed"
                            } ${
                              isSelected
                                ? "border-neutral-900 ring-1 ring-neutral-900/10 shadow-sm"
                                : "border-neutral-200"
                            }`}
                            onClick={() => isSelectable && handleVariationClick(variant)}
                          >
                            <div className="flex-1 flex items-center space-x-3">
                              {variant.image && (
                                <div
                                  className="relative w-12 h-12 rounded-lg overflow-hidden group cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const variantImageUrl = getErpnextImageUrl(variant.image);
                                    const existingIndex = galleryImages.findIndex(
                                      (img) => img.url === variantImageUrl
                                    );
                                    if (existingIndex >= 0) {
                                      openImagePreview(existingIndex);
                                    }
                                  }}
                                >
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
                                      {idx < (variant.attributes?.length || 0) - 1 ? " • " : ""}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                            {variant.price != null && (
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <span className="font-semibold text-slate-900">
                                  {variant.currency} {Number(variant.price).toLocaleString()}
                                </span>
                                {isCustomQuotationItem ? (
                                  <Badge className="text-xs bg-neutral-100 text-neutral-700 border-neutral-200 rounded-full">
                                    Quote
                                  </Badge>
                                ) : variantInStock ? (
                                  <Badge className="text-xs bg-emerald-600/10 text-emerald-700 border-emerald-200">
                                    Available
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="text-xs text-red-600 border-red-200">
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
                ) : (
                  <div className="text-center py-8 rounded-2xl border border-dashed border-neutral-200 bg-neutral-50/80">
                    <Package className="h-10 w-10 mx-auto text-neutral-400 mb-3" />
                    <p className="text-sm font-medium text-neutral-600">
                      {selectedAttributes.length > 0 && filteredVariations.length === 0
                        ? "No options match this combination. Try different attributes."
                        : `Select attributes above to see ${isCustomQuotationItem ? "configurations" : "available options"}.`}
                    </p>
                  </div>
                )}

                {!isCustomQuotationItem && (
                  <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-emerald-800 text-sm">Selected variation</h4>
                        {filteredVariations.length > 1 && selectedVariation && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 rounded-full"
                            onClick={() => {
                              setSelectedVariation(null);
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        {activeVariation ? (
                          <>
                            <div>
                              <p className="font-medium text-slate-900">
                                {activeVariation.item_name}
                              </p>
                              <p className="text-xs text-slate-500 font-mono">
                                SKU: {activeVariation.name}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-slate-900">
                                {activeVariation.currency}{" "}
                                {activeVariation.price != null
                                  ? Number(activeVariation.price).toLocaleString()
                                  : "—"}
                              </p>
                              <p
                                className={`text-xs font-medium ${
                                  (activeVariation as any).stock?.totalStock > 0
                                    ? "text-emerald-700"
                                    : "text-red-600"
                                }`}
                              >
                                {(activeVariation as any).stock?.totalStock > 0
                                  ? "Available"
                                  : "Out of stock"}
                              </p>
                            </div>
                          </>
                        ) : (
                          <p className="text-xs text-slate-600">
                            {filteredVariations.length === 1
                              ? "This option is out of stock."
                              : "Choose attributes above, then pick an option if more than one match."}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex items-center border border-slate-300 rounded-lg bg-white">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9"
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            disabled={quantity <= 1 || !activeVariation}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="px-3 py-1.5 min-w-[44px] text-center font-medium tabular-nums text-sm">
                            {activeVariation ? quantity : 0}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9"
                            onClick={() => setQuantity(quantity + 1)}
                            disabled={
                              !activeVariation ||
                              quantity >= ((activeVariation as any).stock?.totalStock || 0)
                            }
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <Button
                          onClick={handleAddToCart}
                          className="flex-1 min-w-[140px] bg-emerald-600 hover:bg-emerald-700 text-white"
                          disabled={!activeVariation}
                        >
                          <ShoppingCart className="mr-2 h-4 w-4" />
                          Add to Cart
                        </Button>
                      </div>
                      {activeVariation && (
                        <p className="text-sm text-slate-600">
                          Subtotal:{" "}
                          <span className="font-semibold">
                            {activeVariation.currency}{" "}
                            {(activeVariation.price != null
                              ? activeVariation.price * quantity
                              : 0
                            ).toLocaleString()}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Primary actions */}
          <div className="space-y-3">
            {isCustomQuotationItem && (
              <Button
                size="lg"
                className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-semibold rounded-xl h-12"
                onClick={() => setShowQuotationDialog(true)}
                disabled={isTemplate && isCustomQuotationItem && !activeVariation}
              >
                <Quote className="mr-2 h-4 w-4" />
                Request Quote
              </Button>
            )}

            {/* Simple product Add to Cart */}
            {!isTemplate && isSimpleProductInStock && !isCustomQuotationItem && (
              <Button
                size="lg"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl h-12"
                onClick={handleSimpleProductAddToCart}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                Add to Cart
              </Button>
            )}

            <Button
              variant="outline"
              size="lg"
              className="w-full rounded-xl border-neutral-300 h-12 font-medium"
              asChild
            >
              <Link href="/contact">Contact Sales</Link>
            </Button>
          </div>

          {/* Description — below primary actions (Add to cart / Contact) */}
          <section className="pt-2 border-t border-slate-200">
            <ProductDescription description={product.description} />
          </section>

          {/* Specifications */}
          <Card className="rounded-2xl border-neutral-200/80 shadow-sm overflow-hidden">
            <CardHeader className="pb-3 border-b border-neutral-100">
              <CardTitle className="text-base font-semibold text-neutral-900">Specifications</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <dl className="divide-y divide-neutral-100 text-sm">
                <div className="flex justify-between gap-4 px-6 py-4">
                  <dt className="text-neutral-500 font-medium">Item code</dt>
                  <dd className="font-mono font-semibold text-neutral-900 text-right">{product.name}</dd>
                </div>
                <div className="flex justify-between gap-4 px-6 py-4">
                  <dt className="text-neutral-500 font-medium">Category</dt>
                  <dd className="font-medium text-neutral-900 text-right">{product.item_group}</dd>
                </div>
                {!isTemplate && product.stock && !isCustomQuotationItem && (
                  <div className="flex justify-between gap-4 px-6 py-4">
                    <dt className="text-neutral-500 font-medium">Availability</dt>
                    <dd
                      className={`font-medium text-right ${
                        product.stock.totalStock > 0 ? "text-emerald-600" : "text-red-600"
                      }`}
                    >
                      {product.stock.totalStock > 0 ? "Available" : "Out of stock"}
                    </dd>
                  </div>
                )}
                {isTemplate && (
                  <div className="flex justify-between gap-4 px-6 py-4">
                    <dt className="text-neutral-500 font-medium">Variations</dt>
                    <dd className="font-medium text-neutral-900 text-right">{product.variants?.length ?? 0} options</dd>
                  </div>
                )}
                {isCustomQuotationItem && (
                  <div className="flex justify-between gap-4 px-6 py-4">
                    <dt className="text-neutral-500 font-medium">Type</dt>
                    <dd className="font-medium text-neutral-900 text-right">Custom quotation</dd>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>
          </div>
        </div>
        )}
      </div>

      {/* For quote items: Variations section below (if template) */}
      {isCustomQuotationItem && (
        <div className="mt-5 space-y-3">
          {isTemplate && product.variants && product.variants.length > 0 && (
            <Card id="quote-variations" className="rounded-2xl border-neutral-200/80 shadow-sm p-6 scroll-mt-24">
              <h3 className="mb-4 text-base font-semibold text-neutral-900">Select Configuration</h3>
              <AttributeFilter
                templateItemName={product.name}
                onAttributeChange={handleAttributeChange}
                selectedAttributes={selectedAttributes}
              />
              {showVariationList ? (
                <div className="mt-4 space-y-3">
                  {filteredVariations.map((variant) => {
                    const isSelected = activeVariation?.name === variant.name;
                    return (
                      <div
                        key={variant.name}
                        onClick={() => handleVariationClick(variant)}
                        className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                          isSelected ? "border-neutral-900 ring-2 ring-neutral-900/10 bg-neutral-50" : "border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50/50"
                        }`}
                      >
                        <span className="font-medium">{variant.item_name}</span>
                        {variant.price != null && (
                          <span className="text-slate-600">{variant.currency} {Number(variant.price).toLocaleString()}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </Card>
          )}
        </div>
      )}

      {/* Phone dialog */}
      <Dialog open={showPhoneDialog} onOpenChange={setShowPhoneDialog}>
        <DialogContent className="sm:max-w-md rounded-2xl border-neutral-200 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Contact us</DialogTitle>
            <DialogDescription>Call for inquiries about this product.</DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-4 py-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100">
              <Phone className="h-6 w-6 text-neutral-700" />
            </div>
            <a href={`tel:${MACHINE_CONTACT.phone}`} className="text-xl font-semibold text-neutral-900 hover:text-neutral-600 transition-colors">
              {MACHINE_CONTACT.phone}
            </a>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowPhoneDialog(false)} className="rounded-xl">Close</Button>
            <Button asChild className="rounded-xl bg-neutral-900 hover:bg-neutral-800">
              <a href={`tel:${MACHINE_CONTACT.phone}`}>Call now</a>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image lightbox */}
      {showImagePreview && galleryImages.length > 0 && (
        <div 
          className="fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={closeImagePreview}
        >
          <div className="relative max-w-6xl w-full h-full flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between py-4 px-2">
              <p className="text-neutral-400 text-sm font-medium">
                {currentImageIndex + 1} of {galleryImages.length}
              </p>
              <button
                onClick={closeImagePreview}
                className="rounded-full p-2.5 text-white hover:bg-white/10 transition-colors"
                aria-label="Close"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="relative flex-1 flex items-center justify-center min-h-0">
              {galleryImages.length > 1 && (
                <button
                  onClick={(e) => { e.stopPropagation(); prevImage(); }}
                  className="absolute left-2 sm:left-4 z-10 rounded-full p-3 bg-white/10 hover:bg-white/20 text-white transition-colors"
                  aria-label="Previous"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
              )}
              <Image
                src={galleryImages[currentImageIndex].url}
                alt={galleryImages[currentImageIndex].alt}
                width={1200}
                height={800}
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
              />
              {galleryImages.length > 1 && (
                <button
                  onClick={(e) => { e.stopPropagation(); nextImage(); }}
                  className="absolute right-2 sm:right-4 z-10 rounded-full p-3 bg-white/10 hover:bg-white/20 text-white transition-colors"
                  aria-label="Next"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              )}
            </div>
            {galleryImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto py-4 justify-center">
                {galleryImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(i); }}
                    className={`flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden ring-2 transition-all ${
                      currentImageIndex === i ? 'ring-white' : 'ring-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <Image src={img.url} alt="" width={56} height={56} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Added to cart confirmation */}
      <Dialog open={showAddedToCartDialog} onOpenChange={setShowAddedToCartDialog}>
        <DialogContent className="sm:max-w-md rounded-2xl border-neutral-200 shadow-xl">
          <DialogHeader className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 mb-4">
              <CheckCircle className="h-9 w-9 text-emerald-600" />
            </div>
            <DialogTitle className="text-xl font-semibold text-neutral-900">Added to cart</DialogTitle>
            <DialogDescription className="text-neutral-600">
              The item has been added to your cart. Continue shopping or proceed to checkout.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-center mt-6">
            <Button
              variant="outline"
              className="rounded-xl border-emerald-600 text-emerald-700 hover:bg-emerald-50"
              onClick={() => setShowAddedToCartDialog(false)}
            >
              Continue shopping
            </Button>
            <Button
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white h-11"
              asChild
            >
              <Link href="/cart">View cart</Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quotation Dialog */}
      {product && (
        <QuotationDialog
          open={showQuotationDialog}
          onClose={() => setShowQuotationDialog(false)}
          product={product}
          selectedVariation={activeVariation}
        />
      )}
    </div>
    </div>
  );
}