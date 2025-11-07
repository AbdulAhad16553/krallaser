"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/currencyUtils";

interface OrderSummaryProps {
    storeCurrency: string;
}

const OrderSummary = ({ storeCurrency }: OrderSummaryProps) => {
    const [cartItems, setCartItems] = useState<any[]>([]);

    useEffect(() => {
        const handleCartUpdate = () => {
            const cartDataString = localStorage.getItem("cart");
            const cartData = cartDataString ? JSON.parse(cartDataString) : [];
            setCartItems(cartData);
        };

        // Load cart data immediately
        handleCartUpdate();

        // Listen for cart updates
        window.addEventListener("cartUpdated", handleCartUpdate);
        window.addEventListener("storage", handleCartUpdate);

        return () => {
            window.removeEventListener("cartUpdated", handleCartUpdate);
            window.removeEventListener("storage", handleCartUpdate);
        };
    }, []);

    const subtotal = cartItems.reduce((sum, item) => {
        const itemPrice = item.salePrice || item.price || 0;
        return sum + (itemPrice * item.quantity);
    }, 0);
    
    const shipping = subtotal > 0 ? 10 : 0; // Free shipping over certain amount
    const tax = subtotal * 0.1;
    const total = subtotal + shipping + tax;

    if (cartItems.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-center text-muted-foreground">Your cart is empty</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {cartItems.map((item, index) => {
                    const itemPrice = item.salePrice || item.price || 0;
                    const itemTotal = itemPrice * item.quantity;
                    return (
                        <div key={index} className="flex justify-between text-sm">
                            <span className="truncate max-w-[150px]">{item.name} x {item.quantity}</span>
                            <span>{formatPrice(itemTotal, item.currency || storeCurrency)}</span>
                        </div>
                    );
                })}
                
                <Separator />
                
                <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal, storeCurrency)}</span>
                </div>
                
                <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{formatPrice(shipping, storeCurrency)}</span>
                </div>
                
                <div className="flex justify-between">
                    <span>Tax</span>
                    <span>{formatPrice(tax, storeCurrency)}</span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>{formatPrice(total, storeCurrency)}</span>
                </div>
            </CardContent>
        </Card>
    );
};

export default OrderSummary;