"use client";

import React, { useState, useEffect, useRef } from "react";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AddToCart } from "@/sub/cart/addToCart";
import QuotationForm from "@/common/QuotationForm";
import { CartAnimationDialog } from "@/common/CartAnimationDialog";
import AttributeFilter from "@/common/AttributeFilter";
import { MetaEvent } from "@/sub/event/Types";
import { createMetaEvent } from "@/sub/event/CreateMetaEvent";
import { fetchGeoData } from "@/lib/fetchGeoData";
import { useSearchParams } from "next/navigation";

// Helper function to calculate stock from current_stock data
const calculateStockFromCurrentStock = (currentStockData: any[], sku: string) => {
    if (!currentStockData || !sku) return 0;
    
    // Find stock records for this SKU across all warehouses
    const skuStockRecords = currentStockData.filter((stock: any) => stock.sku === sku);
    
    if (skuStockRecords.length === 0) return 0;
    
    // Sum available quantities across all warehouses for this SKU
    return skuStockRecords.reduce((total: number, stock: any) => 
        total + (stock?.available_quantity || 0), 0
    );
};

const ProductContent = ({ productContent, necessary }: any) => {

    const searchParams = useSearchParams();
    const fbclid = searchParams.get("fbclid");
    const [showDialog, setShowDialog] = useState(false)
    const [geoDetail, setGeoDetail] = useState<any>({});
    const [quantity, setQuantity] = useState(1);
    const [selectedAttributes, setSelectedAttributes] = useState<Array<{attribute: string, attribute_value: string}>>([]);
    const descriptionRef = useRef<HTMLDivElement | null>(null);
    const [variationId, setVariationId] = useState<string | null>(null);
    const [clientUserAgent, setClientUserAgent] = useState<string>("");

    const [stock, setStock] = useState<any>(() => {
        if (productContent?.type === "variable") {
            // For variable products, calculate total stock from all variations
            let totalStock = 0;
            
            productContent.product_variations?.forEach((variation: any) => {
                // Check if variation has stock info
                if (variation.stock && variation.stock.totalStock !== undefined) {
                    totalStock += variation.stock.totalStock;
                } else {
                    // Fallback to old method
                    const variationStock = calculateStockFromCurrentStock(
                        productContent?.current_stock || [], 
                        variation.sku
                    );
                    totalStock += variationStock;
                }
            });
            
            // Return the actual total stock from all variations
            return totalStock;
        } else {
            // For simple products, use the main product stock
            if (productContent?.stock && productContent.stock.totalStock !== undefined) {
                return productContent.stock.totalStock;
            }
            
            // Fallback to old method
            return calculateStockFromCurrentStock(
                productContent?.current_stock || [], 
                productContent?.sku
            );
        }
    });

    const [sku, setSku] = useState(productContent?.sku);
    const [prices, setPrices] = useState<any>(() => {
        if (productContent?.type === "variable") {
            const basePrices = productContent.product_variations.map((variation: any) => variation.base_price);
            const salePrices = productContent.product_variations.map((variation: any) => variation.sale_price);

            return {
                basePrice: `${Math.min(...basePrices)} - ${Math.max(...basePrices)}`,
                salePrice: `${Math.min(...salePrices)} - ${Math.max(...salePrices)}`,
            };
        }
        return {
            basePrice: productContent?.base_price,
            salePrice: productContent?.sale_price,
        };
    });

    const handleAttributeChange = (attributes: Array<{attribute: string, attribute_value: string}>) => {
        setSelectedAttributes(attributes);
    };

    useEffect(() => {
        if (productContent?.type === "variable") {
            // For now, we'll need to fetch variant data from ERPNext API
            // This is a simplified version - in a real implementation, you'd fetch variants
            // based on the selected attributes from the ERPNext API
            
            if (selectedAttributes.length > 0) {
                // TODO: Implement variant matching based on ERPNext API data
                // For now, show price range
                const basePrices = productContent.product_variations.map((variation: any) => variation.base_price);
                const salePrices = productContent.product_variations.map((variation: any) => variation.sale_price);

                setPrices({
                    basePrice: `${Math.min(...basePrices)} - ${Math.max(...basePrices)}`,
                    salePrice: `${Math.min(...salePrices)} - ${Math.max(...salePrices)}`,
                });
                setStock(0);
                setSku("-");
                setVariationId(null);
            } else {
                // Show price range when no attributes selected
                const basePrices = productContent.product_variations.map((variation: any) => variation.base_price);
                const salePrices = productContent.product_variations.map((variation: any) => variation.sale_price);

                setPrices({
                    basePrice: `${Math.min(...basePrices)} - ${Math.max(...basePrices)}`,
                    salePrice: `${Math.min(...salePrices)} - ${Math.max(...salePrices)}`,
                });
                setStock(0);
                setSku("-");
                setVariationId(null);
            }
        } else {
            setPrices({
                basePrice: productContent?.base_price,
                salePrice: productContent?.sale_price,
            });

            // Use new current_stock data structure
            const currentStockData = productContent?.current_stock || [];
            const totalStock = calculateStockFromCurrentStock(currentStockData, productContent?.sku);

            setStock(totalStock);
            setSku(productContent?.sku);
            setVariationId(null);
        }
    }, [selectedAttributes, productContent]);

    useEffect(() => {
        if (descriptionRef.current) {
            descriptionRef.current.innerHTML = productContent.detailed_desc;
        }
    }, [productContent.detailed_desc]);

    const selectedAttributesWithVariation = {
        attributes: selectedAttributes,
        variationId: variationId
    };

    useEffect(() => {
        const fetchData = async () => {
            const data = await fetchGeoData();
            if (data) {
                setGeoDetail(data);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        // Set user agent only on client side
        if (typeof window !== 'undefined') {
            setClientUserAgent(navigator.userAgent);
        }
    }, []);

    const handleAddToCart = async () => {
        setShowDialog(true);
        AddToCart({
            id: productContent.id,
            sku,
            name: productContent?.name,
            basePrice: prices?.basePrice,
            salePrice: prices?.salePrice,
            currency: productContent?.currency ? productContent?.currency : necessary?.storeCurrency,
            category: productContent?.category?.name,
            quantity,
            image: productContent?.product_images?.find((image: any) => image.position === "featured"),
            variation: selectedAttributesWithVariation,
            type: "item",
        });

        const payload: MetaEvent = {
            event_name: "AddToCart",
            event_time: Math.floor(Date.now() / 1000),
            action_source: "website",
            storeId: necessary?.storeId,
            user_data: {
                em: [],
                ph: [],
                fn: [],
                ct: [geoDetail?.city],
                country: [geoDetail?.country],
                zp: [],
                client_ip_address: geoDetail?.ip,
                client_user_agent: clientUserAgent,
                fbc: fbclid || "",
            },
            custom_data: {
                currency: productContent?.currency ? productContent?.currency.split(" - ")[0] : necessary?.storeCurrency.split(" - ")[0],
                value: prices?.salePrice && prices?.salePrice > 0 ? prices?.salePrice : prices?.basePrice,
                content_category: productContent?.category?.name || "",
                content_name: productContent?.name,
                status: "Inquired",
            }
        }

        await createMetaEvent(payload)

        setTimeout(() => {
            setShowDialog(false);
        }, 1000);
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-4">{productContent.name}</h1>
            <p className="text-gray-600 mb-6">{productContent.short_description}</p>
            <div className="text-gray-600 mb-6">
                {/* Ensure bullets appear in lists */}
                <div
                    ref={descriptionRef}
                    className="[&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5 
                   [&>a]:text-blue-600 [&>a]:underline 
                   [&>em]:italic [&>u]:underline"
                ></div>
            </div>
            <div className="text-2xl font-bold mb-6">
                {prices?.salePrice > 0 ? (
                    <>
                        {productContent?.currency ? productContent?.currency.split(" - ")[1] : necessary?.storeCurrency.split(" - ")[1]}
                        {prices?.salePrice}
                        <span className="text-sm line-through ml-2 text-muted-foreground">
                            {productContent?.currency ? productContent?.currency.split(" - ")[1] : necessary?.storeCurrency.split(" - ")[1]}
                            {prices?.basePrice}
                        </span>
                    </>
                ) : (
                    <>
                        {productContent?.currency ? productContent?.currency.split(" - ")[1] : necessary?.storeCurrency.split(" - ")[1]}
                        {prices?.basePrice}
                    </>
                )}
            </div>

            <div className="text-lg mb-4">
                <p>
                    <span className="font-semibold">SKU:</span> {sku ? sku : "-"}
                </p>
                {!productContent.enable_quote_request && productContent.type !== "quotation" && (
                    <div className="flex items-center gap-2">
                        <span className="font-semibold">Stock:</span>
                        {stock > 0 ? (
                            <div className="flex items-center gap-1">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-green-700 font-medium">
                                    {stock} in stock
                                </span>
                                {productContent.type === "variable" && (
                                    <span className="text-gray-500 text-sm">
                                        ({productContent.product_variations?.length || 0} variants)
                                    </span>
                                )}
                                {stock <= 10 && (
                                    <span className="text-orange-600 text-sm">
                                        (Low stock)
                                    </span>
                                )}
                            </div>
                        ) : productContent.type === "variable" ? (
                            <div className="flex items-center gap-1">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span className="text-blue-700 font-medium">
                                    {productContent.product_variations?.length || 0} variants available
                                </span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-1">
                                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                <span className="text-red-700 font-medium">
                                    Out of stock
                                </span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="space-y-6">
                {productContent?.type === "variable" && productContent?.name && (
                    <AttributeFilter
                        templateItemName={productContent.name}
                        onAttributeChange={handleAttributeChange}
                        selectedAttributes={selectedAttributes}
                        productVariations={productContent.product_variations}
                    />
                )}
                {!productContent.enable_quote_request && productContent.type !== "quotation" && (
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Quantity</h3>
                        <div className="flex items-center space-x-2">
                            {/* Decrease Quantity Button */}
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                disabled={quantity === 1} // Disable when quantity is at minimum
                            >
                                <Minus className="h-4 w-4" />
                            </Button>

                            {/* Quantity Display */}
                            <span className="text-xl font-semibold">{quantity}</span>

                            {/* Increase Quantity Button */}
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setQuantity((prev) => Math.min(stock, prev + 1))}
                                disabled={quantity >= stock} // Disable when quantity reaches stock limit
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
            <Separator className="my-6" />
            {productContent?.enable_quote_request || productContent?.type === "quotation" ? (
                <QuotationForm
                    productName={productContent?.name}
                    productSku={sku || productContent?.sku || productContent?.name || "N/A"}
                    necessary={necessary}
                    variationInfo={
                        productContent?.type === "variable" && variationId 
                            ? `Variation ID: ${variationId}` 
                            : undefined
                    }
                />
            ) : (
                <Button
                    className="w-full text-white"
                    disabled={stock === 0 || (productContent?.type === "variable" && selectedAttributes.length === 0)}
                    onClick={handleAddToCart}>
                    <ShoppingCart className="mr-2 h-4 w-4 text-white" /> Add to Cart
                </Button>

            )}
            <CartAnimationDialog
                isOpen={showDialog}
                onOpenChange={setShowDialog}
                productImageSrc={productContent?.product_images?.find((image: any) => image.position === "featured") || ""}
            />
        </div>
    );
};

export default ProductContent;
