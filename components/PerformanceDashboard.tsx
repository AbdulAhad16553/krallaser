"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getPaginationMetrics, getPaginationSummary, paginationPerformance } from '@/lib/paginationPerformance';
import { Activity, Zap, Clock, TrendingUp, RefreshCw } from 'lucide-react';

interface PerformanceDashboardProps {
  className?: string;
}

const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({ className = '' }) => {
  const [metrics, setMetrics] = useState(getPaginationMetrics());
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(getPaginationMetrics());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getPerformanceGrade = (responseTime: number): { grade: string; color: string } => {
    if (responseTime < 200) return { grade: 'A+', color: 'bg-green-100 text-green-800' };
    if (responseTime < 500) return { grade: 'A', color: 'bg-green-100 text-green-800' };
    if (responseTime < 1000) return { grade: 'B', color: 'bg-yellow-100 text-yellow-800' };
    if (responseTime < 2000) return { grade: 'C', color: 'bg-orange-100 text-orange-800' };
    return { grade: 'D', color: 'bg-red-100 text-red-800' };
  };

  const getCacheGrade = (hitRate: number): { grade: string; color: string } => {
    if (hitRate >= 90) return { grade: 'Excellent', color: 'bg-green-100 text-green-800' };
    if (hitRate >= 70) return { grade: 'Good', color: 'bg-yellow-100 text-yellow-800' };
    if (hitRate >= 50) return { grade: 'Fair', color: 'bg-orange-100 text-orange-800' };
    return { grade: 'Poor', color: 'bg-red-100 text-red-800' };
  };

  const performanceGrade = getPerformanceGrade(metrics.averageResponseTime);
  const cacheGrade = getCacheGrade(metrics.cacheHitRate);

  if (!isVisible && process.env.NODE_ENV === 'development') {
    return (
      <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
        <Button
          onClick={() => setIsVisible(true)}
          size="sm"
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Activity className="h-4 w-4 mr-2" />
          Show Performance
        </Button>
      </div>
    );
  }

  if (!isVisible) return null;

  return (
    <Card className={`w-80 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-600" />
            Performance Monitor
          </CardTitle>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => paginationPerformance.reset()}
              className="text-xs"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Reset
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsVisible(false)}
              className="text-xs"
            >
              ×
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Performance Grade */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-yellow-500" />
            <span className="text-sm font-medium">Performance</span>
          </div>
          <Badge className={performanceGrade.color}>
            {performanceGrade.grade}
          </Badge>
        </div>

        {/* Cache Performance */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium">Cache Hit Rate</span>
          </div>
          <Badge className={cacheGrade.color}>
            {metrics.cacheHitRate.toFixed(1)}%
          </Badge>
        </div>

        {/* Response Time */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium">Avg Response</span>
          </div>
          <span className="text-sm font-mono">
            {metrics.averageResponseTime.toFixed(0)}ms
          </span>
        </div>

        {/* Total Requests */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Total Requests</span>
          <span className="text-sm font-mono">{metrics.totalRequests}</span>
        </div>

        {/* Last Load Time */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Last Load</span>
          <span className="text-sm font-mono">
            {metrics.pageLoadTime.toFixed(0)}ms
          </span>
        </div>

        {/* Performance Summary */}
        <div className="pt-2 border-t">
          <p className="text-xs text-gray-600 leading-relaxed">
            {getPaginationSummary()}
          </p>
        </div>

        {/* Optimization Suggestions */}
        {metrics.totalRequests > 5 && (
          <div className="pt-2 border-t">
            <p className="text-xs font-medium text-gray-700 mb-1">Suggestions:</p>
            <ul className="text-xs text-gray-600 space-y-1">
              {paginationPerformance.getOptimizationSuggestions().slice(0, 2).map((suggestion, index) => (
                <li key={index} className="flex items-start gap-1">
                  <span className="text-blue-500">•</span>
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PerformanceDashboard;