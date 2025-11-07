// Simplified cart functionality for ERPNext integration
// In a real implementation, you would integrate with ERPNext's cart/order system

export const DecreamentQuantity = (productId: string) => {
    try {
        // Get existing cart from localStorage
        const existingCart = JSON.parse(localStorage.getItem("cart") || "[]");
        console.log("Decrementing quantity for product ID:", productId);
        console.log("Current cart:", existingCart);
        
        // Find the product in cart
        const itemIndex = existingCart.findIndex((item: any) => item.id === productId);
        console.log("Found item at index:", itemIndex);
        
        if (itemIndex > -1) {
            if (existingCart[itemIndex].quantity > 1) {
                // Decrease quantity
                existingCart[itemIndex].quantity -= 1;
                console.log("Updated quantity:", existingCart[itemIndex].quantity);
            } else {
                // Remove item if quantity becomes 0
                existingCart.splice(itemIndex, 1);
                console.log("Removed item from cart");
            }
            
            // Save updated cart to localStorage
            localStorage.setItem("cart", JSON.stringify(existingCart));
            
            // Dispatch custom event to notify components
            window.dispatchEvent(new CustomEvent("cartUpdated"));
            
            return { success: true, message: "Quantity updated" };
        }
        
        return { success: false, message: "Product not found in cart" };
    } catch (error) {
        console.error("Error decrementing quantity:", error);
        return { success: false, message: "Failed to update quantity" };
    }
};