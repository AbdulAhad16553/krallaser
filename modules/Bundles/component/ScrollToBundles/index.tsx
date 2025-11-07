"use client"

import { ChevronDown } from "lucide-react"
import { useEffect, useState } from "react"

interface ScrollToBundlesProps {
    hasBundles: boolean
}

const ScrollToBundles = ({ hasBundles }: ScrollToBundlesProps) => {
    const [isVisible, setIsVisible] = useState(true)

    useEffect(() => {
        const handleScroll = () => {
            // Hide the icon after scrolling down a bit
            if (window.scrollY > 300) {
                setIsVisible(false)
            } else {
                setIsVisible(true)
            }
        }

        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    if (!hasBundles) return null

    const scrollToBundles = () => {
        const bundlesSection = document.getElementById("bundles-section")
        if (bundlesSection) {
            bundlesSection.scrollIntoView({ behavior: "smooth" })
        }
    }

    return (
        <div
            className={`flex flex-col items-center justify-center mt-4 transition-opacity duration-300 ${isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
        >
            <p className="text-sm text-muted-foreground mb-1">Scroll to see bundles</p>
            <button
                onClick={scrollToBundles}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors duration-200"
                aria-label="Scroll to bundles"
            >
                <ChevronDown className="h-5 w-5 text-primary animate-bounce" />
            </button>
        </div>
    )
}

export default ScrollToBundles