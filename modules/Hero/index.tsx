import React, { Suspense } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HeroImageCarousel } from "@/components/HeroImageCarousel";
import { FeaturedProductImageCarousel } from "@/components/FeaturedProductImageCarousel";
import { HeroInfoCards } from "@/components/HeroInfoCards";
import HomeProducts from "@/components/Products/HomeProducts";

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
  /** When set (home page), renders Featured Products under the welcome block */
  homeFeaturedProducts?: {
    companyId: string;
    storeId: string;
    storeCurrency: string;
    initialProducts: any[];
  };
  /** Desktop featured grid limit (mobile uses separate block on page). */
  homeFeaturedProductLimit?: number;
}

const Hero = async ({
  content,
  storeData,
  products,
  hideOnPage,
  homeFeaturedProducts,
  homeFeaturedProductLimit = 8,
}: HeroProps) => {
  const storeName =  "Krallaser";

  const featuredProduct = Array.isArray(products) && products.length > 0 ? products[0] : null;
  const productImages = (() => {
    const imgs = featuredProduct?.product_images ?? [];
    if (imgs.length === 0) return [];
    const featured = imgs.find((img: any) => img?.position === "featured");
    const rest = imgs.filter((img: any) => img?.position !== "featured");
    return featured ? [featured, ...rest] : imgs;
  })();

  const infoCards = [
    {
      title: "Laser Lens & Nozzle Maintenance",
      description: "Keep your cutter performing at peak",
      content: [
        {
          heading: "Why it matters",
          body: "A dirty lens, worn nozzle, or low assist gas can reduce beam quality, cause burrs, overheating, and inconsistent cuts — even on a new machine.",
        },
        {
          heading: "How often to check",
          body: "Inspect protective windows, focus lens, and nozzle daily in production, or every few days in lighter use. Replace consumables at the first sign of burn marks or spatter buildup.",
        },
        {
          heading: "Basic maintenance steps",
          body: "Clean lenses with proper wipes and fluid only, check nozzle alignment and diameter, verify gas pressure and flow, keep the bed and head free of debris, and stock spare lenses and nozzles from Krallaser.",
        },
      ],
    },
    {
      title: "Why is my laser cut quality poor?",
      description: "Expert troubleshooting guide",
      content: [
        {
          heading: "Power, speed & focus",
          body: "Cuts look rough when power is too low, speed too high, or focus is off. Match parameters to material thickness and recheck focal height after nozzle changes.",
        },
        {
          heading: "Gas & nozzle setup",
          body: "Wrong assist gas, low pressure, or a blocked nozzle causes dross, oxidation, and flare. Use the correct gas for your material and replace nozzles when the orifice is worn.",
        },
        {
          heading: "Optics & alignment",
          body: "Replace scratched protective windows, clean the focus lens carefully, confirm beam alignment, and clamp sheet metal flat. Order matched parts at krallaser.com/parts if quality does not improve.",
        },
      ],
    },
  ];

  return (
    <section className="relative w-full bg-gradient-to-b from-slate-50 via-white to-slate-50/80 overflow-hidden">
      <div className="page-container py-16 lg:py-24">
        {/* Auto-moving hero image carousel */}
        <div className="mb-12 max-w-5xl mx-auto">
          <HeroImageCarousel />
        </div>
        {/* Welcome hero */}
        <div className="text-center max-w-3xl mx-auto mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 tracking-tight mb-4">
            Laser Cutting Machines &amp; Parts in Pakistan
          </h1>
          <p className="text-base sm:text-lg text-slate-600 mb-6 max-w-2xl mx-auto">
            {storeName} — metal fiber laser cutters, spare parts, and expert support from Lahore.
          </p>
          {!hideOnPage && (
            <Link href="/machine">
              <Button
                size="lg"
                className="group px-8 py-6 text-base font-semibold text-white gradient-blue-grey-combined hover:opacity-95 transition-opacity shadow-lg shadow-[#0368E5]/20"
              >
                Learn More
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </Link>
          )}
        </div>

        {/* Featured Products — directly under welcome, before the rest of the page */}
        {homeFeaturedProducts && (
          <div className="mt-12 lg:mt-14 hidden md:block w-full px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
            <Suspense fallback={null}>
              <HomeProducts
                companyId={homeFeaturedProducts.companyId}
                storeId={homeFeaturedProducts.storeId}
                storeCurrency={homeFeaturedProducts.storeCurrency}
                initialProducts={homeFeaturedProducts.initialProducts}
                className="w-full"
                productLimit={homeFeaturedProductLimit}
              />
            </Suspense>
          </div>
        )}

        {/* Featured product ellipse card */}
        {featuredProduct && featuredProduct.id !== "no-product" && (
          <div className="flex justify-center mb-12">
            <Link
              href={`/product/${encodeURIComponent(featuredProduct.sku || featuredProduct.slug || featuredProduct.id)}`}
              className="group"
            >
              <div className="relative flex items-center gap-6 sm:gap-8 px-5 sm:px-8 py-4 sm:py-5 rounded-full bg-white/95 shadow-xl border border-[var(--primary-color)]/10 backdrop-blur-md max-w-3xl group-hover:border-[var(--secondary-color)]/20 transition-colors">
                {/* Product images carousel */}
                <div className="relative shrink-0 w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden bg-slate-100 border border-slate-200 transition-transform duration-300 group-hover:scale-105">
                  <FeaturedProductImageCarousel
                    images={productImages}
                    alt={featuredProduct.name || "Laser cutting product"}
                    className="w-full h-full"
                    itemCode={featuredProduct.sku || featuredProduct.id}
                    imageUrl={featuredProduct.image_url}
                  />
                </div>

                {/* Content */}
                <div className="flex-1 text-left">
                  <p className="text-xs font-semibold tracking-wide uppercase text-[var(--primary-color)] mb-1">
                    Featured Product
                  </p>
                  <h2 className="text-lg sm:text-xl font-semibold text-slate-900 line-clamp-1">
                    {featuredProduct.name}
                  </h2>
                  {featuredProduct.short_description && (
                    <p className="mt-1 text-xs sm:text-sm text-slate-600 line-clamp-2">
                      {featuredProduct.short_description}
                    </p>
                  )}
                </div>

                {/* CTA */}
                <div className="hidden sm:flex flex-col items-end justify-center">
                  <span className="text-[11px] font-medium text-slate-500 mb-1">
                    Explore details
                  </span>
                  <div className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--primary-color)] group-hover:text-[var(--secondary-color)] transition-colors">
                    View Product
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Info cards — laser maintenance & troubleshooting */}
        <HeroInfoCards cards={infoCards} />
      </div>
    </section>
  );
};

export default Hero;
