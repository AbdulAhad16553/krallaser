"use client";

import { Suspense } from 'react';
import dynamic from 'next/dynamic';

interface HeaderWrapperProps {
    storeData: any;
}

// Loading skeleton for header
const HeaderSkeleton = () => (
    <>
        {/* Top Bar Skeleton */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 py-2">
            <div className="container mx-auto px-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <div className="w-32 h-4 bg-gray-700 rounded animate-pulse"></div>
                    <div className="w-40 h-4 bg-gray-700 rounded animate-pulse"></div>
                </div>
                <div className="w-48 h-4 bg-gray-700 rounded animate-pulse"></div>
            </div>
        </div>

        {/* Main Header Skeleton */}
        <div className="h-20 bg-white/95 shadow-lg border-b border-gray-100 animate-pulse">
            <div className="container mx-auto px-4 h-full flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 bg-gray-200 rounded-lg"></div>
                    <div className="hidden md:block">
                        <div className="h-6 w-32 bg-gray-200 rounded mb-2"></div>
                        <div className="h-4 w-48 bg-gray-200 rounded"></div>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="h-10 w-64 bg-gray-200 rounded-full"></div>
                    <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                    <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                </div>
            </div>
        </div>
    </>
);

// Dynamically import the header with no SSR to avoid module factory issues
const DynamicHeader = dynamic(
    () => import('./ClientLayout'),
    { 
        ssr: false,
        loading: () => <HeaderSkeleton />
    }
);

const HeaderWrapper = ({ storeData }: HeaderWrapperProps) => {
    return (
        <Suspense fallback={<HeaderSkeleton />}>
            <DynamicHeader storeData={storeData} />
        </Suspense>
    );
};

export default HeaderWrapper;
