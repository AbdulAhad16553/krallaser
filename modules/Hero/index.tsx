import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getOptimizedImageUrl, IMAGE_SIZES } from "@/lib/imageUtils";
import {
  ArrowRight,
  ShoppingBag,
  Eye,
  Heart,
  Star,
  Zap,
  Shield,
} from "lucide-react";
import {
  getEffectivePrice,
  hasDiscount,
  formatPrice,
  getBasePriceForDisplay,
} from "@/lib/currencyUtils";

interface HeroProps {
  content: {
    title?: string;
    content?: string;
    heroImage?: string;
  };
  storeData: any;
  categories: any[];
  products: any[];
  hideOnPage: boolean;
}

interface StoreStats {
  totalProducts: number;
  totalCategories: number;
  productsOnSale: number;
  productsInStock: number;
}

const Hero = async ({
  content,
  storeData,
  categories,
  products,
  hideOnPage,
}: HeroProps) => {
  // Extract dynamic data from store
  const storeName = storeData?.store_name || "Kral Laser";
  const tagline = storeData?.store_detail?.tagline;
  const primaryColor = storeData?.store_detail?.primary_color || "#EF4444";
  const secondaryColor = storeData?.store_detail?.secondary_color || "#8B5CF6";
  const currency = storeData?.store_detail?.currency || "Rs.";

  // Fetch real aggregate statistics from the database
  const fetchStoreStats = async (): Promise<StoreStats> => {
    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000" || "http://localhost:3001"
        }/api/storeStats?storeId=${storeData?.id || 1}`,
        {
          cache: "no-store", // Always fetch fresh data
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch store stats: ${response.status}`);
      }

      const stats = await response.json();

      console.log("Hero component - Store stats received:", stats);
      console.log("Hero component - Store ID used:", storeData?.id || 1);

      // Validate the response structure
      if (!stats || typeof stats.totalProducts !== "number") {
        throw new Error("Invalid stats response format");
      }

      return stats;
    } catch (error) {
      console.error("Error fetching store stats:", error);
      // Fallback to calculated stats from passed data
      const fallbackStats = {
        totalProducts: products?.length || 0,
        totalCategories: categories?.length || 0,
        productsOnSale:
          products?.filter((product) => hasDiscount(product)).length || 0,
        productsInStock: 0,
      };
      console.log("Hero component - Using fallback stats:", fallbackStats);
      console.log("Hero component - Products data length:", products?.length);
      console.log(
        "Hero component - Categories data length:",
        categories?.length
      );
      return fallbackStats;
    }
  };

  const storeStats = await fetchStoreStats();

  // Calculate additional stats from products data if not available from API
  const enhancedStats = {
    ...storeStats,
    productsOnSale:
      storeStats.productsOnSale > 0
        ? storeStats.productsOnSale
        : products?.filter((product) => hasDiscount(product)).length || 0,
  };

  // Get the first product from the products array (passed from page)
  const featuredProduct = products && products.length > 0 ? products[0] : null;
  console.log("featuredProduct", featuredProduct);
  const featuredCategories = categories?.slice(0, 3) || [];

  return (
    <section className="relative w-full bg-white overflow-hidden">
      {/* Background element - faint circular shape */}
      <div className="absolute inset-0">
        <div
          className="absolute top-20 left-20 w-96 h-96 rounded-full opacity-5 blur-3xl"
          style={{ backgroundColor: primaryColor }}
        ></div>
      </div>

      <div className="container mx-auto px-6 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content - Hero Text & CTAs */}
          <div className="text-left space-y-8">
            {/* Main Heading */}
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                  <span className="text-gray-900">
                  {content?.title || "Laser Technology That Defines Excellence"}
                  </span>
                  <br />
                  <span
  style={{
    background: "linear-gradient(90deg, #b70909, #3a1b1b)",   // red → dark
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  }}
>
  {storeName}
</span>
                </h1>
              <p className="text-base md:text-lg text-gray-600 max-w-xl leading-relaxed">
                  {content?.content ||
                  "At Kral Laser, we combine cutting-edge technology with unmatched craftsmanship to deliver precise, flawless laser cutting for metal, wood, acrylic, and more. From intricate custom designs to high-volume industrial production, we bring your ideas to life with speed, accuracy, and style."}
                </p>
            </div>

            {/* CTA Buttons */}
            {!hideOnPage && (
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/shop">
                  <Button
                    size="lg"
                    className="group text-white px-8 py-6 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <ShoppingBag className="w-5 h-5 mr-2" />
                    Start Shopping
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/category">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-2 border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 px-8 py-6 text-base font-semibold transition-all duration-300"
                  >
                    <Eye className="w-5 h-5 mr-2" />
                    Explore Categories
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>
            )}

            {/* Quick Stats - Bottom Left */}
            <div className="pt-8">
              <div className="grid grid-cols-4 gap-4">
                <div className="text-left">
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {enhancedStats.totalProducts > 0 ? enhancedStats.totalProducts : "0"}
                  </div>
                  <div className="text-xs text-gray-600 uppercase tracking-wider font-medium">
                    Products
                  </div>
                </div>

                <div className="text-left">
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {enhancedStats.totalCategories > 0 ? enhancedStats.totalCategories : "0"}
                  </div>
                  <div className="text-xs text-gray-600 uppercase tracking-wider font-medium">
                    Categories
                  </div>
                </div>

                <div className="text-left">
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {enhancedStats.productsOnSale > 0 ? enhancedStats.productsOnSale : "0"}
                  </div>
                  <div className="text-xs text-gray-600 uppercase tracking-wider font-medium">
                    On Sale
                  </div>
                </div>

                <div className="text-left">
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {enhancedStats.productsInStock > 0 ? enhancedStats.productsInStock : "0"}
                  </div>
                  <div className="text-xs text-gray-600 uppercase tracking-wider font-medium">
                    Available
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content - Single Product Card */}
          <div className="relative">
            {featuredProduct ? (
              <div className="relative group">
                {/* Card container */}
                <div className="relative w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                  {/* Image */}
                  <div className="relative w-full aspect-[4/3] bg-gray-100">
                    {featuredProduct.product_images && featuredProduct.product_images.length > 0 ? (
                    <Image
                      src={getOptimizedImageUrl(
                        featuredProduct.product_images.find(
                          (img: any) => img.position === "featured"
                        )?.image_id ||
                          featuredProduct.product_images[0].image_id,
                        IMAGE_SIZES.HERO_LARGE
                      )}
                      alt={featuredProduct.name}
                      fill
                      priority
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <ShoppingBag className="w-16 h-16 text-gray-300" />
                      </div>
                    )}

                    {/* Price badge */}
                    <div className="absolute top-4 right-4 bg-gray-800/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
                      <div className="text-base font-bold text-white">
                        {formatPrice(
                          getBasePriceForDisplay(featuredProduct) ||
                            getEffectivePrice(featuredProduct),
                          currency
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                        {featuredProduct.name}
                      </h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {featuredProduct.short_description ||
                          featuredProduct.description ||
                        "High-performance laser source designed for fiber laser machines."}
                      </p>
                    
                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-4">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className="w-4 h-4 text-yellow-400 fill-current"
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500">
                        4.9 Popular choice
                        </span>
                    </div>

                    {/* Features */}
                    <div className="flex items-center gap-4 mb-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Zap className="w-4 h-4 text-blue-500" />
                        Fast checkout
                      </div>
                      <div className="flex items-center gap-1">
                        <Shield className="w-4 h-4 text-green-500" />
                        Secure
                      </div>
                    </div>

                    {/* View Product Button */}
                    <Link href={`/product/${featuredProduct.slug || featuredProduct.sku}`}>
                        <Button
                        className="w-full group px-5 py-2.5 font-semibold text-white transition-all hover:opacity-90"
                          style={{ backgroundColor: primaryColor }}
                        >
                          View Product
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                  </div>
                </div>
              </div>
            ) : (
              // Fallback when no products available
              <div className="relative">
                <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl border border-gray-200 p-12 flex items-center justify-center">
                    <div className="text-center">
                      <div
                        className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center"
                        style={{ backgroundColor: primaryColor + "20" }}
                      >
                        <ShoppingBag
                          className="w-12 h-12"
                          style={{ color: primaryColor }}
                        />
                      </div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">
                      No Products Available
                      </h3>
                      <p className="text-sm text-gray-600">
                      Products will appear here once added
                      </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
