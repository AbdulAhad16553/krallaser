"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Grid3X3, List, Filter, RefreshCw, Settings } from "lucide-react";
import PaginatedProducts from "@/components/Products/PaginatedProducts";
import Categories from "../Categories";
import PerformanceDashboard from "@/components/PerformanceDashboard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface EnhancedShopContentProps {
  storeCurrency: string;
  necessary: {
    storeId: string;
    companyId: string;
  };
  categories?: any[];
  hideOnPage?: boolean;
}

const EnhancedShopContent: React.FC<EnhancedShopContentProps> = ({ 
  storeCurrency, 
  necessary, 
  categories = [],
  hideOnPage = false 
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [paginationMode, setPaginationMode] = useState<'pagination' | 'infinite' | 'load-more'>('pagination');
  const [pageSize, setPageSize] = useState(1000); // Load all products
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [priceRange, setPriceRange] = useState<{ min: number; max: number } | null>(null);
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);

  // Debounced search
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleRefresh = () => {
    window.location.reload();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setPriceRange(null);
    setSortBy('newest');
  };

  const activeFiltersCount = [
    debouncedSearchTerm,
    selectedCategory,
    priceRange,
    sortBy !== 'newest'
  ].filter(Boolean).length;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Shop</h1>
          <p className="text-gray-600 mt-1">Discover our curated collection of premium products</p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative">
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center border rounded-lg">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          {/* Settings */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Button>

          {/* Refresh */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Advanced Settings Panel */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Advanced Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Pagination Mode - Hidden, always infinite scroll */}
              <div className="hidden">
                <label className="text-sm font-medium mb-2 block">Pagination Mode</label>
                <div className="text-sm text-gray-600 bg-gray-100 p-2 rounded">
                  Infinite Scroll (Auto)
                </div>
              </div>

              {/* Page Size */}
              <div>
                <label className="text-sm font-medium mb-2 block">Items Per Page</label>
                <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6">6 items</SelectItem>
                    <SelectItem value="12">12 items</SelectItem>
                    <SelectItem value="24">24 items</SelectItem>
                    <SelectItem value="48">48 items</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sort By */}
              <div>
                <label className="text-sm font-medium mb-2 block">Sort By</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="name">Name A-Z</SelectItem>
                    <SelectItem value="name-desc">Name Z-A</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Category Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Category</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Price Range */}
            <div>
              <label className="text-sm font-medium mb-2 block">Price Range</label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="Min Price"
                  value={priceRange?.min || ''}
                  onChange={(e) => setPriceRange(prev => ({
                    ...prev,
                    min: parseFloat(e.target.value) || 0,
                    max: prev?.max || 0
                  }))}
                />
                <span className="text-gray-500">to</span>
                <Input
                  type="number"
                  placeholder="Max Price"
                  value={priceRange?.max || ''}
                  onChange={(e) => setPriceRange(prev => ({
                    ...prev,
                    max: parseFloat(e.target.value) || 0,
                    min: prev?.min || 0
                  }))}
                />
              </div>
            </div>

            {/* Clear Filters */}
            {activeFiltersCount > 0 && (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear All Filters
                </Button>
                <Badge variant="secondary">
                  {activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''} active
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Performance Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-blue-900">🚀 Performance Optimized</h3>
              <p className="text-sm text-blue-700">
                All products loaded at once with instant image loading for better performance
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-blue-600">
                Loading {pageSize} items per page
              </div>
              <div className="text-xs text-blue-500">
                Images load progressively for better performance
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Categories */}
              <div>
                <h4 className="font-medium mb-2">Categories</h4>
                <div className="space-y-2">
                  <Button
                    variant={selectedCategory === '' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setSelectedCategory('')}
                    className="w-full justify-start"
                  >
                    All Categories
                  </Button>
                  {categories.slice(0, 10).map((category) => (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setSelectedCategory(category.id)}
                      className="w-full justify-start"
                    >
                      {category.name}
                    </Button>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Quick Stats */}
              <div>
                <h4 className="font-medium mb-2">Quick Stats</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <div>• Progressive image loading</div>
                  <div>• Smart caching enabled</div>
                  <div>• Optimized for speed</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Products */}
        <div className="lg:col-span-3">
          <PaginatedProducts
            companyId={necessary.companyId}
            storeId={necessary.storeId}
            storeCurrency={storeCurrency}
            viewMode={viewMode}
            paginationMode={paginationMode}
            pageSize={pageSize}
            className="w-full"
          />
        </div>
      </div>

      {/* Performance Dashboard - Development Only */}
      {process.env.NODE_ENV === 'development' && (
        <PerformanceDashboard className="fixed bottom-4 right-4 z-50" />
      )}
    </div>
  );
};

export default EnhancedShopContent;
