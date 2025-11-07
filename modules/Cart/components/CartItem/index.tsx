"use client"

import Image from "next/image"
import Link from "next/link"
import { Trash2, Minus, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { IncreamentQuantity } from "@/sub/cart/increamentQuantity"
import { DecreamentQuantity } from "@/sub/cart/decreamentQuantity"
import { RemoveFromCart } from "@/sub/cart/removeFromCart"
import { formatPrice } from "@/lib/currencyUtils";

interface CartItemProps {
    item: any,
    showBundleInfo: boolean;
    storeCurrency: string
}

const CartItem = ({
    item,
    showBundleInfo,
    storeCurrency
}: CartItemProps) => {

    const getProductDetails = (item: any) => {
        return {
            name: item?.name || "Unknown Product",
            imageId: item?.image?.image_id || item?.image,
            basePrice: item?.basePrice || 0,
            salePrice: item?.salePrice || item?.price || 0,
            sku: item?.sku || "N/A",
            attributes: item?.variation?.variationId ? item?.variation?.attributes : null
        };
    };

    const getImageSrc = (item: any) => {
        const details = getProductDetails(item);
        const storageUrl = process.env.NEXT_PUBLIC_NHOST_STORAGE_URL;
        
        // Ensure imageId is a string
        const imageId = details.imageId;
        
        // If we have a valid storage URL and image ID, use it
        if (storageUrl && imageId && typeof imageId === 'string') {
            return `${storageUrl}/files/${imageId}?w=160&h=160`;
        }
        
        // If we have a direct image URL, use it
        if (imageId && typeof imageId === 'string' && (imageId.startsWith('http') || imageId.startsWith('/'))) {
            return imageId;
        }
        
        // Fallback to placeholder
        return "/placeholder.svg";
    };

    return (
        <div
            className={`flex flex-col sm:flex-row items-start gap-4 p-4 rounded-md ${showBundleInfo ? "bg-muted/30" : "border"}`}
        >
            {/* Image */}
            <div className="relative w-20 h-20 overflow-hidden rounded-md shrink-0 mx-auto sm:mx-0">
                <Image
                    src={getImageSrc(item)}
                    alt={getProductDetails(item).name}
                    fill
                    className="object-cover"
                    sizes="80px"
                />
            </div>

            {/* Product Details */}
            <div className="flex-1 min-w-0 w-full sm:w-auto flex flex-col gap-2">
                {/* Product Name */}
                <Link href={`/products/${item.product_id}`} className="hover:underline">
                    <h3 className="font-medium text-base truncate text-center sm:text-left">{getProductDetails(item).name}</h3>
                </Link>

                {/* SKU */}
                <p className="text-xs text-muted-foreground text-center sm:text-left">
                    SKU: {getProductDetails(item).sku}
                </p>

                {/* Attributes */}
                <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                    {getProductDetails(item).attributes?.map((attribute: any, index: number) => (
                        <Badge key={index} className="px-2 py-1 text-xs">
                            {attribute?.attribute_name}: {attribute?.selected_value}
                        </Badge>
                    ))}
                </div>

                {/* Price Section */}
                <div className="flex items-center justify-center sm:justify-start gap-2">
                    <span className="font-medium flex flex-col sm:flex-row items-center gap-2">
                        {getProductDetails(item).salePrice ? (
                            <>
                                <span>
                                    {formatPrice(getProductDetails(item).salePrice, item?.currency || storeCurrency)}
                                </span>
                                <span className="line-through text-xs text-muted-foreground">
                                    {formatPrice(getProductDetails(item).basePrice, item?.currency || storeCurrency)}
                                </span>
                            </>
                        ) : (
                            formatPrice(getProductDetails(item).basePrice, item?.currency || storeCurrency)
                        )}
                    </span>
                </div>
            </div>

            <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 mt-3 sm:mt-0">
                <div className="flex items-center border rounded-md">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-none"
                        disabled={item.quantity <= 1}
                        onClick={() => { DecreamentQuantity(item?.id) }}
                    >
                        <Minus className="h-3 w-3" />
                    </Button>

                    <span className="w-8 text-center text-sm">{item.quantity}</span>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-none"
                        onClick={() => { IncreamentQuantity(item?.id) }}
                    >
                        <Plus className="h-3 w-3" />
                    </Button>
                </div>

                {/* Remove Button */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                    onClick={() => { RemoveFromCart(item?.id) }}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}

export default CartItem