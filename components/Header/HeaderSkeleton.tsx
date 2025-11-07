import React from 'react';

const HeaderSkeleton = () => {
    return (
        <header className="bg-white shadow-md">
            <div className="container mx-auto p-4 flex items-center">
                <div className="flex flex-grow items-center justify-between">
                    <div className="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
                    <div className="flex items-center space-x-4">
                        <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-6 w-6 bg-gray-200 rounded-full animate-pulse"></div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default HeaderSkeleton;
