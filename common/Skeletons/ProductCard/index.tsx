import React from 'react'
import { Card, CardContent } from "@/components/ui/card"
import AnimatedSkeleton from '../segments/AnimatedSkeleton'

const ProductCardSkeleton = () => {
    return (
        <Card className="mb-4">
            <CardContent className="flex items-center p-4">
                <AnimatedSkeleton className="w-20 h-20 rounded-md" /> {/* Image placeholder */}
                <div className="ml-4 flex-grow">
                    <AnimatedSkeleton className="h-5 w-3/4 mb-2" /> {/* Product name placeholder */}
                    <AnimatedSkeleton className="h-4 w-1/4" /> {/* Price placeholder */}
                </div>
                <div className="flex items-center">
                    <AnimatedSkeleton className="w-8 h-8 rounded-md" /> {/* Decrease button placeholder */}
                    <AnimatedSkeleton className="w-16 h-8 mx-2" /> {/* Quantity input placeholder */}
                    <AnimatedSkeleton className="w-8 h-8 rounded-md" /> {/* Increase button placeholder */}
                </div>
                <AnimatedSkeleton className="w-8 h-8 rounded-md ml-4" /> {/* Remove button placeholder */}
            </CardContent>
        </Card>
    )
}

export default ProductCardSkeleton

