import React from "react"

const FooterSkeleton = () => {
  return (
    <footer className="relative overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-16">
        {/* Main Footer Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">
          
          {/* Brand Section Skeleton */}
          <div className="lg:col-span-4">
            <div className="mb-8">
              {/* Logo Skeleton */}
              <div className="mb-6">
                <div className="w-32 h-16 bg-gray-600 rounded-lg animate-pulse"></div>
              </div>
              
              {/* Description Skeleton */}
              <div className="space-y-3 mb-6">
                <div className="h-4 bg-gray-600 rounded w-full"></div>
                <div className="h-4 bg-gray-600 rounded w-3/4"></div>
                <div className="h-4 bg-gray-600 rounded w-1/2"></div>
              </div>

              {/* Trust Features Skeleton */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-600 rounded-full animate-pulse"></div>
                    <div className="h-3 bg-gray-600 rounded w-20 animate-pulse"></div>
                  </div>
                ))}
              </div>

              {/* Social Links Skeleton */}
              <div className="flex items-center gap-3">
                <div className="h-4 bg-gray-600 rounded w-16 animate-pulse"></div>
                <div className="flex gap-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-10 h-10 bg-gray-600 rounded-full animate-pulse"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links Section Skeleton */}
          <div className="lg:col-span-2">
            {/* Section Header */}
            <div className="flex items-center gap-2 mb-6">
              <div className="w-5 h-5 bg-gray-600 rounded animate-pulse"></div>
              <div className="h-5 bg-gray-600 rounded w-20 animate-pulse"></div>
            </div>
            
            {/* Links Skeleton */}
            <ul className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <li key={i} className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-gray-600 rounded-full animate-pulse"></div>
                  <div className="h-4 bg-gray-600 rounded w-16 animate-pulse"></div>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links Section Skeleton */}
          <div className="lg:col-span-2">
            {/* Section Header */}
            <div className="flex items-center gap-2 mb-6">
              <div className="w-5 h-5 bg-gray-600 rounded animate-pulse"></div>
              <div className="h-5 bg-gray-600 rounded w-16 animate-pulse"></div>
            </div>
            
            {/* Links Skeleton */}
            <ul className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <li key={i} className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-gray-600 rounded-full animate-pulse"></div>
                  <div className="h-4 bg-gray-600 rounded w-20 animate-pulse"></div>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Section Skeleton */}
          <div className="lg:col-span-4">
            {/* Section Header */}
            <div className="flex items-center gap-2 mb-6">
              <div className="w-5 h-5 bg-gray-600 rounded animate-pulse"></div>
              <div className="h-5 bg-gray-600 rounded w-24 animate-pulse"></div>
            </div>
            
            {/* Contact Info Skeleton */}
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gray-600 rounded-lg animate-pulse"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-600 rounded w-16 animate-pulse"></div>
                    <div className="h-4 bg-gray-600 rounded w-32 animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Company Stats Skeleton */}
            <div className="mt-8 grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="text-center p-3 bg-gray-600/20 rounded-lg">
                  <div className="w-5 h-5 bg-gray-600 rounded-full mx-auto mb-2 animate-pulse"></div>
                  <div className="h-5 bg-gray-600 rounded w-16 mx-auto mb-1 animate-pulse"></div>
                  <div className="h-3 bg-gray-600 rounded w-20 mx-auto animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Newsletter Section Skeleton */}
        <div className="bg-gray-600/20 rounded-2xl p-8 mb-12">
          <div className="text-center max-w-2xl mx-auto">
            <div className="h-7 bg-gray-600 rounded w-48 mx-auto mb-3 animate-pulse"></div>
            <div className="space-y-2 mb-6">
              <div className="h-4 bg-gray-600 rounded w-full animate-pulse"></div>
              <div className="h-4 bg-gray-600 rounded w-3/4 mx-auto animate-pulse"></div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <div className="flex-1 h-12 bg-gray-600 rounded-lg animate-pulse"></div>
              <div className="w-24 h-12 bg-gray-600 rounded-lg animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Trust Badges Skeleton */}
        <div className="flex flex-wrap items-center justify-center gap-8 mb-12">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-5 h-5 bg-gray-600 rounded-full animate-pulse"></div>
              <div className="h-4 bg-gray-600 rounded w-20 animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Copyright Section Skeleton */}
      <div className="bg-gray-900 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="h-4 bg-gray-600 rounded w-48 animate-pulse"></div>
            <div className="flex items-center gap-6">
              <div className="h-4 bg-gray-600 rounded w-32 animate-pulse"></div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-600 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-600 rounded w-24 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default FooterSkeleton