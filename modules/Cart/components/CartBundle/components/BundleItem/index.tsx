import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Minus, Plus, Trash2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

interface BundleItemProps {
    item: any;
    storeCurrency: string;
    showBundleInfo: boolean;
}

const BundleItem = ({ item, storeCurrency, showBundleInfo }: BundleItemProps) => {

    const getItemDetail = (item: any) => {
        if (item?.product_variation) {
            return {
                name: item?.product_variation?.product?.name || "Unnamed Product",
                imageId: item?.product_variation?.product?.product_images?.find((image: any) => image?.position === "featured")?.image_id,
                sku: item?.product_variation?.sku || "N/A",
                attributes: item?.product_variation?.product_variation_attributes || [],
            };
        } else {
            return {
                name: item?.product?.name || "Unnamed Product",
                imageId: item?.image?.image_id,
                sku: item?.sku || "N/A",
                attributes: [],
            };
        }
    };

    const itemDetails = getItemDetail(item);

    return (
        <div
            className={`flex flex-col sm:flex-row items-stretch gap-4 p-4 rounded-md ${showBundleInfo ? "bg-muted/30" : "border"}`}
        >
            {/* Image */}
            <div className="relative w-20 h-20 overflow-hidden rounded-md shrink-0 mx-auto sm:mx-0">
                <Image
                    src={itemDetails.imageId
                        ? `${process.env.NEXT_PUBLIC_NHOST_STORAGE_URL}/files/${itemDetails.imageId}?w=128&h=128`
                        : "/placeholder.svg"}
                    alt={itemDetails.name}
                    fill
                    className="object-cover"
                    sizes="64px"
                />
            </div>

            {/* Product Details */}
            <div className="flex-1 min-w-0 w-full sm:w-auto flex flex-col gap-2">
                {/* Product Name */}
                <Link href={`/products/${item.product_id}`} className="hover:underline">
                    <h3 className="font-medium text-base truncate text-center sm:text-left">
                        {itemDetails.name}
                    </h3>
                </Link>

                {/* SKU */}
                <p className="text-xs text-muted-foreground text-center sm:text-left">
                    SKU: {itemDetails.sku}
                </p>

                {/* Quantity */}
                <p className="text-xs text-muted-foreground text-center sm:text-left">
                    Quantity: {item?.quantity || 1}
                </p>

                {/* Attributes */}
                {itemDetails.attributes.length > 0 && (
                    <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                        {itemDetails.attributes.map((attribute: any, index: number) => (
                            <Badge key={index} className="px-2 py-1 text-xs">
                                {attribute?.product_attribute?.name}: {attribute?.product_attributes_value?.value}
                            </Badge>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default BundleItem;
