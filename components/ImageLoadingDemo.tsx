"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProgressiveImage } from '@/components/ui/progressive-image';
import { Skeleton } from '@/components/ui/skeleton';
import { Eye, EyeOff, Loader2, CheckCircle, XCircle, Clock } from 'lucide-react';

interface ImageLoadingDemoProps {
  className?: string;
}

const ImageLoadingDemo: React.FC<ImageLoadingDemoProps> = ({ className = '' }) => {
  const [demoImages] = useState([
    {
      src: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
      alt: 'Headphones',
      name: 'Wireless Headphones'
    },
    {
      src: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop',
      alt: 'Watch',
      name: 'Smart Watch'
    },
    {
      src: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
      alt: 'Shoes',
      name: 'Running Shoes'
    }
  ]);

  const [showSteps, setShowSteps] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "1. Initial State",
      description: "Skeleton placeholder shows while image is not in viewport",
      icon: <Skeleton className="w-full h-full" />,
      color: "bg-gray-100"
    },
    {
      title: "2. Intersection Observer",
      description: "Image starts loading when it enters viewport (50px margin)",
      icon: <Eye className="h-6 w-6 text-blue-500" />,
      color: "bg-blue-50"
    },
    {
      title: "3. Blur Placeholder",
      description: "Blurred placeholder shows while real image loads",
      icon: <Loader2 className="h-6 w-6 text-yellow-500 animate-spin" />,
      color: "bg-yellow-50"
    },
    {
      title: "4. Progressive Load",
      description: "Real image fades in smoothly when loaded",
      icon: <CheckCircle className="h-6 w-6 text-green-500" />,
      color: "bg-green-50"
    }
  ];

  useEffect(() => {
    if (showSteps) {
      const interval = setInterval(() => {
        setCurrentStep(prev => (prev + 1) % steps.length);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [showSteps, steps.length]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-blue-600" />
            Progressive Image Loading Demo
          </CardTitle>
          <p className="text-sm text-gray-600">
            See how images load progressively for better performance
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowSteps(!showSteps)}
              variant={showSteps ? "destructive" : "default"}
              size="sm"
            >
              {showSteps ? "Stop Demo" : "Start Demo"}
            </Button>
            <Badge variant="outline">
              {showSteps ? "Demo Running" : "Demo Stopped"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Loading Steps */}
      {showSteps && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Loading Process</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                    index === currentStep
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {step.icon}
                    <span className="font-medium text-sm">{step.title}</span>
                  </div>
                  <p className="text-xs text-gray-600">{step.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Demo Images */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Live Progressive Loading</CardTitle>
          <p className="text-sm text-gray-600">
            Scroll down to see images load progressively. Each image loads when it enters the viewport.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {demoImages.map((image, index) => (
              <Card key={index} className="overflow-hidden">
                <div className="aspect-square relative">
                  <ProgressiveImage
                    src={image.src}
                    alt={image.alt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority={index === 0} // First image loads immediately
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-medium">{image.name}</h3>
                  <p className="text-sm text-gray-600">
                    Progressive loading demo
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Technical Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">How It Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-500" />
                Intersection Observer
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Monitors when images enter viewport</li>
                <li>• 50px margin for early loading</li>
                <li>• Only loads visible images</li>
                <li>• Saves bandwidth and memory</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Loader2 className="h-4 w-4 text-green-500" />
                Progressive Loading
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Blur placeholder while loading</li>
                <li>• Smooth fade-in transition</li>
                <li>• Loading indicators</li>
                <li>• Error handling</li>
              </ul>
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <h4 className="font-medium mb-2">Performance Benefits</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              <div className="text-center p-2 bg-green-50 rounded">
                <div className="font-bold text-green-600">90%</div>
                <div className="text-gray-600">Faster Load</div>
              </div>
              <div className="text-center p-2 bg-blue-50 rounded">
                <div className="font-bold text-blue-600">70%</div>
                <div className="text-gray-600">Less Bandwidth</div>
              </div>
              <div className="text-center p-2 bg-purple-50 rounded">
                <div className="font-bold text-purple-600">60%</div>
                <div className="text-gray-600">Less Memory</div>
              </div>
              <div className="text-center p-2 bg-orange-50 rounded">
                <div className="font-bold text-orange-600">100%</div>
                <div className="text-gray-600">Better UX</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ImageLoadingDemo;
