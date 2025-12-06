"use client"

import type React from "react"

import { useState } from "react"
import BundleItem from "./component/BundleItem"
import { ChevronDown, ChevronUp, Package, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AddToCart } from "@/sub/cart/addToCart"

interface BundlesContainerProps {
    bundles: any
}

const Bundles = ({ bundles }: BundlesContainerProps) => {

    const [expandedBundles, setExpandedBundles] = useState<Record<string, boolean>>({})
    const [addingToCart, setAddingToCart] = useState<Record<string, boolean>>({})

    const addBundleToCart = (bundle: any) => {
        AddToCart({
            id: bundle.id,
            name: bundle.name,
            description: bundle.description,
            basePrice: bundle.price_without_discount,
            salePrice: bundle.price_with_discount,
            currency: "USD", // Adjust based on your currency logic
            bundleItems: bundle.bundle_product_items, // Store all bundle items inside the cart
            type: "bundle"
        });

    }

    const toggleBundle = (bundleId: string) => {
        setExpandedBundles((prev) => ({
            ...prev,
            [bundleId]: !prev[bundleId],
        }))
    }

    return (
        <div className="mt-8 border rounded-lg p-4">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Package className="h-5 w-5" />
                Available in Bundles
            </h3>

            <div className="space-y-4">
                {bundles?.map((bundle: any, index: number) => (
                    <div key={index} className="border rounded-lg overflow-hidden">
                        <div
                            className="flex items-center justify-between p-4 bg-muted/30 cursor-pointer"
                            onClick={() => toggleBundle(bundle.id)}
                        >
                            <div className="flex-1">
                                <h4 className="font-medium">{bundle.name}</h4>
                                <p className="text-sm text-muted-foreground">{bundle.description}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                {/* <span className="text-sm font-medium text-green-600">Save {bundle.discount_percentage}%</span> */}
                                <Button
                                    variant="default"
                                    size="sm"
                                    className="flex items-center gap-1"
                                    onClick={(e) => addBundleToCart(bundle)}
                                    disabled={addingToCart[bundle.id]}
                                >
                                    <ShoppingCart className="h-4 w-4 mr-1" />
                                    {addingToCart[bundle.id] ? "Adding..." : "Add Bundle"}
                                </Button>
                                {expandedBundles[bundle.id] ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                            </div>
                        </div>

                        {expandedBundles[bundle.id] && (
                            <div className="p-4 space-y-3">
                                <div className="p-4 space-y-3">
                                    {bundle.bundle_product_items?.map((item: any, index: number) => (
                                        <BundleItem key={index} item={item} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Bundles