import React from 'react'
import AnimatedSkeleton from '../segments/AnimatedSkeleton'

const HeaderSkeleton = () => {
    return (
        <>
            {/* Top Bar Skeleton */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 py-2">
                <div className="container mx-auto px-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <AnimatedSkeleton className="w-32 h-4 bg-gray-700" />
                        <AnimatedSkeleton className="w-40 h-4 bg-gray-700" />
                    </div>
                    <AnimatedSkeleton className="w-48 h-4 bg-gray-700" />
                </div>
            </div>

            {/* Main Header Skeleton */}
            <header className="bg-white/95 shadow-lg border-b border-gray-100">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between py-4">
                        {/* Logo Section Skeleton */}
                        <div className="flex items-center space-x-4">
                            <AnimatedSkeleton className="w-12 h-12 rounded-lg" />
                            <div className="hidden md:block">
                                <AnimatedSkeleton className="w-32 h-6 mb-2" />
                                <AnimatedSkeleton className="w-48 h-4" />
                            </div>
                        </div>

                        {/* Navigation Skeleton */}
                        <nav className="hidden lg:flex items-center space-x-8">
                            <AnimatedSkeleton className="w-16 h-5" />
                            <AnimatedSkeleton className="w-20 h-5" />
                            <AnimatedSkeleton className="w-12 h-5" />
                            <AnimatedSkeleton className="w-16 h-5" />
                            <AnimatedSkeleton className="w-20 h-5" />
                        </nav>

                        {/* Search Section Skeleton */}
                        <div className="hidden md:block flex-1 max-w-md mx-8">
                            <AnimatedSkeleton className="w-full h-10 rounded-full" />
                        </div>

                        {/* Right Side Actions Skeleton */}
                        <div className="flex items-center space-x-4">
                            <AnimatedSkeleton className="w-10 h-10 rounded-full" />
                            <AnimatedSkeleton className="w-10 h-10 rounded-full" />
                            <AnimatedSkeleton className="w-10 h-10 rounded-full" />
                            <AnimatedSkeleton className="w-10 h-10 rounded-full" />
                        </div>
                    </div>
                </div>
            </header>
        </>
    )
}

export default HeaderSkeleton