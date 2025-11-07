"use client";

import React, { useState, useEffect } from "react";
import {
  Star,
  Heart,
  Share2,
  ShoppingCart,
  Truck,
  Shield,
  RotateCcw,
  Award,
  ChevronDown,
  ChevronUp,
  Zap,
  Clock,
  Users,
  CheckCircle,
  AlertCircle,
  Info,
  Plus,
  Minus,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import ProductImage from "@/modules/ProductImage";
import { AddToCart } from "@/sub/cart/addToCart";
import QuotationForm from "@/common/QuotationForm";
import { CartAnimationDialog } from "@/common/CartAnimationDialog";
import { MetaEvent } from "@/sub/event/Types";
import { createMetaEvent } from "@/sub/event/CreateMetaEvent";
import { fetchGeoData } from "@/lib/fetchGeoData";
import { useSearchParams } from "next/navigation";
import { formatPrice, getEffectivePrice } from "@/lib/currencyUtils";

// Helper function to calculate stock from current_stock data (from your existing code)
const calculateStockFromCurrentStock = (
  currentStockData: any[],
  sku: string
) => {
  if (!currentStockData || !sku) return 0;

  // Find stock records for this SKU across all warehouses
  const skuStockRecords = currentStockData.filter(
    (stock: any) => stock.sku === sku
  );

  if (skuStockRecords.length === 0) return 0;

  // Sum available quantities across all warehouses for this SKU
  return skuStockRecords.reduce(
    (total: number, stock: any) => total + (stock?.available_quantity || 0),
    0
  );
};

// Helper function to calculate total stock for variable products
const calculateTotalStockForVariableProduct = (
  currentStockData: any[],
  variations: any[]
) => {
  if (!currentStockData || !variations) return 0;

  let totalStock = 0;
  variations.forEach((variation: any) => {
    const variationStock = calculateStockFromCurrentStock(
      currentStockData,
      variation.sku
    );
    totalStock += variationStock;
  });

  return totalStock;
};

interface EnhancedProductPageProps {
  productContent: any;
  necessary: any;
  storeData?: any;
}

const EnhancedProductPage = ({
  productContent,
  necessary,
  storeData,
}: EnhancedProductPageProps) => {
  // Use existing product logic from your ProductContent component
  const searchParams = useSearchParams();
  const fbclid = searchParams.get("fbclid");
  const [showDialog, setShowDialog] = useState(false);
  const [geoDetail, setGeoDetail] = useState<any>({});
  const [quantity, setQuantity] = useState(1);
  const [filterConds, setFilterConds] = useState<any>([]);
  const [variationId, setVariationId] = useState<string | null>(null);
  const [clientUserAgent, setClientUserAgent] = useState<string>("");
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [showFullDescription, setShowFullDescription] = useState(false);
  console.log("fi1111rst", productContent);
  // Calculate stock using your existing logic
  const [stock, setStock] = useState<any>(0);

  const [sku, setSku] = useState("");

  const [prices, setPrices] = useState<any>({
    basePrice: 0,
    salePrice: 0,
  });

  // Get store currency from necessary prop, but prioritize product-specific currency
  const productCurrency =
    productContent?.currency || necessary?.storeCurrency || "Rs.";

  // Dynamic store colors from CSS variables
  const primaryColor = storeData?.store_detail?.primary_color || "#3B82F6";
  const secondaryColor = storeData?.store_detail?.secondary_color || "#1F2937";

  // Mock data for enhanced features (you can replace with real data later)
  const mockReviews = {
    average: 4.5,
    total: 127,
    distribution: [
      { stars: 5, count: 78, percentage: 61 },
      { stars: 4, count: 32, percentage: 25 },
      { stars: 3, count: 12, percentage: 9 },
      { stars: 2, count: 3, percentage: 2 },
      { stars: 1, count: 2, percentage: 2 },
    ],
  };

  const trustSignals = [
    { icon: Truck, text: "Free shipping over $100", color: "text-green-600" },
    { icon: RotateCcw, text: "30-day return policy", color: "text-blue-600" },
    { icon: Shield, text: "2-year warranty", color: "text-purple-600" },
    { icon: Award, text: "Certified quality", color: "text-orange-600" },
  ];

  const urgencyElements = {
    stockLevel: stock || 0,
    viewersCount: 23,
    recentPurchases: 5,
    lastPurchaseTime: "2 hours ago",
  };

  // Use existing attribute change handler logic
  const handleAttributeChange = (attributeId: any, value: any) => {
    setFilterConds((prevConds: any) => {
      const existingIndex = prevConds.findIndex(
        (cond: any) => cond.attribute_id === attributeId
      );

      if (existingIndex > -1) {
        const updatedConds = [...prevConds];
        updatedConds[existingIndex].attribute_value_id = value;
        return updatedConds;
      } else {
        return [
          ...prevConds,
          { attribute_id: attributeId, attribute_value_id: value },
        ];
      }
    });
  };

  // Initialize geo data and user agent (from your existing code)
  useEffect(() => {
    const initializeData = async () => {
      try {
        const geoData = await fetchGeoData();
        setGeoDetail(geoData);
        setClientUserAgent(navigator.userAgent);
      } catch (error) {
        console.error("Error fetching geo data:", error);
      }
    };

    initializeData();
  }, []);

  // Initialize filter conditions and first variation when component mounts
  useEffect(() => {
    if (
      productContent?.type === "variable" &&
      productContent?.product_attributes?.length > 0
    ) {
      const initialFilterConds = productContent.product_attributes.map(
        (attribute: any) => ({
          attribute_id: attribute.id,
          attribute_value_id: attribute.product_attributes_values[0]?.id,
        })
      );

      if (productContent.product_variations?.length > 0) {
        const firstVariation = productContent.product_variations[0];

        setVariationId(firstVariation.id);
        setSku(firstVariation.sku);
        setPrices({
          basePrice: firstVariation.base_price,
          salePrice: firstVariation.sale_price,
        });

        const variationStock = calculateStockFromCurrentStock(
          productContent?.current_stock || [],
          firstVariation.sku
        );
        setStock(variationStock);
      }
    } else {
      // Handle non-variable products
      setSku(productContent?.sku || "");
      setPrices({
        basePrice: productContent?.base_price || 0,
        salePrice: productContent?.sale_price || 0,
      });

      const productStock = calculateStockFromCurrentStock(
        productContent?.current_stock || [],
        productContent?.sku
      );
      setStock(productStock);
    }
  }, [productContent]);

  // Update variation logic (from your existing code)
  useEffect(() => {
    if (productContent?.type === "variable" && filterConds.length > 0) {
      const matchingVariation = productContent.product_variations?.find(
        (variation: any) => {
          // Use the correct attribute structure based on the original implementation
          const isMatch = filterConds.every((condition: any) =>
            variation.product_variation_attributes.some(
              (attribute: any) =>
                attribute.attribute_id === condition.attribute_id &&
                attribute.attribute_value_id === condition.attribute_value_id
            )
          );

          return isMatch;
        }
      );

      if (matchingVariation) {
        setVariationId(matchingVariation.id);
        setSku(matchingVariation.sku);
        setPrices({
          basePrice: matchingVariation.base_price,
          salePrice: matchingVariation.sale_price,
        });

        // Update stock for selected variation
        const variationStock = calculateStockFromCurrentStock(
          productContent?.current_stock || [],
          matchingVariation.sku
        );
        setStock(variationStock);
      } else {
        // Handle case when no variation matches - show price range
        const basePrices = productContent.product_variations.map(
          (variation: any) => variation.base_price
        );
        const salePrices = productContent.product_variations.map(
          (variation: any) => variation.sale_price
        );

        setPrices({
          basePrice: `${Math.min(...basePrices)} - ${Math.max(...basePrices)}`,
          salePrice: `${Math.min(...salePrices)} - ${Math.max(...salePrices)}`,
        });
        setStock(0);
        setSku("-");
        setVariationId(null);
      }
    } else if (
      productContent?.type === "variable" &&
      productContent?.product_variations?.length > 0
    ) {
      // For variable products without selected attributes, show first variation details
      const firstVariation = productContent.product_variations[0];
      setVariationId(firstVariation.id);
      setSku(firstVariation.sku);
      setPrices({
        basePrice: firstVariation.base_price,
        salePrice: firstVariation.sale_price,
      });

      // Update stock for first variation
      const variationStock = calculateStockFromCurrentStock(
        productContent?.current_stock || [],
        firstVariation.sku
      );
      setStock(variationStock);
    }
  }, [filterConds, productContent]);

  // Handle Add to Cart with your existing logic
  const handleAddToCart = async () => {
    try {
      // Create meta event if storeId exists (simplified for now)
      if (necessary.storeId && fbclid && typeof prices.salePrice === "number") {
        try {
          const eventDetails = {
            event_name: "AddToCart",
            event_time: Math.floor(Date.now() / 1000),
            action_source: "website",
            storeId: necessary.storeId,
            user_data: {
              em: [],
              ph: [],
              fn: [],
              ct: [],
              country: [],
              zp: [],
              client_ip_address: geoDetail?.ip || "",
              client_user_agent: clientUserAgent,
            },
            custom_data: {
              currency: productCurrency.replace(".", ""),
              value: parseFloat(prices.salePrice.toString()) * quantity,
              content_category: "product",
              content_name: productContent.name,
              status: "active",
            },
          };

          await createMetaEvent(eventDetails);
        } catch (metaError) {
          console.error("Meta event error:", metaError);
        }
      }

      const cartItem = {
        id: productContent.id,
        name: productContent.name,
        description: productContent.short_description || "",
        type: productContent.type,
        basePrice:
          typeof prices.basePrice === "number"
            ? prices.basePrice
            : parseFloat(prices.basePrice) || 0,
        salePrice:
          typeof prices.salePrice === "number"
            ? prices.salePrice
            : parseFloat(prices.salePrice) || 0,
        category: "product",
        currency: productCurrency,
        bundleItems: [],
        quantity: quantity,
        image: productContent.product_images?.[0]?.image_id,
        sku: sku,
        variationId: variationId,
        filterConds: filterConds,
      };

      AddToCart(cartItem);
      setShowDialog(true);
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
        <span>Home</span>
        <span>/</span>
        <span>Laser Equipment</span>
        <span>/</span>
        <span className="text-foreground font-medium">
          {productContent?.name}
        </span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Enhanced Product Gallery */}
        <div className="space-y-4">
          <ProductImage productImages={productContent?.product_images || []} />

          {/* Social Proof Below Images */}
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {urgencyElements.viewersCount} people viewing this now
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-600">
                Last purchased {urgencyElements.lastPurchaseTime}
              </span>
            </div>
          </div>
        </div>

        {/* Enhanced Product Information */}
        <div className="space-y-6">
          {/* Header Section */}
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                {/* Product Title and Badges */}
                <div className="space-y-3">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {productContent?.name}
                  </h1>

                  <div className="flex items-center gap-3">
                    {/* SKU Display */}
                    <div className="text-sm text-muted-foreground">
                      SKU:{" "}
                      <span className="font-medium text-foreground">
                        {sku || "N/A"}
                      </span>
                    </div>

                    {/* Product Type Badge */}
                    {productContent?.type === "variable" && (
                      <Badge variant="variable" className="text-xs">
                        Variable Product
                      </Badge>
                    )}

                    {/* New Arrival Badge */}
                    {productContent?.new && (
                      <Badge variant="new">New Arrival</Badge>
                    )}
                  </div>
                </div>

                {/* Price Section */}
                <div className="space-y-2">
                  <div className="flex items-baseline gap-3">
                    {prices.salePrice &&
                    prices.salePrice !== prices.basePrice ? (
                      <>
                        <span
                          className="text-3xl font-bold"
                          style={{ color: primaryColor }}
                        >
                          {formatPrice(prices.salePrice, productCurrency)}
                        </span>
                        <span className="text-xl text-muted-foreground line-through">
                          {formatPrice(prices.basePrice, productCurrency)}
                        </span>
                      </>
                    ) : (
                      <span
                        className="text-3xl font-bold"
                        style={{ color: primaryColor }}
                      >
                        {formatPrice(prices.basePrice, productCurrency)}
                      </span>
                    )}
                  </div>

                  {/* Price Range for Variable Products */}
                  {productContent?.type === "variable" && (
                    <div className="text-sm text-muted-foreground">
                      {typeof prices.salePrice === "string"
                        ? "Price varies by configuration"
                        : "Price for selected configuration"}
                    </div>
                  )}
                </div>

                <p className="text-sm text-muted-foreground">
                  Price includes all taxes. No hidden charges.
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsWishlisted(!isWishlisted)}
                >
                  <Heart
                    className={`h-4 w-4 ${
                      isWishlisted ? "text-red-500 fill-red-500" : ""
                    }`}
                  />
                </Button>
                <Button variant="outline" size="icon">
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Stock & Urgency */}
            {!productContent?.enable_quote_request && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  {stock > 0 ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-600">
                        In Stock
                      </span>
                      {stock <= 10 && (
                        <Badge
                          variant="outline"
                          className="text-orange-600 border-orange-600"
                        >
                          Only {stock} left!
                        </Badge>
                      )}
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <span className="text-sm font-medium text-red-600">
                        Out of Stock
                      </span>
                    </>
                  )}
                </div>

                {stock <= 10 && stock > 0 && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Stock level</span>
                      <span className="text-orange-600">{stock} remaining</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min((stock / 50) * 100, 100)}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Show total stock for variable products */}
                {productContent?.type === "variable" && (
                  <div className="text-sm text-muted-foreground">
                    Total stock across all variations:{" "}
                    {calculateTotalStockForVariableProduct(
                      productContent?.current_stock || [],
                      productContent?.product_variations || []
                    )}{" "}
                    units
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Product Variants/Options */}
          {productContent?.product_attributes?.length > 0 && (
            <div className="space-y-4">
              <Separator />
              <div className="space-y-4">
                <h3 className="font-semibold">Configuration Options</h3>
                {productContent.product_attributes.map((attribute: any) => (
                  <div key={attribute.id} className="space-y-2">
                    <Label className="font-medium">{attribute.name}</Label>
                    <RadioGroup
                      defaultValue={attribute.product_attributes_values[0]?.id}
                      onValueChange={(value) =>
                        handleAttributeChange(attribute.id, value)
                      }
                    >
                      <div className="flex flex-wrap gap-2">
                        {attribute.product_attributes_values.map(
                          (value: any) => (
                            <div
                              key={value.id}
                              className="flex items-center space-x-2"
                            >
                              <RadioGroupItem value={value.id} id={value.id} />
                              <Label
                                htmlFor={value.id}
                                className="cursor-pointer px-3 py-2 border rounded-md hover:bg-muted transition-colors"
                                style={{
                                  borderColor: filterConds.some(
                                    (cond: any) =>
                                      cond.attribute_value_id === value.id
                                  )
                                    ? primaryColor
                                    : undefined,
                                  backgroundColor: filterConds.some(
                                    (cond: any) =>
                                      cond.attribute_value_id === value.id
                                  )
                                    ? `${primaryColor}10`
                                    : undefined,
                                }}
                              >
                                {value.value}
                              </Label>
                            </div>
                          )
                        )}
                      </div>
                    </RadioGroup>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Simple Variant List for Template Products */}
          {productContent?.type === "variable" && 
           productContent?.product_variations?.length > 0 && 
           (!productContent?.product_attributes || productContent?.product_attributes?.length === 0) && (
            <div className="space-y-4">
              <Separator />
              <div className="space-y-4">
                <h3 className="font-semibold">Available Variants</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {productContent.product_variations.map((variant: any, index: number) => {
                    const variantStock = variant.stock?.totalStock || 0;
                    return (
                      <Card key={variant.id || index} className="p-3 hover:shadow-md transition-shadow">
                        <CardContent className="p-0">
                          <div className="space-y-2">
                            <h4 className="font-medium text-sm">{variant.sku}</h4>
                            <div className="text-xs text-muted-foreground">
                              SKU: {variant.sku}
                            </div>
                            {variant.product_variation_attributes?.length > 0 && (
                              <div className="text-xs">
                                {variant.product_variation_attributes.map((attr: any, attrIndex: number) => (
                                  <span key={attrIndex} className="inline-block bg-gray-100 px-2 py-1 rounded mr-1 mb-1">
                                    {attr.attribute_value || attr.value}
                                  </span>
                                ))}
                              </div>
                            )}
                            
                            {/* Stock Information for this variation */}
                            <div className="flex items-center gap-2 text-xs">
                              {variantStock > 0 ? (
                                <div className="flex items-center gap-1">
                                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                  <span className="text-green-700 font-medium">
                                    {variantStock} in stock
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
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Variant Stock Details Section */}
          {productContent?.type === "variable" && 
           productContent?.product_variations?.length > 0 && (
            <div className="space-y-4">
              <Separator />
              <div className="space-y-4">
                <h3 className="font-semibold">Stock Details by Variant</h3>
                <div className="space-y-3">
                  {productContent.product_variations.map((variant: any, index: number) => {
                    const variantStock = variant.stock?.totalStock || 0;
                    const variantBins = variant.stock?.bins || [];
                    
                    return (
                      <Card key={variant.id || index} className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{variant.sku}</h4>
                            <div className="flex items-center gap-2">
                              {variantStock > 0 ? (
                                <div className="flex items-center gap-1">
                                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                  <span className="text-green-700 font-medium text-sm">
                                    {variantStock} in stock
                                  </span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1">
                                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                  <span className="text-red-700 font-medium text-sm">
                                    Out of stock
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {variantBins.length > 0 && (
                            <div className="text-xs text-gray-600">
                              <div className="font-medium mb-1">Warehouse Details:</div>
                              {variantBins.map((bin: any, binIndex: number) => (
                                <div key={binIndex} className="flex justify-between py-1">
                                  <span>{bin.warehouse}:</span>
                                  <span className="font-medium">{bin.actual_qty} units</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Quantity & Add to Cart */}
          <div className="space-y-4">
            <Separator />
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Label className="font-medium">Quantity:</Label>
                <div className="flex items-center border rounded-md">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="px-4 py-2 min-w-[60px] text-center">
                    {quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={quantity >= urgencyElements.stockLevel}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <span className="text-sm text-muted-foreground">
                  {typeof prices.salePrice === "string"
                    ? "Select configuration to see total"
                    : `Total: ${formatPrice(
                        prices.salePrice * quantity,
                        productCurrency
                      )}`}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  size="lg"
                  className="flex-1 h-12 text-base font-semibold text-white hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: primaryColor }}
                  disabled={stock === 0}
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Add to Cart
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1 h-12 transition-all duration-200"
                  style={{ borderColor: primaryColor, color: primaryColor }}
                  disabled={stock === 0}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = primaryColor;
                    e.currentTarget.style.color = "white";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = primaryColor;
                  }}
                >
                  <Zap className="mr-2 h-5 w-5" />
                  Buy Now
                </Button>
              </div>

              {/* Quote Request for B2B */}
              {productContent?.enable_quote_request && (
                <div className="space-y-3">
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground mb-2">
                      Need a custom quote or have specific requirements?
                    </div>
                    <QuotationForm
                      productName={productContent?.name || "Product"}
                      productSku={sku || productContent?.sku || "N/A"}
                      necessary={{
                        companyId: necessary?.companyId,
                        storeId: necessary?.storeId,
                      }}
                      variationInfo={
                        productContent?.type === "variable" && variationId
                          ? productContent?.product_variations
                              ?.find((v: any) => v.id === variationId)
                              ?.product_variation_attributes?.map(
                                (attr: any) =>
                                  `${attr?.product_attribute?.name}: ${attr?.product_attributes_value?.value}`
                              )
                              ?.join(", ")
                          : undefined
                      }
                    />
                  </div>
                  <div className="text-xs text-center text-muted-foreground">
                    Our team will review your requirements and get back to you
                    within 24 hours
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Trust Signals */}
          <div className="space-y-3">
            <Separator />
            <div className="grid grid-cols-2 gap-3">
              {trustSignals.map((signal, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-3 bg-muted/30 rounded-md"
                >
                  <signal.icon className={`h-4 w-4 ${signal.color}`} />
                  <span className="text-sm font-medium">{signal.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Specs */}
          <div className="space-y-3">
            <Separator />
            <div className="space-y-2">
              <h3 className="font-semibold">Key Specifications</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">SKU:</span>
                  <span className="font-medium">{productContent?.sku}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Brand:</span>
                  <span className="font-medium">Laser Fly</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Power:</span>
                  <span className="font-medium">20W-200W</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Warranty:</span>
                  <span className="font-medium">2 Years</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Product Details Tabs */}
      <div className="mt-12">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList
            className={`grid w-full ${
              productContent?.enable_quote_request
                ? "grid-cols-6"
                : "grid-cols-5"
            }`}
          >
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="specifications">Specifications</TabsTrigger>
            <TabsTrigger value="reviews">
              Reviews ({mockReviews.total})
            </TabsTrigger>
            <TabsTrigger value="shipping">Shipping & Returns</TabsTrigger>
            <TabsTrigger value="support">Support</TabsTrigger>
            {productContent?.enable_quote_request && (
              <TabsTrigger value="quote">Quote Request</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <div className="prose max-w-none">
                  <h3 className="text-xl font-semibold mb-4">
                    Product Overview
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {productContent?.short_description}
                  </p>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Key Features</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                        <li>
                          High-precision laser cutting with excellent accuracy
                        </li>
                        <li>Suitable for metals and plastics processing</li>
                        <li>Industrial and commercial applications</li>
                        <li>Minimal maintenance requirements</li>
                      </ul>
                    </div>

                    {productContent?.detailed_desc && (
                      <div>
                        <h4 className="font-semibold mb-2">
                          Detailed Description
                        </h4>
                        <div
                          className={`text-sm text-muted-foreground ${
                            !showFullDescription ? "line-clamp-3" : ""
                          }`}
                          dangerouslySetInnerHTML={{
                            __html: productContent.detailed_desc,
                          }}
                        />
                        <Button
                          variant="link"
                          className="p-0 h-auto mt-2"
                          onClick={() =>
                            setShowFullDescription(!showFullDescription)
                          }
                        >
                          {showFullDescription ? "Show Less" : "Read More"}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="specifications" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">
                  Technical Specifications
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-primary">
                      RF Marking Machine
                    </h4>
                    <dl className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Laser Power:</dt>
                        <dd className="font-medium">20W-200W</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Wavelength:</dt>
                        <dd className="font-medium">1064nm</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">
                          Character Size:
                        </dt>
                        <dd className="font-medium">0.15mm</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">
                          Repeatability:
                        </dt>
                        <dd className="font-medium">±0.002mm</dd>
                      </div>
                    </dl>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-primary">
                      UV Laser Marking
                    </h4>
                    <dl className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Laser Power:</dt>
                        <dd className="font-medium">3W-20W</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Wavelength:</dt>
                        <dd className="font-medium">355nm</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">
                          Character Size:
                        </dt>
                        <dd className="font-medium">0.15mm</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">
                          Power Requirements:
                        </dt>
                        <dd className="font-medium">220V±5% / 50Hz / 10A</dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Reviews Summary */}
              <Card>
                <CardContent className="p-6">
                  <div className="text-center space-y-4">
                    <div>
                      <div className="text-3xl font-bold">
                        {mockReviews.average}
                      </div>
                      <div className="flex justify-center gap-1 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(mockReviews.average)
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-muted-foreground"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Based on {mockReviews.total} reviews
                      </p>
                    </div>

                    <div className="space-y-2">
                      {mockReviews.distribution.map((dist) => (
                        <div
                          key={dist.stars}
                          className="flex items-center gap-2 text-sm"
                        >
                          <span className="w-8">{dist.stars}★</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${dist.percentage}%` }}
                            ></div>
                          </div>
                          <span className="w-8 text-muted-foreground">
                            {dist.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Reviews */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Customer Reviews</h3>
                  <Button variant="outline">Write a Review</Button>
                </div>

                {/* Mock Reviews */}
                <div className="space-y-4">
                  {[1, 2, 3].map((review) => (
                    <Card key={review}>
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="flex gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className="h-3 w-3 text-yellow-400 fill-yellow-400"
                                  />
                                ))}
                              </div>
                              <span className="font-medium">John D.</span>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              2 days ago
                            </span>
                          </div>
                          <p className="text-sm">
                            Excellent laser marking machine! The precision is
                            outstanding and it handles both metals and plastics
                            perfectly. Great investment for our manufacturing
                            facility.
                          </p>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">Verified Purchase</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="shipping" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-4">
                      Shipping Information
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <h4 className="font-semibold">Delivery Options</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          <li>
                            • Standard Delivery (5-7 business days) - Free
                          </li>
                          <li>• Express Delivery (2-3 business days) - $49</li>
                          <li>
                            • White Glove Delivery (Installation included) -
                            $199
                          </li>
                        </ul>
                      </div>
                      <div className="space-y-3">
                        <h4 className="font-semibold">Return Policy</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          <li>• 30-day return window</li>
                          <li>• Free return shipping</li>
                          <li>• Full refund on unused items</li>
                          <li>• Restocking fee may apply</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="support" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold">Support & Warranty</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold">Technical Support</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• 24/7 phone support</li>
                        <li>• Live chat assistance</li>
                        <li>• Remote diagnostic support</li>
                        <li>• On-site service available</li>
                      </ul>
                    </div>
                    <div className="space-y-4">
                      <h4 className="font-semibold">Warranty Coverage</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• 2-year comprehensive warranty</li>
                        <li>• Parts and labor included</li>
                        <li>• Extended warranty options</li>
                        <li>• Training and documentation</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Quote Request Tab */}
          {productContent?.enable_quote_request && (
            <TabsContent value="quote" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div className="text-center space-y-4">
                      <h3 className="text-xl font-semibold">
                        Request a Custom Quote
                      </h3>
                      <p className="text-muted-foreground max-w-2xl mx-auto">
                        Need a custom configuration or have specific
                        requirements? Our team of experts will review your needs
                        and provide you with a personalized quote tailored to
                        your project.
                      </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h4 className="font-semibold">Why Request a Quote?</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          <li>• Custom configurations available</li>
                          <li>• Bulk order discounts</li>
                          <li>• Special project requirements</li>
                          <li>• Technical consultation included</li>
                          <li>• Flexible payment terms</li>
                        </ul>
                      </div>
                      <div className="space-y-4">
                        <h4 className="font-semibold">What You'll Get</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          <li>• Detailed technical specifications</li>
                          <li>• Custom pricing breakdown</li>
                          <li>• Delivery timeline</li>
                          <li>• Installation support options</li>
                          <li>• Warranty and service details</li>
                        </ul>
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="text-sm text-muted-foreground mb-4">
                        Ready to get started? Fill out the form below and we'll
                        respond within 24 hours.
                      </div>
                      <QuotationForm
                        productName={productContent?.name || "Product"}
                        productSku={sku || productContent?.sku || "N/A"}
                        necessary={{
                          companyId: necessary?.companyId,
                          storeId: necessary?.storeId,
                        }}
                        variationInfo={
                          productContent?.type === "variable" && variationId
                            ? productContent?.product_variations
                                ?.find((v: any) => v.id === variationId)
                                ?.product_variation_attributes?.map(
                                  (attr: any) =>
                                    `${attr?.product_attribute?.name}: ${attr?.product_attributes_value?.value}`
                                )
                                ?.join(", ")
                            : undefined
                        }
                      />
                    </div>

                    <div className="bg-muted/30 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">
                        Quote Request Process
                      </h4>
                      <div className="grid md:grid-cols-4 gap-4 text-sm">
                        <div className="text-center">
                          <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-2 text-xs font-bold">
                            1
                          </div>
                          <div className="font-medium">Submit Request</div>
                          <div className="text-muted-foreground">
                            Fill out the form with your requirements
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-2 text-xs font-bold">
                            2
                          </div>
                          <div className="font-medium">Review</div>
                          <div className="text-muted-foreground">
                            Our team reviews your requirements
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-2 text-xs font-bold">
                            3
                          </div>
                          <div className="font-medium">Quote</div>
                          <div className="text-muted-foreground">
                            Receive detailed quote within 24 hours
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-2 text-xs font-bold">
                            4
                          </div>
                          <div className="font-medium">Follow-up</div>
                          <div className="text-muted-foreground">
                            Discuss and finalize your order
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>

      {/* Cart Animation Dialog */}
      <CartAnimationDialog
        isOpen={showDialog}
        onOpenChange={setShowDialog}
        productImageSrc={productContent?.images?.[0] || null}
      />
    </div>
  );
};

export default EnhancedProductPage;
