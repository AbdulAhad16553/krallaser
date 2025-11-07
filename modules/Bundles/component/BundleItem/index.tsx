"use client"

import Image from "next/image"
import Link from "next/link"

interface BundleItemProps {
    item: any
}

const BundleItem = ({ item }: BundleItemProps) => {

    const product = item.product || item.product_variation?.product
    const productName = product?.name || "Unknown Product"
    const productSlug = product?.slug || ""
    const productType = product?.type || "N/A"
    const productSku = item.product_sku
    const basePrice = item.product_variation?.base_price ?? product?.base_price ?? 0
    const salePrice = item.product_variation?.sale_price ?? product?.sale_price ?? basePrice
    const imageId = product?.product_images?.find((image: any) => (image?.position === "featured")).image_id

    return (
        <div className="flex items-center gap-4 p-3 border rounded-md">
            <div className="relative w-16 h-16 overflow-hidden rounded-md shrink-0">
                <Image 
                    src={`${process.env.NEXT_PUBLIC_NHOST_STORAGE_URL}/files/${imageId}?w=128&h=128`} 
                    alt={productName} 
                    fill 
                    className="object-cover"
                    sizes="64px"
                />
            </div>
            <div className="flex-1 min-w-0">
                <Link href={`/product/${productSlug}`} className="hover:underline">
                    <h4 className="font-medium text-sm truncate">{productName}</h4>
                </Link>
                <p className="text-xs text-muted-foreground">SKU: {productSku}</p>
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-medium">${salePrice}</span>
                    {salePrice !== 0 && basePrice > salePrice && (
                        <span className="text-xs line-through text-muted-foreground">${basePrice}</span>
                    )}
                </div>
            </div>
            <div className="text-sm font-medium mr-2">Qty: {item.quantity}</div>
        </div>
    )
}

export default BundleItem