"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  Image as ImageIcon, 
  Zap, 
  Database, 
  TrendingUp,
  RefreshCw
} from 'lucide-react';

interface PerformanceMetrics {
  totalImages: number;
  cachedImages: number;
  optimizedImages: number;
  loadTime: number;
  cacheHitRate: number;
  optimizationTime: number;
}

interface PerformanceMonitorProps {
  metrics: PerformanceMetrics;
  onRefresh?: () => void;
  className?: string;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  metrics,
  onRefresh,
  className = ""
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [previousMetrics, setPreviousMetrics] = useState<PerformanceMetrics | null>(null);

  useEffect(() => {
    setPreviousMetrics(metrics);
  }, [metrics]);

  const getPerformanceGrade = (loadTime: number) => {
    if (loadTime < 2000) return { grade: 'A+', color: 'text-green-600', bg: 'bg-green-100' };
    if (loadTime < 4000) return { grade: 'A', color: 'text-green-600', bg: 'bg-green-100' };
    if (loadTime < 6000) return { grade: 'B', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    if (loadTime < 8000) return { grade: 'C', color: 'text-orange-600', bg: 'bg-orange-100' };
    return { grade: 'D', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const performanceGrade = getPerformanceGrade(metrics.loadTime);
  const improvement = previousMetrics ? 
    ((previousMetrics.loadTime - metrics.loadTime) / previousMetrics.loadTime * 100) : 0;

  if (!isVisible && process.env.NODE_ENV === 'development') {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsVisible(true)}
          size="sm"
          variant="outline"
          className="bg-white shadow-lg"
        >
          <TrendingUp className="h-4 w-4 mr-2" />
          Performance
        </Button>
      </div>
    );
  }

  if (!isVisible) return null;

  return (
    <div className={`fixed bottom-4 right-4 z-50 w-80 ${className}`}>
      <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Zap className="h-4 w-4 text-blue-600" />
              Performance Monitor
            </CardTitle>
            <div className="flex gap-1">
              {onRefresh && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onRefresh}
                  className="h-6 w-6 p-0"
                >
                  <RefreshCw className="h-3 w-3" />
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsVisible(false)}
                className="h-6 w-6 p-0"
              >
                ×
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3">
          {/* Performance Grade */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Performance Grade</span>
            <Badge className={`${performanceGrade.bg} ${performanceGrade.color} border-0`}>
              {performanceGrade.grade}
            </Badge>
          </div>

          {/* Load Time */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-sm">Load Time</span>
            </div>
            <div className="text-right">
              <span className="text-sm font-medium">
                {(metrics.loadTime / 1000).toFixed(2)}s
              </span>
              {improvement > 0 && (
                <span className="text-xs text-green-600 ml-1">
                  ↓{improvement.toFixed(1)}%
                </span>
              )}
            </div>
          </div>

          {/* Image Statistics */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-gray-500" />
                <span className="text-sm">Total Images</span>
              </div>
              <span className="text-sm font-medium">{metrics.totalImages}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-green-500" />
                <span className="text-sm">Cached</span>
              </div>
              <span className="text-sm font-medium text-green-600">
                {metrics.cachedImages}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-blue-500" />
                <span className="text-sm">Optimized</span>
              </div>
              <span className="text-sm font-medium text-blue-600">
                {metrics.optimizedImages}
              </span>
            </div>
          </div>

          {/* Cache Hit Rate */}
          <div className="flex items-center justify-between">
            <span className="text-sm">Cache Hit Rate</span>
            <div className="flex items-center gap-2">
              <div className="w-16 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${metrics.cacheHitRate}%` }}
                />
              </div>
              <span className="text-xs text-gray-600">
                {metrics.cacheHitRate.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Optimization Time */}
          {metrics.optimizationTime > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm">Optimization</span>
              <span className="text-sm font-medium">
                {(metrics.optimizationTime / 1000).toFixed(2)}s
              </span>
            </div>
          )}

          {/* Performance Tips */}
          <div className="pt-2 border-t">
            <div className="text-xs text-gray-600 space-y-1">
              {metrics.cacheHitRate > 80 && (
                <div className="text-green-600">✅ Excellent cache performance</div>
              )}
              {metrics.loadTime < 3000 && (
                <div className="text-green-600">✅ Fast loading times</div>
              )}
              {metrics.cacheHitRate < 50 && (
                <div className="text-yellow-600">⚠️ Consider enabling more caching</div>
              )}
              {metrics.loadTime > 5000 && (
                <div className="text-orange-600">⚠️ Consider image optimization</div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceMonitor;
