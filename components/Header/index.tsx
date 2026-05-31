"use client";

import React, { useState, useEffect, useRef, useCallback, Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  Mail,
  Phone,
  Heart,
  Bell,
} from "lucide-react";
import { OPEN_MOBILE_CATEGORY_DRAWER } from "@/lib/mobileCategoryDrawerEvent";
import Cart from "@/components/Cart";
import HeaderMobileSearch from "@/components/Header/HeaderMobileSearch";
import HeaderDesktopSearch from "@/components/Header/HeaderDesktopSearch";
import MobileCategoryDrawer from "@/components/Header/MobileCategoryDrawer";
import { getAllCategories } from "@/hooks/getCategories";
interface StoreData {
  store_name?: string;
  store_detail?: {
    tagline?: string;
    header_logo_id?: string;
    primary_color?: string;
    currency?: string;
  };
  id?: string;
  company_id?: string;
  company_logo?: string;
  store_contact_detail?: {
    phone?: string;
    email?: string;
  };
}

const navLinkClass = (pathname: string, href: string, matchPrefix = false) => {
  const active =
    pathname === href ||
    (matchPrefix && href !== "/" && pathname.startsWith(href));
  return active ? "header-nav-link header-nav-link-active" : "header-nav-link";
};

const Header = ({ storeData }: { storeData: StoreData }) => {
  const pathname = usePathname() ?? "/";
  const [categoryDrawerOpen, setCategoryDrawerOpen] = useState(false);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [categories, setCategories] = useState<
    Array<{ id: string; name: string; slug: string; parent_id?: string }>
  >([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

  const categoryMenuRef = useRef<HTMLDivElement>(null);
  const categoryButtonRef = useRef<HTMLAnchorElement>(null);
  const categoryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Extract store data
  const storeName = storeData?.store_name || "Your Store";
  const tagline = storeData?.store_detail?.tagline;
  const headerLogoId = storeData?.store_detail?.header_logo_id;
  const companyLogo = storeData?.company_logo;
  const primaryColor = storeData?.store_detail?.primary_color || "#0368E5";
  const storeId = storeData?.id;
  const companyId = storeData?.company_id;
  const storeCurrency = storeData?.store_detail?.currency || "Rs.";
  // Contact fallbacks
  const topBarPhone = "0322 4414443";
  const topBarEmail = "krallaser@gmail.com";

  const fetchCategories = useCallback(async () => {
    if (!storeId) return;

    setIsLoadingCategories(true);
    try {
      const { categories: fetchedCategories } = await getAllCategories(storeId);
      setCategories(fetchedCategories || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories([]);
    } finally {
      setIsLoadingCategories(false);
    }
  }, [storeId]);

  // Fetch categories when component mounts
  useEffect(() => {
    if (storeId) {
      fetchCategories();
    }
  }, [storeId, fetchCategories]);

  // Improved hover behavior for categories dropdown
  const handleCategoryMouseEnter = () => {
    if (categoryTimeoutRef.current) {
      clearTimeout(categoryTimeoutRef.current);
    }
    setIsCategoryMenuOpen(true);
  };

  const handleCategoryMouseLeave = () => {
    categoryTimeoutRef.current = setTimeout(() => {
      setIsCategoryMenuOpen(false);
    }, 150); // 150ms delay before closing
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        categoryMenuRef.current &&
        !categoryMenuRef.current.contains(event.target as Node) &&
        categoryButtonRef.current &&
        !categoryButtonRef.current.contains(event.target as Node)
      ) {
        setIsCategoryMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (categoryTimeoutRef.current) {
        clearTimeout(categoryTimeoutRef.current);
      }
    };
  }, []);

  // Bottom nav "Categories" tab opens the same drawer as the old header button
  useEffect(() => {
    const onOpenDrawer = () => setCategoryDrawerOpen(true);
    window.addEventListener(OPEN_MOBILE_CATEGORY_DRAWER, onOpenDrawer);
    return () => window.removeEventListener(OPEN_MOBILE_CATEGORY_DRAWER, onOpenDrawer);
  }, []);

  return (
    <>
      {/* Top Bar - grey background, white text (extra compact height on mobile) */}
      <div className="bg-gray-600 text-white py-1 sm:py-2 text-[10px] sm:text-sm leading-tight">
        <div className="page-container flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0 sm:gap-x-6 sm:gap-y-0.5">
            <a href={`tel:${topBarPhone}`} className="hover:text-white transition-colors flex items-center gap-1 sm:gap-2">
              <Phone className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 shrink-0" />
              <span>{topBarPhone}</span>
            </a>
            <a href={`mailto:${topBarEmail}`} className="hover:text-white transition-colors flex items-center gap-1 sm:gap-2 min-w-0">
              <Mail className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 shrink-0" />
              <span className="truncate">{topBarEmail}</span>
            </a>
          </div>
          <div className="flex flex-wrap items-center gap-x-2.5 sm:gap-x-6 gap-y-0 text-[10px] sm:text-sm">
            <span className="hidden sm:inline">Free shipping on orders over Rs. 10,000</span>
            <span className="sm:hidden text-white/90">Free ship Rs. 10k+</span>
            <Link href="/contact" className="hover:text-white transition-colors font-medium">
              Contact Us
            </Link>
          </div>
        </div>
      </div>

      {/* Main Header — mobile: white AliExpress-style row (logo · bell) + pill search; desktop: gradient */}
      <header className="site-header-navbar sticky top-0 z-50 border-b border-neutral-200 max-md:bg-white pt-[env(safe-area-inset-top,0px)] shadow-sm md:border-white/20 md:text-white md:shadow-sm">
        <div className="page-container py-3 md:py-4">
          {/* Mobile: row 1 logo | categories | bell — row 2 full-width search */}
          <div className="flex flex-col gap-3 md:hidden">
            <div className="flex items-center justify-between gap-3">
              <Link href="/" className="group min-w-0 shrink-0">
                <Image
                  src="/krallogo.svg"
                  alt={`${storeName || "Store"} Logo`}
                  width={180}
                  height={56}
                  className="h-9 w-auto max-w-[11rem] object-contain object-left opacity-100"
                  priority
                />
              </Link>
              <Link
                href="/orders"
                className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-neutral-900 active:bg-neutral-100"
                aria-label="Orders and notifications"
              >
                <Bell className="h-6 w-6" strokeWidth={1.75} aria-hidden />
              </Link>
            </div>
            <Suspense
              fallback={
                <div
                  className="md:hidden h-12 w-full min-w-0 rounded-full border border-neutral-900 bg-white/80"
                  aria-hidden
                />
              }
            >
              <HeaderMobileSearch />
            </Suspense>
          </div>

          {/* Desktop */}
          <div className="hidden md:flex md:flex-row md:items-center md:justify-between md:gap-6">
            <div className="flex shrink-0 items-center gap-4">
              <Link href="/" className="group min-w-0">
                <Image
                  src="/krallogo.svg"
                  alt={`${storeName || "Store"} Logo`}
                  width={180}
                  height={56}
                  className="max-h-9 w-auto max-w-[11rem] object-contain opacity-100"
                  priority
                />
              </Link>
            </div>

            <nav className="flex min-w-0 flex-1 items-center justify-center gap-4 lg:gap-8 overflow-x-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
              <Link
                href="/"
                className={`flex-shrink-0 ${navLinkClass(pathname, "/")}`}
              >
                Home
              </Link>
              <div className="relative group flex-shrink-0">
                <Link
                  ref={categoryButtonRef}
                  href="/category"
                  className={`flex items-center space-x-1 ${navLinkClass(pathname, "/category", true)}`}
                  onMouseEnter={handleCategoryMouseEnter}
                  onMouseLeave={handleCategoryMouseLeave}
                >
                  <span>Categories</span>
                </Link>
                {isCategoryMenuOpen && (
                  <div
                    ref={categoryMenuRef}
                    className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-soft-lg border border-slate-200 py-2 z-50"
                    onMouseEnter={handleCategoryMouseEnter}
                    onMouseLeave={handleCategoryMouseLeave}
                  >
                    <div className="px-4 py-2">
                      <Link
                        href="/category"
                        className="block py-2 px-3 rounded-md hover:bg-slate-50 transition-colors font-medium text-slate-700"
                      >
                        All Categories
                      </Link>
                      <Link
                        href="/machine"
                        className="block py-2 px-3 rounded-md hover:bg-slate-50 transition-colors font-medium text-slate-700"
                      >
                        Machines
                      </Link>
                      {categories.length > 0 && (
                        <>
                          <div className="border-t border-slate-200 my-2"></div>
                          {categories.map((category) => (
                            <Link
                              key={category.id}
                              href={`/category/${category.slug}`}
                              className="block py-2 px-3 rounded-md hover:bg-slate-50 transition-colors text-slate-700"
                              onClick={() => setIsCategoryMenuOpen(false)}
                            >
                              {category.name}
                            </Link>
                          ))}
                        </>
                      )}
                      {isLoadingCategories && (
                        <div className="px-3 py-2 text-sm text-slate-500">
                          Loading categories...
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <Link
                href="/machine"
                className={`flex-shrink-0 ${navLinkClass(pathname, "/machine", true)}`}
              >
                Machines
              </Link>
              <Link
                href="/parts"
                className={`flex-shrink-0 ${navLinkClass(pathname, "/parts", true)}`}
              >
                Parts
              </Link>
              <Link
                href="/about-us"
                className={`flex-shrink-0 ${navLinkClass(pathname, "/about-us")}`}
              >
                About
              </Link>
              <Link
                href="/contact"
                className={`flex-shrink-0 ${navLinkClass(pathname, "/contact")}`}
              >
                Contact
              </Link>
            </nav>

            <div className="flex shrink-0 items-center gap-2 lg:gap-3">
              <Link
                href="/orders"
                className="relative rounded-md p-2 text-white transition-colors hover:bg-white/15 hover:text-white"
                aria-label="Orders and notifications"
              >
                <Bell className="h-6 w-6" />
              </Link>
              <Suspense
                fallback={
                  <div
                    className="header-search-bar hidden md:block h-9 w-full max-w-xs rounded-lg border"
                    aria-hidden
                  />
                }
              >
                <HeaderDesktopSearch />
              </Suspense>
              <Link
                href="/wishlist"
                className="relative rounded-md p-2 text-white transition-all duration-300 hover:bg-white/15 hover:text-red-200 hover:scale-110 active:scale-95 group"
              >
                <span className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 bg-red-400/20 blur-xl transition-opacity duration-300" />
                <Heart className="relative z-10 h-6 w-6 transition-all duration-300 group-hover:fill-red-200 group-hover:text-red-200" />
              </Link>
              <Cart variant="onGradient" />
            </div>
          </div>
        </div>
      </header>

      <MobileCategoryDrawer
        open={categoryDrawerOpen}
        onClose={() => setCategoryDrawerOpen(false)}
        categories={categories}
      />

    </>
  );
};

export default Header;
