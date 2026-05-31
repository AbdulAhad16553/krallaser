"use client";

import React from "react";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCartCount } from "@/hooks/useCartCount";

interface CartProps {
  /** Light header variant for white mobile app bar; onGradient for desktop brand header */
  variant?: "default" | "light" | "onGradient";
}

const Cart = ({ variant = "default" }: CartProps) => {
  const cartCount = useCartCount();

  const light =
    variant === "light"
      ? "p-1.5 rounded-full bg-neutral-100 border border-neutral-200/80 shadow-none hover:bg-neutral-200/80"
      : variant === "onGradient"
        ? "rounded-md p-2 text-white transition-colors hover:bg-white/15 group"
        : `
        p-2 rounded-full
        backdrop-blur-md bg-white/40 
        shadow-lg border border-white/20
        hover:shadow-2xl
        hover:bg-white/60
        group
      `;

  return (
    <Link
      href="/cart"
      className={`
        relative
        transition-all duration-300
        hover:scale-110 active:scale-95
        ${light}
        ${variant === "default" ? "group" : ""}
      `}
    >
      {variant === "default" && (
        <span
          className="
          absolute inset-0 rounded-full opacity-0 
          group-hover:opacity-100
          transition-opacity duration-300
          pointer-events-none
          bg-gradient-to-r from-red-500/40 to-pink-500/40
          blur-xl
        "
        />
      )}

      <ShoppingCart
        className={`relative z-10 transition-colors duration-300 ${
          variant === "light"
            ? "w-6 h-6 text-neutral-700"
            : variant === "onGradient"
              ? "h-6 w-6 text-white group-hover:text-red-100"
              : "w-7 h-7 text-gray-700 group-hover:text-black"
        }`}
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
