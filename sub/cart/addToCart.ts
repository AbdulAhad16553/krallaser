// Simplified cart functionality for ERPNext integration
// In a real implementation, you would integrate with ERPNext's cart/order system

export const AddToCart = (product: any, quantity: number = 1) => {
    try {
        // Get existing cart from localStorage
        const existingCart = JSON.parse(localStorage.getItem("cart") || "[]");
        
        // Create a unique identifier for cart items
        // For variations, use variationId + selectedAttributes to create unique key
        let uniqueId = product.id;
        if (product.isVariation && product.variationId) {
            uniqueId = `${product.id}_${product.variationId}`;
        }
        
        // Check if product already exists in cart
        const existingItemIndex = existingCart.findIndex((item: any) => {
            if (item.isVariation && product.isVariation) {
                return item.id === product.id && item.variationId === product.variationId;
            }
            return item.id === product.id;
        });
        
        if (existingItemIndex > -1) {
            // Update quantity if product exists
            existingCart[existingItemIndex].quantity += quantity;
        } else {
            // Add new product to cart
            const cartItem = {
                id: product.id,
                name: product.name,
                basePrice: product.basePrice || product.price || 0,
                salePrice: product.salePrice || product.price || 0,
                price: product.salePrice || product.basePrice || product.price || 0,
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
                type: product.type || "item",
                product_id: product.id
            };
            existingCart.push(cartItem);
        }
        
        // Save updated cart to localStorage
        localStorage.setItem("cart", JSON.stringify(existingCart));
        
        // Dispatch custom event to notify components
        window.dispatchEvent(new CustomEvent("cartUpdated"));
        
        return { success: true, message: "Product added to cart" };
    } catch (error) {
        console.error("Error adding to cart:", error);
        return { success: false, message: "Failed to add product to cart" };
    }
};