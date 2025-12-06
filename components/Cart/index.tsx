
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";

const Cart = () => {
  const [cartCount, setCartCount] = useState<number>(0);

  useEffect(() => {
    const updateCartCount = () => {
      const stored = localStorage.getItem("cart");
      const items = stored ? JSON.parse(stored) : [];
      setCartCount(items.length);
    };

    updateCartCount();
    window.addEventListener("load", updateCartCount);
    window.addEventListener("storage", updateCartCount);
    window.addEventListener("cartUpdated", updateCartCount);

    return () => {
      window.removeEventListener("load", updateCartCount);
      window.removeEventListener("storage", updateCartCount);
      window.removeEventListener("cartUpdated", updateCartCount);
    };
  }, []);

  return (
    <Link
      href="/cart"
      className="
        relative
        p-2 rounded-full
        backdrop-blur-md bg-white/40 
        shadow-lg border border-white/20
        transition-all duration-300
        hover:scale-110 active:scale-95
        hover:shadow-2xl
        hover:bg-white/60
        group
      "
    >
      {/* Glow Ring */}
      <span
        className="
          absolute inset-0 rounded-full opacity-0 
          group-hover:opacity-100
          transition-opacity duration-300
          pointer-events-none
          bg-gradient-to-r from-red-500/40 to-pink-500/40
          blur-xl
        "
      ></span>

      {/* Icon */}
      <ShoppingCart
        className="
          relative z-10 w-7 h-7 text-gray-700
          group-hover:text-black
          transition-colors duration-300
        "
      />

      {/* Floating Badge */}
      {cartCount > 0 && (
        <span
          className="
            absolute -top-1 -right-1
            h-6 min-w-6 text-[11px]
            flex items-center justify-center
            rounded-full font-semibold
            text-white
            bg-gradient-to-br from-red-500 to-red-600
            shadow-lg shadow-red-300
            animate-bounce
            px-1
          "
        >
          {cartCount}
        </span>
      )}
    </Link>
  );
};

export default Cart;
