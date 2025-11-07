import React from 'react'
import { Card, CardContent } from "@/components/ui/card"
import AnimatedSkeleton from '../segments/AnimatedSkeleton'

const OrderSummarySkeleton = () => {
    return (
        <Card className='h-56'>
            <CardContent className="p-4">
                <AnimatedSkeleton className="h-6 w-1/2 mb-4" /> {/* Title placeholder */}
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <AnimatedSkeleton className="h-4 w-20" /> {/* Subtotal label placeholder */}
                        <AnimatedSkeleton className="h-4 w-16" /> {/* Subtotal value placeholder */}
                    </div>
                    <div className="flex justify-between">
                        <AnimatedSkeleton className="h-4 w-12" /> {/* Tax label placeholder */}
                        <AnimatedSkeleton className="h-4 w-16" /> {/* Tax value placeholder */}
                    </div>
                    <div className="flex justify-between">
                        <AnimatedSkeleton className="h-4 w-16" /> {/* Total label placeholder */}
                        <AnimatedSkeleton className="h-4 w-16" /> {/* Total value placeholder */}
                    </div>
                </div>
                <AnimatedSkeleton className="w-full h-10 mt-6" /> {/* Button placeholder */}
            </CardContent>
        </Card>
    )
}

export default OrderSummarySkeleton