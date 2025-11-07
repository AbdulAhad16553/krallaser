import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import AnimatedSkeleton from '../segments/AnimatedSkeleton'

const ProductSkeleton = () => {
    return (
        <section>
            <h2 className="text-2xl font-bold mb-6">Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {[...Array(8)].map((_, index) => (
                    <Card key={index}>
                        <CardContent className="p-4">
                            <AnimatedSkeleton className="w-full h-48 rounded-lg mb-2" /> {/* Image placeholder */}
                            <AnimatedSkeleton className="h-5 w-3/4 mb-2" /> {/* Product name placeholder */}
                            <AnimatedSkeleton className="h-6 w-1/2 mb-2" /> {/* Price placeholder */}
                            <AnimatedSkeleton className="h-10 w-full mt-2" /> {/* Button placeholder */}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </section>
    )
}

export default ProductSkeleton