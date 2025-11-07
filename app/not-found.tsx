import Link from "next/link"
import { Search, Home, ShoppingBag, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Image from "next/image"

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen px-4 py-16 text-center">
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight mb-2 text-primary">404</h1>
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight mb-2 text-primary">Page not found</h1>
            <p className="text-sm sm:text-lg text-black mb-6 max-w-md">
                We couldn't find the page you were looking for. It might have been moved or doesn't exist.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-xs sm:max-w-md">
                <Button variant="outline" asChild className="flex items-center gap-2">
                    <Link href="/">
                        <Home className="h-4 w-4" />
                        Home
                    </Link>
                </Button>
                <Button variant="outline" asChild className="flex items-center gap-2">
                    <Link href="/shop">
                        <ShoppingBag className="h-4 w-4" />
                        Shop
                    </Link>
                </Button>
            </div>
        </div>
    )
}

