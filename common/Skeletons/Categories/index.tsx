import React from 'react'
import AnimatedSkeleton from '../segments/AnimatedSkeleton'
import { Card, CardContent } from '@/components/ui/card'

const CategoriesSkeleton = () => {
    return (
        <section className="mb-12">
            <AnimatedSkeleton className="h-8 w-48 mb-6" /> {/* Title placeholder */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, index) => (
                    <Card key={index}>
                        <CardContent className="p-4">
                            <AnimatedSkeleton className="w-full h-48 rounded-lg mb-2" /> {/* Image placeholder */}
                            <AnimatedSkeleton className="h-6 w-3/4 mx-auto" /> {/* Category name placeholder */}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </section>
    )
}

export default CategoriesSkeleton