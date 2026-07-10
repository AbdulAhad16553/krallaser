import { trackAddToCart, currencyCode } from "@/lib/metaPixel";

// Simplified cart functionality for ERPNext integration
// In a real implementation, you would integrate with ERPNext's cart/order system

export const AddToCart = (product: any, quantity: number = 1) => {
    try {
        // Get existing cart from sessionStorage
        const existingCart = JSON.parse(sessionStorage.getItem("cart") || "[]");
        
        // Create a unique identifier for cart items
        // For variations, use variationId + selectedAttributes to create unique key
        let uniqueId = product.id;
        if (product.isVariation && product.variationId) {
            uniqueId = `${product.id}_${product.variationId}`;
        }

        const basePrice = Number(product.basePrice ?? product.price ?? 0) || 0;
        const salePrice =
          Number(product.salePrice ?? product.price ?? basePrice) || 0;
        const unitPrice = salePrice > 0 ? salePrice : basePrice;
        
        // Check if product already exists in cart
        const existingItemIndex = existingCart.findIndex((item: any) => {
            if (item.isVariation && product.isVariation) {
                return item.id === product.id && item.variationId === product.variationId;
            }
            return item.id === product.id;
        });
        
        if (existingItemIndex > -1) {
            // Update quantity and refresh sale pricing
            existingCart[existingItemIndex].quantity += quantity;
            existingCart[existingItemIndex].basePrice = basePrice;
            existingCart[existingItemIndex].salePrice = unitPrice;
            existingCart[existingItemIndex].price = unitPrice;
        } else {
            // Add new product to cart
            const cartItem = {
                id: product.id,
                name: product.name,
                basePrice,
                salePrice: unitPrice,
                price: unitPrice,
                quantity: quantity,
                image: {
                    image_id: product.image?.image_id || product.image
                },
                sku: product.sku,
                // Add variation-specific data
                variationId: product.variationId,
                selectedAttributes: product.selectedAttributes,
                isVariation: product.isVariation,
                variation: product.variation,
                currency: product.currency,
                category: product.category,
                item_group: product.item_group || product.category,
                type: product.type || "item",
                product_id: product.id
            };
            existingCart.push(cartItem);
        }
        
        // Save updated cart to sessionStorage
        sessionStorage.setItem("cart", JSON.stringify(existingCart));
        
        // Dispatch custom event to notify components
        window.dispatchEvent(new CustomEvent("cartUpdated"));

        const contentId = String(
          product.sku || product.variationId || product.id || uniqueId || ""
        );
        trackAddToCart({
          content_name: product.name || contentId,
          content_ids: contentId ? [contentId] : undefined,
          content_category: product.item_group || product.category,
          currency: currencyCode(product.currency),
          value: unitPrice * quantity,
          contents: contentId
            ? [{ id: contentId, quantity, item_price: unitPrice }]
            : undefined,
        });
        
        return { success: true, message: "Product added to cart" };
    } catch (error) {
        console.error("Error adding to cart:", error);
        return { success: false, message: "Failed to add product to cart" };
    }
};
