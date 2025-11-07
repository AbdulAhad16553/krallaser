"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";

const Cart = () => {
    const [cartCount, setCartCount] = useState<number>(0);

    useEffect(() => {
        const handleWindowLoad = () => {
            const cartDataString = localStorage.getItem("cart");
            const cartData = cartDataString ? JSON.parse(cartDataString) : [];

            if (cartData.length > 0) {
                setCartCount(cartData.length);
            }
        };

        const handleCartUpdate = () => {
            const cartDataString = localStorage.getItem("cart");
            const cartData = cartDataString ? JSON.parse(cartDataString) : [];
            setCartCount(cartData.length);
        };

        // Check cart on mount
        handleWindowLoad();

        // Listen for cart updates
        window.addEventListener("load", handleWindowLoad);
        window.addEventListener("storage", handleWindowLoad);
        window.addEventListener("cartUpdated", handleCartUpdate);

        return () => {
            window.removeEventListener("load", handleWindowLoad);
            window.removeEventListener("storage", handleWindowLoad);
            window.removeEventListener("cartUpdated", handleCartUpdate);
        };
    }, []);

    return (
        <Link href="/cart" className="relative">
            <ShoppingCart className="w-6 h-6" />
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {cartCount}
            </span>
        </Link>
    );
};

export default Cart;
