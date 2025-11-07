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
  calculateDiscountPercent,
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
  const storeName = storeData?.store_name || "Your Store";
  const tagline = storeData?.store_detail?.tagline;
  const primaryColor = storeData?.store_detail?.primary_color || "#3B82F6";
  const secondaryColor = storeData?.store_detail?.secondary_color || "#8B5CF6";
  const currency = storeData?.store_detail?.currency || "Rs.";

  // Fetch real aggregate statistics from the database
  const fetchStoreStats = async (): Promise<StoreStats> => {
    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
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

  // Get a single random product with an image for showcase
  const getRandomProduct = () => {
    const productsWithImages =
      products?.filter(
        (product) => product.product_images && product.product_images.length > 0
      ) || [];
    if (productsWithImages.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * productsWithImages.length);
    return productsWithImages[randomIndex];
  };

  const featuredProduct = getRandomProduct();
  const featuredCategories = categories?.slice(0, 3) || [];

  return (
    <section className="relative w-full bg-gradient-to-br from-gray-50 via-white to-gray-100 overflow-hidden">
      {/* Enhanced background elements */}
      <div className="absolute inset-0">
        <div
          className="absolute top-20 left-20 w-32 h-32 rounded-full opacity-10"
          style={{ backgroundColor: primaryColor }}
        ></div>
        <div
          className="absolute top-40 right-32 w-24 h-24 rounded-full opacity-10"
          style={{ backgroundColor: secondaryColor }}
        ></div>
        <div
          className="absolute bottom-32 left-1/3 w-20 h-20 rounded-full opacity-10"
          style={{ backgroundColor: primaryColor }}
        ></div>
        <div
          className="absolute top-1/2 right-1/4 w-16 h-16 rounded-full opacity-5"
          style={{ backgroundColor: secondaryColor }}
        ></div>
      </div>

      <div className="container mx-auto px-6 py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-24 items-center">
          {/* Left Content - Enhanced Text & CTAs */}
          <div className="text-center lg:text-left space-y-12">
            {/* Enhanced Main Heading */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                  <span className="text-gray-900">
                    {content?.title || `Welcome to`}
                  </span>
                  <br />
                  <span
                    className="text-transparent bg-clip-text"
                    style={{
                      background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                      WebkitBackgroundClip: "text",
                    }}
                  >
                    {storeName}
                  </span>
                </h1>
                <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                  {content?.content ||
                    tagline ||
                    (enhancedStats.totalProducts > 0
                      ? `Discover ${enhancedStats.totalProducts} exceptional products across ${enhancedStats.totalCategories} categories. From cutting-edge laser technology to precision engineering, we deliver quality that exceeds expectations.`
                      : `Discover extraordinary products that transform your world. Quality meets innovation at every turn.`)}
                </p>
              </div>
            </div>

            {/* Enhanced CTA Buttons */}
            {!hideOnPage && (
              <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start">
                <Link href="/shop">
                  <Button
                    size="lg"
                    className="group text-white px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-rotate-1"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <ShoppingBag className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                    Start Shopping
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </Button>
                </Link>
                <Link href="/category">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-2 border-gray-300 hover:border-blue-500 text-gray-700 hover:text-blue-600 px-8 py-4 text-lg font-semibold transition-all duration-500 transform hover:scale-105 hover:rotate-1 shadow-lg hover:shadow-xl"
                  >
                    <Eye className="w-5 h-5 mr-2" />
                    Explore Categories
                  </Button>
                </Link>
              </div>
            )}

            {/* Enhanced Quick Stats */}
            <div className="space-y-8 pt-12">
              {/* Primary Stats Row - 4 columns */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center group">
                  <div className="text-xl font-bold text-gray-700 mb-2 group-hover:scale-110 transition-transform duration-300">
                    {enhancedStats.totalProducts > 0 ? (
                      <>
                        {enhancedStats.totalProducts}
                        {enhancedStats.totalProducts >= 50 ? "+" : ""}
                      </>
                    ) : (
                      <span className="text-gray-400">0</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider font-medium">
                    Products
                  </div>
                </div>

                <div className="text-center group">
                  <div className="text-xl font-bold text-gray-700 mb-2 group-hover:scale-110 transition-transform duration-300">
                    {enhancedStats.totalCategories > 0 ? (
                      <>
                        {enhancedStats.totalCategories}
                        {enhancedStats.totalCategories >= 10 ? "+" : ""}
                      </>
                    ) : (
                      <span className="text-gray-400">0</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider font-medium">
                    Categories
                  </div>
                </div>

                <div className="text-center group">
                  <div className="text-xl font-bold text-gray-700 mb-2 group-hover:scale-110 transition-transform duration-300">
                    {enhancedStats.productsOnSale > 0 ? (
                      <>
                        {enhancedStats.productsOnSale}
                        {enhancedStats.productsOnSale >= 20 ? "+" : ""}
                      </>
                    ) : (
                      <span className="text-gray-400">0</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider font-medium">
                    On Sale
                  </div>
                </div>

                <div className="text-center group">
                  <div className="text-xl font-bold text-gray-700 mb-2 group-hover:scale-110 transition-transform duration-300">
                    {enhancedStats.productsInStock > 0 ? (
                      <>
                        {enhancedStats.productsInStock}
                        {enhancedStats.productsInStock >= 50 ? "+" : ""}
                      </>
                    ) : (
                      <span className="text-gray-400">0</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider font-medium">
                    Available
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content - Modern Single Product Card */}
          <div className="relative">
            {featuredProduct ? (
              <div className="relative group">
                {/* Card container */}
                <div
                  className="relative w-[22rem] md:w-[24rem] mx-auto bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden transition-all duration-500 group-hover:shadow-3xl focus-within:ring-2 focus-within:ring-offset-2"
                  style={{ boxShadow: "0 20px 40px rgba(0,0,0,0.08)" }}
                >
                  {/* Gradient border glow on hover */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: `linear-gradient(135deg, ${primaryColor}33, ${secondaryColor}33)`,
                      mixBlendMode: "multiply",
                    }}
                  />
                  {/* Decorative gradient ring */}
                  <div
                    className="absolute -top-24 -right-24 w-72 h-72 rounded-full opacity-10 blur-2xl"
                    style={{
                      background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                    }}
                  />

                  {/* Image */}
                  <div className="relative w-full aspect-[4/3]">
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

                    {/* Sale/Discount badge */}
                    {hasDiscount(featuredProduct) && (
                      <div className="absolute top-4 left-4 flex items-center gap-2">
                        <div className="bg-red-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg">
                          SALE
                        </div>
                        <div className="bg-white/90 text-red-600 text-xs font-bold px-3 py-1 rounded-full shadow-lg border border-white/50">
                          -
                          {calculateDiscountPercent(
                            getBasePriceForDisplay(featuredProduct),
                            getEffectivePrice(featuredProduct)
                          )}
                          %
                        </div>
                      </div>
                    )}

                    {/* Price badge */}
                    <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-xl px-4 py-2 shadow-lg border border-white/30">
                      {hasDiscount(featuredProduct) ? (
                        <div className="flex items-baseline gap-2">
                          <div className="text-lg font-bold text-gray-900">
                            {formatPrice(
                              getEffectivePrice(featuredProduct),
                              currency
                            )}
                          </div>
                          <div className="text-xs text-gray-400 line-through">
                            {formatPrice(
                              getBasePriceForDisplay(featuredProduct),
                              currency
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="text-lg font-bold text-gray-900">
                          {formatPrice(
                            getEffectivePrice(featuredProduct),
                            currency
                          )}
                        </div>
                      )}
                    </div>

                    {/* Hover actions */}
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="flex gap-3">
                        <Button
                          size="icon"
                          className="rounded-full w-11 h-11 shadow-xl"
                          style={{ backgroundColor: primaryColor }}
                          aria-label="Add to wishlist"
                        >
                          <Heart className="w-5 h-5" />
                        </Button>
                        <Link href={`/product/${featuredProduct.slug}`}>
                          <Button
                            size="icon"
                            className="rounded-full w-11 h-11 shadow-xl"
                            style={{ backgroundColor: primaryColor }}
                            aria-label="View product"
                          >
                            <Eye className="w-5 h-5" />
                          </Button>
                        </Link>
                        <Button
                          size="icon"
                          className="rounded-full w-11 h-11 shadow-xl"
                          style={{ backgroundColor: primaryColor }}
                          aria-label="Add to cart"
                        >
                          <ShoppingBag className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-6 flex flex-col justify-between relative">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 line-clamp-2">
                        {featuredProduct.name}
                      </h3>
                      <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                        {featuredProduct.short_description ||
                          featuredProduct.description ||
                          "Experience quality and performance in every detail."}
                      </p>
                      <div className="mt-3 flex items-center gap-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className="w-4 h-4 text-yellow-400 fill-current"
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500">
                          4.9 • Popular choice
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Zap className="w-4 h-4 text-blue-500" />
                        Fast checkout
                        <Shield className="w-4 h-4 text-green-500 ml-3" />
                        Secure
                      </div>
                      <Link href={`/product/${featuredProduct.slug}`}>
                        <Button
                          className="group px-5 py-2 font-semibold text-white transition-transform hover:scale-[1.02]"
                          style={{ backgroundColor: primaryColor }}
                        >
                          View Product
                          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
                        </Button>
                      </Link>
                    </div>

                    {/* Animated bottom accent */}
                    <div
                      aria-hidden
                      className="absolute left-6 right-6 bottom-2 h-1.5 rounded-full transition-all duration-500 group-hover:opacity-100"
                      style={{
                        background: `linear-gradient(90deg, ${primaryColor}, ${secondaryColor})`,
                        opacity: 0.7,
                      }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              // Fallback when no products available
              <div className="relative">
                <div className="w-80 h-80 mx-auto">
                  <div className="relative w-full h-full bg-white rounded-3xl shadow-2xl flex items-center justify-center border border-gray-200">
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
                        Add Products
                      </h3>
                      <p className="text-sm text-gray-600">
                        Upload products to see them here
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Bottom category navigation */}
        {featuredCategories.length > 0 && (
          <div className="mt-20 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-8">
              Quick Categories
            </h2>
            <div className="flex flex-wrap justify-center gap-6">
              {featuredCategories.map((category, index) => (
                <Link
                  key={category.id || index}
                  href={`/category/${category.slug}`}
                  className="group bg-white rounded-xl px-6 py-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                      style={{ backgroundColor: primaryColor + "20" }}
                    >
                      <ShoppingBag
                        className="w-5 h-5"
                        style={{ color: primaryColor }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors duration-200">
                      {category.name}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Hero;
