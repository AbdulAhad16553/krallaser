// Simplified cart functionality for ERPNext integration
// In a real implementation, you would integrate with ERPNext's cart/order system

export const IncreamentQuantity = (productId: string) => {
    try {
        // Get existing cart from localStorage
        const existingCart = JSON.parse(localStorage.getItem("cart") || "[]");
        console.log("Incrementing quantity for product ID:", productId);
        console.log("Current cart:", existingCart);
        
        // Find the product in cart
        const itemIndex = existingCart.findIndex((item: any) => item.id === productId);
        console.log("Found item at index:", itemIndex);
        
        if (itemIndex > -1) {
            // Increase quantity
            existingCart[itemIndex].quantity += 1;
            console.log("Updated quantity:", existingCart[itemIndex].quantity);
            
            // Save updated cart to localStorage
            localStorage.setItem("cart", JSON.stringify(existingCart));
            
            // Dispatch custom event to notify components
            window.dispatchEvent(new CustomEvent("cartUpdated"));
            
            return { success: true, message: "Quantity updated" };
        }
        
        return { success: false, message: "Product not found in cart" };
    } catch (error) {
        console.error("Error incrementing quantity:", error);
        return { success: false, message: "Failed to update quantity" };
    }
};