"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/currencyUtils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface OrderSummaryProps {
    storeCurrency: string;
    necessary?: {
        storeId?: string;
        companyId?: string;
    };
}

const OrderSummary = ({ storeCurrency, necessary }: OrderSummaryProps) => {
    const [cartItems, setCartItems] = useState<any[]>([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [customerForm, setCustomerForm] = useState({
        name: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        notes: ""
    });

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

    const handleInputChange = (field: string, value: string) => {
        setCustomerForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleProceed = () => {
        if (cartItems.length === 0) {
            toast.error("Your cart is empty");
            return;
        }
        setDialogOpen(true);
    };

    const submitOrder = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!customerForm.name || !customerForm.phone || !customerForm.address) {
            toast.error("Please add name, phone, and address");
            return;
        }

        setIsSubmitting(true);

        try {
            const customerResponse = await fetch("/api/customer", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: customerForm.name,
                    phone: customerForm.phone,
                    email: customerForm.email,
                }),
            });

            const customerData = await customerResponse.json();
            if (!customerResponse.ok) {
                throw new Error(customerData?.message || "Failed to create customer");
            }

            const invoiceResponse = await fetch("/api/sale-invoice", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    customer: customerData?.data?.name || customerForm.name,
                    items: cartItems,
                    shipping: {
                        ...customerForm,
                    },
                    companyId: necessary?.companyId,
                    storeId: necessary?.storeId,
                }),
            });

            const invoiceData = await invoiceResponse.json();
            if (!invoiceResponse.ok) {
                throw new Error(invoiceData?.message || "Failed to create sales invoice");
            }

            toast.success("Order created successfully", {
                description: invoiceData?.data?.name ? `Invoice #${invoiceData.data.name}` : "Sales invoice created",
            });

            localStorage.removeItem("cart");
            setCartItems([]);
            window.dispatchEvent(new CustomEvent("cartUpdated"));
            setDialogOpen(false);
        } catch (error: any) {
            toast.error("Unable to complete order", {
                description: error?.message || "Please try again.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

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

                <Button className="w-full" onClick={handleProceed}>
                    Proceed to Checkout
                </Button>
            </CardContent>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Shipping details</DialogTitle>
                        <DialogDescription>Enter your contact and delivery details to place the order.</DialogDescription>
                    </DialogHeader>
                    <form className="space-y-4" onSubmit={submitOrder}>
                        <div className="space-y-2">
                            <Label htmlFor="name">Customer name</Label>
                            <Input
                                id="name"
                                value={customerForm.name}
                                onChange={(e) => handleInputChange("name", e.target.value)}
                                placeholder="John Doe"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email (optional)</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={customerForm.email}
                                    onChange={(e) => handleInputChange("email", e.target.value)}
                                    placeholder="you@example.com"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone</Label>
                                <Input
                                    id="phone"
                                    value={customerForm.phone}
                                    onChange={(e) => handleInputChange("phone", e.target.value)}
                                    placeholder="+92 300 0000000"
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="address">Shipping address</Label>
                            <Textarea
                                id="address"
                                value={customerForm.address}
                                onChange={(e) => handleInputChange("address", e.target.value)}
                                placeholder="Street, house no, area"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="city">City</Label>
                            <Input
                                id="city"
                                value={customerForm.city}
                                onChange={(e) => handleInputChange("city", e.target.value)}
                                placeholder="City"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="notes">Notes (optional)</Label>
                            <Textarea
                                id="notes"
                                value={customerForm.notes}
                                onChange={(e) => handleInputChange("notes", e.target.value)}
                                placeholder="Any delivery instructions"
                            />
                        </div>
                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button
                                variant="outline"
                                type="button"
                                onClick={() => setDialogOpen(false)}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting} className="min-w-[160px]">
                                {isSubmitting ? "Processing..." : "Place Order"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </Card>
    );
};

export default OrderSummary;