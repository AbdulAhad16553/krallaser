// Simplified cart functionality for ERPNext integration
// In a real implementation, you would integrate with ERPNext's cart/order system

export const RemoveFromCart = (productId: string) => {
    try {
        // Get existing cart from localStorage
        const existingCart = JSON.parse(localStorage.getItem("cart") || "[]");
        console.log("Removing product with ID:", productId);
        console.log("Current cart:", existingCart);
        
        // Remove the product from cart
        const updatedCart = existingCart.filter((item: any) => item.id !== productId);
        console.log("Updated cart:", updatedCart);
        
        // Save updated cart to localStorage
        localStorage.setItem("cart", JSON.stringify(updatedCart));
        
        // Dispatch custom event to notify components
        window.dispatchEvent(new CustomEvent("cartUpdated"));
        
        return { success: true, message: "Product removed from cart" };
    } catch (error) {
        console.error("Error removing from cart:", error);
        return { success: false, message: "Failed to remove product from cart" };
    }
};