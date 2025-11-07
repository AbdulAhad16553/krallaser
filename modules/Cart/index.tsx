"use client"

import React, { useEffect, useState } from 'react'
import CartItem from './components/CartItem'
import CartBundle from './components/CartBundle'
import { useRouter } from 'next/navigation'
import { Separator } from "@/components/ui/separator"
import { Card } from '@/components/ui/card'

interface CartProps {
    storeCurrency: string
}

const Cart = ({ storeCurrency }: CartProps) => {

    const [cart, setCart] = useState<any>([]);
    const router = useRouter();

    useEffect(() => {
        const handleWindowLoad = () => {
            const cartDataString = localStorage.getItem("cart");
            const cartData = cartDataString ? JSON.parse(cartDataString) : [];
            if (cartData.length > 0) {
                setCart(cartData);
            }
        };

        // Load cart data immediately
        handleWindowLoad();

        window.addEventListener("load", handleWindowLoad);

        return () => {
            window.removeEventListener("load", handleWindowLoad);
        };
    }, []);

    // Listen for cart updates from localStorage
    useEffect(() => {
        const handleStorageChange = () => {
            const cartDataString = localStorage.getItem("cart");
            const cartData = cartDataString ? JSON.parse(cartDataString) : [];
            setCart(cartData);
        };

        window.addEventListener("storage", handleStorageChange);
        
        // Also listen for custom cart update events
        window.addEventListener("cartUpdated", handleStorageChange);

        return () => {
            window.removeEventListener("storage", handleStorageChange);
            window.removeEventListener("cartUpdated", handleStorageChange);
        };
    }, []);

    const items = cart.filter((item: any) => item.type === "item");
    const bundles = cart.filter((item: any) => item.type === "bundle");

    return (
        <div className="container mx-auto w-full">
            <div className="grid grid-cols-1 lg:grid-cols-3">
                <div className="lg:col-span-3">
                    <Card className="bg-white rounded-lg border p-4 sm:p-6 space-y-6">
                        {/* Regular Items */}
                        {items.length > 0 && (
                            <div className="space-y-4">
                                <h2 className="text-lg font-semibold">Items</h2>
                                {items.map((item: any, index: number) => (
                                    <CartItem
                                        key={index}
                                        item={item}
                                        storeCurrency={storeCurrency}
                                        showBundleInfo={false}
                                    />
                                ))}
                            </div>
                        )}

                        {items.length > 0 && bundles.length > 0 && <Separator className="my-6" />}

                        {/* Bundles */}
                        {bundles.length > 0 && (
                            <div className="space-y-6">
                                <h2 className="text-lg font-semibold flex items-center gap-2">
                                    Bundles
                                </h2>
                                {bundles.map((bundle: any, index: number) => (
                                    <CartBundle
                                        key={index}
                                        bundle={bundle}
                                        storeCurrency={storeCurrency}
                                    />
                                ))}
                            </div>
                        )}
                    </Card>
                </div>


            </div>
        </div>
    )
}

export default Cart
