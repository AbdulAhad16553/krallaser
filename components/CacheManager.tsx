"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, RefreshCw, Database, Clock } from 'lucide-react';
import { cacheUtils } from '@/lib/clientCache';

interface CacheStats {
  products: {
    size: number;
    expiredCount?: number;
    validCount?: number;
    maxSize?: number;
    error?: string;
  };
  images: {
    size: number;
    expiredCount?: number;
    validCount?: number;
    maxSize?: number;
    error?: string;
  };
  categories: {
    size: number;
    expiredCount?: number;
    validCount?: number;
    maxSize?: number;
    error?: string;
  };
}

const CacheManager: React.FC = () => {
  const [stats, setStats] = useState<CacheStats | null>(null);
  const [isClearing, setIsClearing] = useState(false);
  const [lastCleared, setLastCleared] = useState<Date | null>(null);

  const updateStats = () => {
    const cacheStats = cacheUtils.getStats();
    setStats(cacheStats);
  };

  const clearAllCache = async () => {
    setIsClearing(true);
    try {
      cacheUtils.clearAll();
      setLastCleared(new Date());
      updateStats();
    } catch (error) {
      console.error('Failed to clear cache:', error);
    } finally {
      setIsClearing(false);
    }
  };

  const cleanupExpired = async () => {
    try {
      cacheUtils.cleanupAll();
      updateStats();
    } catch (error) {
      console.error('Failed to cleanup cache:', error);
    }
  };

  useEffect(() => {
    updateStats();
  }, []);

  if (!stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Cache Manager
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">Loading cache statistics...</p>
        </CardContent>
      </Card>
    );
  }

  const totalItems = stats.products.size + stats.images.size + stats.categories.size;
  const totalValid = (stats.products.validCount || 0) + (stats.images.validCount || 0) + (stats.categories.validCount || 0);
  const totalExpired = (stats.products.expiredCount || 0) + (stats.images.expiredCount || 0) + (stats.categories.expiredCount || 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Cache Manager
        </CardTitle>
        <p className="text-sm text-gray-600">
          Manage client-side cache to improve performance
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Cache Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Products</span>
              <Badge variant="outline">{stats.products.size}</Badge>
            </div>
            <div className="text-xs text-gray-600">
              {stats.products.validCount || 0} valid, {stats.products.expiredCount || 0} expired
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Images</span>
              <Badge variant="outline">{stats.images.size}</Badge>
            </div>
            <div className="text-xs text-gray-600">
              {stats.images.validCount || 0} valid, {stats.images.expiredCount || 0} expired
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Categories</span>
              <Badge variant="outline">{stats.categories.size}</Badge>
            </div>
            <div className="text-xs text-gray-600">
              {stats.categories.validCount || 0} valid, {stats.categories.expiredCount || 0} expired
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Total Cache</span>
            <Badge variant="secondary">{totalItems} items</Badge>
          </div>
          <div className="text-xs text-gray-600">
            {totalValid} valid items, {totalExpired} expired items
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={cleanupExpired}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Cleanup Expired
          </Button>
          
          <Button
            onClick={clearAllCache}
            variant="destructive"
            size="sm"
            className="flex-1"
            disabled={isClearing}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {isClearing ? 'Clearing...' : 'Clear All Cache'}
          </Button>
        </div>

        {/* Last Cleared */}
        {lastCleared && (
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Clock className="h-3 w-3" />
            Last cleared: {lastCleared.toLocaleTimeString()}
          </div>
        )}

        {/* Cache Info */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>• Products cache: 30 minutes TTL</p>
          <p>• Images cache: 1 hour TTL</p>
          <p>• Categories cache: 1 hour TTL</p>
          <p>• Cache persists across page navigations</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CacheManager;
