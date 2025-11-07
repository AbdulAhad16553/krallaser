"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Grid3X3, List, Filter, SortAsc, SortDesc, RefreshCw } from "lucide-react";
import Products from "@/components/Products";
import Categories from "../Categories";
import { productService } from "@/lib/erpnext/services/productService";
import { useProducts, clearProductsCache, isProductsCacheValid } from "@/hooks/erpnext/getProducts";

interface ShopContentProps {
    storeCurrency: string;
    necessary: {
        storeId: string;
        companyId: string;
    };
}

const ShopContent = ({ storeCurrency, necessary }: ShopContentProps) => {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [sortBy, setSortBy] = useState('newest');
    const [searchTerm, setSearchTerm] = useState('');
    
    // Use the ERPNext products hook
    const { products, loading, error, refetch } = useProducts();

    const filteredProducts = products.filter(product =>
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.short_description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleRefresh = () => {
        clearProductsCache();
        refetch();
    };

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-3xl font-bold">Shop</h1>
                
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Input
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-64"
                        />
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRefresh}
                            disabled={loading}
                        >
                            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                        <Button
                            variant={viewMode === 'grid' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setViewMode('grid')}
                        >
                            <Grid3X3 className="h-4 w-4" />
                        </Button>
                        <Button
                            variant={viewMode === 'list' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setViewMode('list')}
                        >
                            <List className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="all">All Products</TabsTrigger>
                    <TabsTrigger value="featured">Featured</TabsTrigger>
                    <TabsTrigger value="new">New Arrivals</TabsTrigger>
                    <TabsTrigger value="sale">On Sale</TabsTrigger>
                </TabsList>
                
                <TabsContent value="all" className="space-y-6">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <p className="text-muted-foreground">
                                Showing {filteredProducts.length} products
                            </p>
                            {!loading && isProductsCacheValid() && (
                                <Badge variant="secondary" className="text-xs">
                                    Cached
                                </Badge>
                            )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <span className="text-sm">Sort by:</span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSortBy('newest')}
                            >
                                <SortDesc className="h-4 w-4 mr-1" />
                                Newest
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSortBy('price-low')}
                            >
                                <SortAsc className="h-4 w-4 mr-1" />
                                Price: Low to High
                            </Button>
                        </div>
                    </div>
                    
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {[...Array(8)].map((_, i) => (
                                <Card key={i} className="animate-pulse">
                                    <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                                    <CardContent className="p-4 space-y-2">
                                        <div className="h-4 bg-gray-200 rounded"></div>
                                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : error ? (
                        <div className="text-center py-12">
                            <h3 className="text-lg font-semibold mb-2 text-red-600">Error Loading Products</h3>
                            <p className="text-muted-foreground">{error}</p>
                        </div>
                    ) : (
                        <Products
                            products={filteredProducts}
                            storeCurrency={storeCurrency}
                            viewMode={viewMode}
                            hideOnPage={false}
                            necessary={necessary}
                        />
                    )}
                </TabsContent>
                
                <TabsContent value="featured">
                    <div className="text-center py-12">
                        <h3 className="text-lg font-semibold mb-2">Featured Products</h3>
                        <p className="text-muted-foreground">No featured products available at the moment.</p>
                    </div>
                </TabsContent>
                
                <TabsContent value="new">
                    <div className="text-center py-12">
                        <h3 className="text-lg font-semibold mb-2">New Arrivals</h3>
                        <p className="text-muted-foreground">No new products available at the moment.</p>
                    </div>
                </TabsContent>
                
                <TabsContent value="sale">
                    <div className="text-center py-12">
                        <h3 className="text-lg font-semibold mb-2">On Sale</h3>
                        <p className="text-muted-foreground">No products on sale at the moment.</p>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default ShopContent;