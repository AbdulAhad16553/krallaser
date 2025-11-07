"use client"

import { useEffect } from "react"
import Link from "next/link"
import { AlertTriangle, Home, RefreshCcw } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error(error)
    }, [error])

    return (
        <div className="flex flex-col items-center justify-center min-h-screen px-4 py-16 text-center">
            <div className="mb-6 flex items-center justify-center w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/20">
                <AlertTriangle className="h-7 w-7 text-red-600 dark:text-red-400" />
            </div>

            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight mb-2">Something went wrong</h1>
            <p className="text-base sm:text-xl text-muted-foreground mb-6 max-w-md">
                We're sorry, but we encountered an unexpected error.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md justify-center">
                <Button onClick={reset} className="flex items-center gap-2">
                    <RefreshCcw className="h-4 w-4" />
                    Try Again
                </Button>
                <Button variant="outline" asChild className="flex items-center gap-2">
                    <Link href="/">
                        <Home className="h-4 w-4" />
                        Return Home
                    </Link>
                </Button>
            </div>
        </div>
    )
}
