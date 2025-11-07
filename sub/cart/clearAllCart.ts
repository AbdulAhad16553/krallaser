// Simplified cart functionality for ERPNext integration
// In a real implementation, you would integrate with ERPNext's cart/order system

export const clearAllCart = () => {
    try {
        // Clear cart from localStorage
        localStorage.setItem("cart", JSON.stringify([]));
        
        // Dispatch custom event to notify components
        window.dispatchEvent(new CustomEvent("cartUpdated"));
        
        return { success: true, message: "Cart cleared successfully" };
    } catch (error) {
        console.error("Error clearing cart:", error);
        return { success: false, message: "Failed to clear cart" };
    }
};