"use client";

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import Categories from "../Categories";
import ProductImagePreview from "@/components/ProductImagePreview";
import { useBatchItemImages } from "@/hooks/useBatchItemImages";
import { SortAsc, Wrench, Shield, Package, Search } from "lucide-react";
import Link from "next/link";
import { isOnSaleProduct, sortSaleItemsFirst } from "@/lib/promotionUtils";
import { SaleListingBanner } from "@/components/Products/PromotionBadge";

interface NecessaryProps {
  storeId: string;
  companyId: string;
}

interface CategoriesContentProps {
  catProducts: any;
  catName: string;
  catSubCats: any;
  currentStock?: any[];
  storeCurrency: string;
  necessary: NecessaryProps;
}

type SortOption = "name-asc" | "name-desc" | "price-asc" | "price-desc" | "newest";

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const CategoriesContent = ({
  catProducts,
  catName,
  catSubCats,
  storeCurrency,
  necessary,
}: CategoriesContentProps) => {
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [listSearch, setListSearch] = useState("");

  const safeCatProducts = Array.isArray(catProducts) ? catProducts : [];

  const searchNorm = listSearch.trim().toLowerCase();
  const productsAfterSearch = useMemo(() => {
    if (!searchNorm) return safeCatProducts;
    return safeCatProducts.filter((p: any) => {
      const raw = [p.name, p.sku, p.short_description, p.detailed_desc]
        .filter((x: unknown) => typeof x === "string")
        .join(" ");
      return raw.replace(/<[^>]*>/g, " ").toLowerCase().includes(searchNorm);
    });
  }, [safeCatProducts, searchNorm]);

  const sortProducts = (products: any[], sortOption: SortOption) => {
    if (!products || products.length === 0) return products;
    const sorted = [...products];
    switch (sortOption) {
      case "name-asc":
        return sorted.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
      case "name-desc":
        return sorted.sort((a, b) => (b.name || "").localeCompare(a.name || ""));
      case "price-asc":
        return sorted.sort((a, b) => {
          const pa = a.sale_price || a.base_price || 0;
          const pb = b.sale_price || b.base_price || 0;
          return pa - pb;
        });
      case "price-desc":
        return sorted.sort((a, b) => {
          const pa = a.sale_price || a.base_price || 0;
          const pb = b.sale_price || b.base_price || 0;
          return pb - pa;
        });
      case "newest":
      default:
        return sorted.sort((a, b) => {
          const da = a.created_at || a.creation || 0;
          const db = b.created_at || b.creation || 0;
          return new Date(db).getTime() - new Date(da).getTime();
        });
    }
  };

  const sortedProducts = useMemo(
    () => sortSaleItemsFirst(sortProducts(productsAfterSearch, sortBy)),
    [productsAfterSearch, sortBy]
  );
  const saleItemsCount = useMemo(
    () => sortedProducts.filter((p) => isOnSaleProduct(p)).length,
    [sortedProducts]
  );
  const hasProducts = safeCatProducts.length > 0;
  const hasSubCategories = Array.isArray(catSubCats) && catSubCats.length > 0;

  const itemNamesKey =
    (sortedProducts ?? []).map((p: any) => p.sku).filter(Boolean).join(",") || "";
  const itemNames = useMemo(
    () => (sortedProducts ?? []).map((p: any) => p.sku).filter(Boolean) || [],
    [itemNamesKey]
  );
  const needsBatchImages =
    hasProducts &&
    !hasSubCategories &&
    sortedProducts.some((p: any) => !p.image_url);
  const { isLoading: isImageLoading, getImageUrl, hasImage } = useBatchItemImages({
    itemNames,
    enabled: hasProducts && !hasSubCategories && sortedProducts.length > 0 && needsBatchImages,
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <motion.nav
        className="mb-6"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <p className="text-sm text-slate-500">
          <Link href="/" className="text-slate-600 hover:text-slate-900 transition-colors">
            Home
          </Link>
          <span className="mx-1.5 text-slate-400">/</span>
          <Link href="/category" className="text-slate-600 hover:text-slate-900 transition-colors">
            Categories
          </Link>
          <span className="mx-1.5 text-slate-400">/</span>
          <span className="text-slate-900 font-medium">{catName || "Category"}</span>
        </p>
      </motion.nav>

      {/* Title */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
      >
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
          {catName || "Category"}
          <span className="text-slate-500 font-normal text-xl md:text-2xl ml-2">
            {hasSubCategories ? "— Sub-categories" : `— ${sortedProducts.length} product${sortedProducts.length !== 1 ? "s" : ""}`}
          </span>
        </h1>
        <div className="h-px bg-gradient-to-r from-[var(--secondary-color)]/30 via-[var(--primary-color)]/20 to-transparent mt-4 max-w-2xl" />
      </motion.div>

      {/* Intro */}
      <motion.p
        className="text-slate-600 leading-relaxed max-w-2xl mb-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        {hasSubCategories ? (
          <>Browse sub-categories below to find products in <strong className="text-slate-800">{catName}</strong>.</>
        ) : (
          <>Precision tools and accessories for milling, engraving, and machining—matched for quality and reliability.</>
        )}
      </motion.p>

      {/* Main content — full width */}
      <div className="w-full">
        {hasSubCategories ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <Categories subcat={true} categories={catSubCats} hideOnPage={true} />
          </motion.div>
        ) : hasProducts ? (
          <>
            {/* Sort bar */}
            <motion.div
              className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between mb-8 pb-4 border-b border-slate-200/80"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.1 }}
            >
              <div className="relative w-full sm:max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" aria-hidden />
                <input
                  type="search"
                  value={listSearch}
                  onChange={(e) => setListSearch(e.target.value)}
                  placeholder="Search in this category…"
                  className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-200"
                  aria-label="Search products in category"
                />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-4 w-full sm:w-auto">
              <span className="text-sm text-slate-500 tabular-nums">
                {sortedProducts.length} {sortedProducts.length === 1 ? "product" : "products"}
              </span>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="appearance-none bg-slate-50/80 border border-slate-200 rounded-lg pl-3 pr-9 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-300 transition-shadow"
                >
                  <option value="newest">Newest first</option>
                  <option value="name-asc">Name A–Z</option>
                  <option value="name-desc">Name Z–A</option>
                  <option value="price-asc">Price: Low to high</option>
                  <option value="price-desc">Price: High to low</option>
                </select>
                <SortAsc className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>
              </div>
            </motion.div>

            <SaleListingBanner count={saleItemsCount} />

            {/* Product grid with stagger animation */}
            {sortedProducts.length === 0 ? (
              <p className="text-slate-500 py-10 text-center text-sm">
                No products match your search. Try different keywords.
              </p>
            ) : (
            <motion.div
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-5 sm:gap-6 mb-20"
              variants={container}
              initial="hidden"
              animate="visible"
            >
              {sortedProducts.map((product: any) => {
                const imageUrl =
                  product.image_url ||
                  (needsBatchImages ? getImageUrl(product.sku) : "/placeholder.svg");
                const productHasImage =
                  !!product.image_url ||
                  (needsBatchImages && hasImage(product.sku));
                const productCode = product.sku || product.id || product.name;
                return (
                  <motion.div key={product.id || product.sku} variants={item}>
                    <Link
                      href={`/product/${encodeURIComponent(productCode)}`}
                      className="group block"
                    >
                      <div className="bg-slate-50/80 rounded-xl overflow-hidden border border-slate-200/80 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300 aspect-[260/185] flex items-center justify-center p-4">
                        <ProductImagePreview
                          itemName={product.name}
                          productName={product.name}
                          imageUrl={imageUrl}
                          hasImage={productHasImage}
                          isLoading={needsBatchImages ? isImageLoading : false}
                          width={260}
                          height={185}
                          className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                          showPreview={false}
                        />
                      </div>
                      <h3 className="mt-3 text-sm font-medium text-slate-800 group-hover:text-slate-900 transition-colors line-clamp-2 text-center leading-snug">
                        {product.name}
                      </h3>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
            )}

            {/* Trust / info section */}
            <motion.section
              className="bg-slate-50/60 rounded-2xl p-8 md:p-10 border border-slate-100"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Wrench className="h-5 w-5 text-slate-600" />
                Matched accessories
              </h2>
              <p className="text-slate-600 leading-relaxed mb-4 max-w-2xl">
                Parts and tools in this category are matched for performance and durability, with high-quality materials for long-term reliability.
              </p>
              <div className="flex items-start gap-2 text-slate-600">
                <Shield className="h-5 w-5 text-slate-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm leading-relaxed">
                  From milling cutters to clamping tools and accessories—everything you need to complement your machines.
                </p>
              </div>
            </motion.section>
          </>
        ) : (
          <motion.div
            className="text-center py-20 bg-slate-50/60 rounded-2xl border border-slate-100"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <Package className="h-14 w-14 mx-auto text-slate-300 mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No products in this category</h3>
            <p className="text-slate-600 max-w-md mx-auto">
              This category is empty. Check back later or browse other categories.
            </p>
            <Link
              href="/category"
              className="inline-block mt-6 text-sm font-medium text-slate-700 hover:text-slate-900 underline underline-offset-2 transition-colors"
            >
              View all categories
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CategoriesContent;
