"use client"

import { useState } from "react"
import { Package, Trash2, ChevronDown, ChevronUp, Minus, Plus } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import BundleItem from "./components/BundleItem"
import { IncreamentQuantity } from "@/sub/cart/increamentQuantity"
import { DecreamentQuantity } from "@/sub/cart/decreamentQuantity"
import { RemoveFromCart } from "@/sub/cart/removeFromCart"

interface CartBundleProps {
    bundle: any;
    storeCurrency: string
}

const CartBundle = ({ bundle, storeCurrency }: CartBundleProps) => {

    const [expanded, setExpanded] = useState(true)
    const [removing, setRemoving] = useState(false)

    const toggleExpanded = () => {
        setExpanded((prev) => !prev)
    }

    const savingsPercentage = bundle?.basePrice && bundle?.salePrice
        ? ((bundle.basePrice - bundle.salePrice) / bundle.basePrice) * 100
        : 0;

    const currencySymbol = storeCurrency.split(" - ")[1] || "$";

    return (
        <div className="border rounded-lg overflow-hidden">
            <div className="bg-primary/5 p-3 sm:p-4">
                {/* Bundle Header - Responsive Layout */}
                <div className="flex flex-col gap-2 sm:gap-3">
                    {/* Bundle Title and Description */}
                    <div className="flex justify-between items-start">
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <Package className="h-5 w-5 text-primary" />
                                <h3 className="font-medium line-clamp-1">{bundle.name}</h3>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{bundle.description}</p>
                        </div>

                        {/* Expand/Collapse Button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 shrink-0 ml-2"
                            onClick={toggleExpanded}
                        >
                            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                    </div>

                    {/* Bundle Controls - Responsive Layout */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mt-1">
                        {/* Savings Badge */}
                        <span className="text-xs sm:text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                            Save {savingsPercentage.toFixed(0)}%
                        </span>

                        <div className="flex items-center gap-2">
                            {/* Quantity Controls */}
                            <div className="flex items-center border rounded-md">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-none"
                                    onClick={() => { DecreamentQuantity(bundle?.id) }}
                                    disabled={bundle.quantity <= 1}
                                >
                                    <Minus className="h-3 w-3" />
                                </Button>

                                <span className="w-8 text-center text-sm">{bundle?.quantity || 1}</span>

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-none"
                                    onClick={() => { IncreamentQuantity(bundle?.id) }}
                                >
                                    <Plus className="h-3 w-3" />
                                </Button>
                            </div>

                            {/* Remove Button */}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                                disabled={removing}
                                onClick={() => { RemoveFromCart(bundle?.id) }}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bundle Price Section */}
            <div className="flex justify-between items-center p-3 sm:p-4 bg-muted/10">
                <div>
                    <p className="text-sm font-medium">
                        {bundle?.salePrice ? (
                            <span className="flex items-center gap-2">
                                <span className="font-semibold">
                                    {currencySymbol}
                                    {bundle?.salePrice}
                                </span>
                                <span className="line-through text-xs text-muted-foreground">
                                    {currencySymbol}
                                    {bundle?.basePrice}
                                </span>
                            </span>
                        ) : (
                            <span className="font-semibold">
                                {currencySymbol}
                                {bundle?.basePrice}
                            </span>
                        )}
                    </p>
                </div>
            </div>

            {/* Bundle Items */}
            {expanded && (
                <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
                    {bundle.bundleItems.map((item: any, index: number) => (
                        <div key={index}>
                            {index > 0 && <Separator className="my-3 sm:my-4" />}
                            <BundleItem
                                item={item}
                                storeCurrency={storeCurrency}
                                showBundleInfo={true}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default CartBundle