"use client";

import React, { useEffect, useState, useRef } from "react";
import PriceRangeFilter from "../../common/PriceRangeFilter";
import Categories from "../Categories";
import Products from "@/components/Products";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
    Grid3X3, 
    List, 
    Filter, 
    SortAsc,
    ChevronRight,
    Home
} from "lucide-react";
import Link from "next/link";

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

type SortOption = 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc' | 'newest';

const CategoriesContent = ({
    catProducts,
    catName,
    catSubCats,
    currentStock = [],
    storeCurrency,
    necessary,
}: CategoriesContentProps) => {

    const [priceRange, setPriceRange] = useState<[number, number]>([0, 0]);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [sortBy, setSortBy] = useState<SortOption>('newest');
    const [showFilters, setShowFilters] = useState(false);
    const userChangedPrice = useRef(false);

    // Initialize price range from catProducts
    useEffect(() => {
        if (catProducts && catProducts.length > 0 && !userChangedPrice.current) {
            const prices = catProducts.flatMap((product: any) => {
                const prices: number[] = [];
                // Get price from main product
                if (product.sale_price) prices.push(product.sale_price);
                if (product.base_price) prices.push(product.base_price);
                // Get prices from variations if they exist
                if (product.product_variations) {
                    product.product_variations.forEach((variation: any) => {
                        if (variation.sale_price) prices.push(variation.sale_price);
                        if (variation.base_price) prices.push(variation.base_price);
                    });
                }
                return prices;
            }).filter((price: number) => price > 0);
            
            const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
            setPriceRange([0, maxPrice]);
        }
    }, [catProducts]);

    const handlePriceRangeChange = (newRange: [number, number]) => {
        userChangedPrice.current = true;
        setPriceRange(newRange);
    };

    const sortProducts = (products: any[], sortOption: SortOption) => {
        if (!products || products.length === 0) return products;
        
        const sortedProducts = [...products];
        
        switch (sortOption) {
            case 'name-asc':
                return sortedProducts.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
            case 'name-desc':
                return sortedProducts.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
            case 'price-asc':
                return sortedProducts.sort((a, b) => {
                    const priceA = a.sale_price || a.base_price || 0;
                    const priceB = b.sale_price || b.base_price || 0;
                    return priceA - priceB;
                });
            case 'price-desc':
                return sortedProducts.sort((a, b) => {
                    const priceA = a.sale_price || a.base_price || 0;
                    const priceB = b.sale_price || b.base_price || 0;
                    return priceB - priceA;
                });
            case 'newest':
                return sortedProducts.sort((a, b) => {
                    const dateA = a.created_at || a.creation || 0;
                    const dateB = b.created_at || b.creation || 0;
                    return new Date(dateB).getTime() - new Date(dateA).getTime();
                });
            default:
                return sortedProducts;
        }
    };

    // Filter products by price range
    const filterByPriceRange = (products: any[]) => {
        if (!products || products.length === 0) return products;
        if (priceRange[0] === 0 && priceRange[1] === 0) return products;
        
        return products.filter((product: any) => {
            const productPrice = product.sale_price || product.base_price || 0;
            // For variable products, check if any variation is in range
            if (product.product_variations && product.product_variations.length > 0) {
                return product.product_variations.some((variation: any) => {
                    const variationPrice = variation.sale_price || variation.base_price || 0;
                    return variationPrice >= priceRange[0] && variationPrice <= priceRange[1];
                });
            }
            return productPrice >= priceRange[0] && productPrice <= priceRange[1];
        });
    };

    // Use catProducts directly (already fetched on server)
    const filteredProducts = filterByPriceRange(catProducts || []);
    const sortedProducts = sortProducts(filteredProducts, sortBy);
    const hasProducts = sortedProducts.length > 0;
    const hasSubCategories = catSubCats && catSubCats.length > 0;
    const showPriceFilter = !hasSubCategories && hasProducts;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
            {/* Breadcrumb Navigation */}
            <nav className="mb-6">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Link href="/" className="flex items-center hover:text-primary transition-colors">
                        <Home className="h-4 w-4 mr-1" />
                        Home
                    </Link>
                    <ChevronRight className="h-4 w-4" />
                    <Link href="/category" className="hover:text-primary transition-colors">
                        Categories
                    </Link>
                    <ChevronRight className="h-4 w-4" />
                    <span className="text-gray-900 font-medium">{catName}</span>
                </div>
            </nav>

            {/* Page Header */}
            <div className="mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">{catName}</h1>
                        <p className="text-gray-600">
                            {hasSubCategories 
                                ? `${catSubCats.length} sub-categories available`
                                : `${sortedProducts.length} products found`
                            }
                        </p>
                    </div>
                    
                    {/* View Toggle and Sort Controls */}
                    {!hasSubCategories && hasProducts && (
                        <div className="flex items-center gap-3">
                            <div className="flex items-center bg-white rounded-lg border p-1">
                                <Button
                                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                                    size="sm"
                                    onClick={() => setViewMode('grid')}
                                    className="h-8 w-8 p-0"
                                >
                                    <Grid3X3 className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                                    size="sm"
                                    onClick={() => setViewMode('list')}
                                    className="h-8 w-8 p-0"
                                >
                                    <List className="h-4 w-4" />
                                </Button>
                            </div>
                            
                            <div className="relative">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                                    className="appearance-none bg-white border rounded-lg px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                >
                                    <option value="newest">Newest First</option>
                                    <option value="name-asc">Name A-Z</option>
                                    <option value="name-desc">Name Z-A</option>
                                    <option value="price-asc">Price Low to High</option>
                                    <option value="price-desc">Price High to Low</option>
                                </select>
                                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                    <SortAsc className="h-4 w-4 text-gray-400" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Left Sidebar - Filters */}
                <div className="lg:col-span-1">
                    {showPriceFilter && (
                        <Card className="sticky top-4">
                            <CardHeader className="pb-4">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Filter className="h-5 w-5" />
                                    Filters
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <PriceRangeFilter 
                                    priceRange={priceRange} 
                                    onPriceRangeChange={handlePriceRangeChange}
                                    currency={storeCurrency}
                                />
                                
                                {/* Active Filters Display */}
                                {userChangedPrice.current && (
                                    <div className="space-y-3">
                                        <Separator />
                                        <div className="space-y-2">
                                            <h4 className="text-sm font-medium text-gray-700">Active Filters</h4>
                                            <div className="flex flex-wrap gap-2">
                                                <Badge variant="secondary" className="flex items-center gap-1">
                                                    Price: {storeCurrency}{priceRange[0]} - {storeCurrency}{priceRange[1]}
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-4 w-4 p-0 ml-1 hover:bg-gray-200"
                                                        onClick={() => {
                                                            setPriceRange([0, Math.max(...catProducts.flatMap(({ sale_price, base_price }: any) => [
                                                                sale_price || 0,
                                                                base_price || 0,
                                                            ]))]);
                                                            userChangedPrice.current = false;
                                                        }}
                                                    >
                                                        ×
                                                    </Button>
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Right Content Area */}
                <div className="lg:col-span-3">
                    {hasSubCategories ? (
                        <Categories subcat={true} categories={catSubCats} hideOnPage={true} />
                    ) : hasProducts ? (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-semibold text-gray-900">Products</h2>
                                <Badge variant="outline" className="text-sm">
                                    {sortedProducts.length} {sortedProducts.length === 1 ? 'product' : 'products'}
                                </Badge>
                            </div>
                            
                            <Products
                                products={sortedProducts}
                                currentStock={currentStock}
                                hideOnPage={true}
                                storeCurrency={storeCurrency}
                                necessary={necessary}
                                viewMode={viewMode}
                            />
                        </div>
                    ) : (
                        <Card className="text-center py-16">
                            <CardContent>
                                <div className="text-gray-400 mb-4">
                                    <Filter className="h-16 w-16 mx-auto" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
                                <p className="text-gray-600 mb-4">
                                    {catProducts && catProducts.length > 0
                                        ? "No products match your current filters. Try adjusting your price range."
                                        : "This category doesn't have any products yet. Check back later for new products."}
                                </p>
                                {catProducts && catProducts.length > 0 && (
                                    <Button 
                                        variant="outline"
                                        onClick={() => {
                                            const prices = catProducts.flatMap((product: any) => {
                                                const prices: number[] = [];
                                                if (product.sale_price) prices.push(product.sale_price);
                                                if (product.base_price) prices.push(product.base_price);
                                                if (product.product_variations) {
                                                    product.product_variations.forEach((variation: any) => {
                                                        if (variation.sale_price) prices.push(variation.sale_price);
                                                        if (variation.base_price) prices.push(variation.base_price);
                                                    });
                                                }
                                                return prices;
                                            }).filter((price: number) => price > 0);
                                            const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
                                            setPriceRange([0, maxPrice]);
                                            userChangedPrice.current = false;
                                        }}
                                    >
                                        Clear Filters
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CategoriesContent;
