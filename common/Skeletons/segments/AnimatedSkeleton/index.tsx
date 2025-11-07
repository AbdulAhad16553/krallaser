import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'

interface AnimatedSkeletonProps {
    className?: string
}

const AnimatedSkeleton = ({ className = '' }: AnimatedSkeletonProps) => {
    return (
        <Skeleton className={className} />
    )
}

export default AnimatedSkeleton