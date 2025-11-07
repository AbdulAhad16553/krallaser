import React from 'react'
import AnimatedSkeleton from '../segments/AnimatedSkeleton'

const HeroSkeleton = () => {
    return (
        <section className="mb-12">
            <div className="relative h-96 rounded-lg overflow-hidden">
                <AnimatedSkeleton className="absolute inset-0" /> {/* Background image placeholder */}
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="text-center">
                        <AnimatedSkeleton className="h-12 w-3/4 mx-auto mb-4" /> {/* Title placeholder */}
                        <AnimatedSkeleton className="h-6 w-2/3 mx-auto mb-8" /> {/* Subtitle placeholder */}
                        <AnimatedSkeleton className="h-12 w-32 mx-auto" /> {/* Button placeholder */}
                    </div>
                </div>
            </div>
        </section>
    )
}

export default HeroSkeleton