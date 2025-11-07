"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface CheckoutProps {
    storeCurrency: string;
    necessary: {
        storeId: string;
        companyId: string;
    };
}

interface ShippingFormFields {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
    paymentMethod: "cash" | "card";
    notes?: string;
}

const Checkout = ({ storeCurrency, necessary }: CheckoutProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors }
    } = useForm<ShippingFormFields>();

    const selectedPaymentMethod = watch("paymentMethod");

    const onSubmit = async (data: ShippingFormFields) => {
        setIsSubmitting(true);
        
        try {
            // In a real implementation, you would create an order in ERPNext
            console.log("Order data:", data);
            
            // Simulate order creation
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            toast.success("Order placed successfully!", {
                description: "Your order has been placed and you will receive a confirmation email shortly."
            });
            
            // Redirect to success page or clear cart
            // router.push("/order-success");
            
        } catch (error) {
            console.error("Error placing order:", error);
            toast.error("Failed to place order", {
                description: "Please try again or contact support."
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <h1 className="text-3xl font-bold">Checkout</h1>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Shipping Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="firstName">First Name</Label>
                                <Input
                                    id="firstName"
                                    {...register("firstName", { required: "First name is required" })}
                                />
                                {errors.firstName && (
                                    <p className="text-red-600 text-sm">{errors.firstName.message}</p>
                                )}
                            </div>
                            <div>
                                <Label htmlFor="lastName">Last Name</Label>
                                <Input
                                    id="lastName"
                                    {...register("lastName", { required: "Last name is required" })}
                                />
                                {errors.lastName && (
                                    <p className="text-red-600 text-sm">{errors.lastName.message}</p>
                                )}
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    {...register("email", { 
                                        required: "Email is required",
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                            message: "Invalid email address"
                                        }
                                    })}
                                />
                                {errors.email && (
                                    <p className="text-red-600 text-sm">{errors.email.message}</p>
                                )}
                            </div>
                            <div>
                                <Label htmlFor="phone">Phone</Label>
                                <Input
                                    id="phone"
                                    {...register("phone", { required: "Phone is required" })}
                                />
                                {errors.phone && (
                                    <p className="text-red-600 text-sm">{errors.phone.message}</p>
                                )}
                            </div>
                        </div>
                        
                        <div>
                            <Label htmlFor="address">Address</Label>
                            <Textarea
                                id="address"
                                {...register("address", { required: "Address is required" })}
                            />
                            {errors.address && (
                                <p className="text-red-600 text-sm">{errors.address.message}</p>
                            )}
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor="city">City</Label>
                                <Input
                                    id="city"
                                    {...register("city", { required: "City is required" })}
                                />
                                {errors.city && (
                                    <p className="text-red-600 text-sm">{errors.city.message}</p>
                                )}
                            </div>
                            <div>
                                <Label htmlFor="state">State</Label>
                                <Input
                                    id="state"
                                    {...register("state", { required: "State is required" })}
                                />
                                {errors.state && (
                                    <p className="text-red-600 text-sm">{errors.state.message}</p>
                                )}
                            </div>
                            <div>
                                <Label htmlFor="zipCode">ZIP Code</Label>
                                <Input
                                    id="zipCode"
                                    {...register("zipCode", { required: "ZIP code is required" })}
                                />
                                {errors.zipCode && (
                                    <p className="text-red-600 text-sm">{errors.zipCode.message}</p>
                                )}
                            </div>
                        </div>
                        
                        <div>
                            <Label htmlFor="country">Country</Label>
                            <Input
                                id="country"
                                {...register("country", { required: "Country is required" })}
                                defaultValue="Pakistan"
                            />
                            {errors.country && (
                                <p className="text-red-600 text-sm">{errors.country.message}</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader>
                        <CardTitle>Payment Method</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <RadioGroup
                            value={selectedPaymentMethod}
                            onValueChange={(value) => setValue("paymentMethod", value as "cash" | "card")}
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="cash" id="cash" />
                                <Label htmlFor="cash">Cash on Delivery</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="card" id="card" />
                                <Label htmlFor="card">Credit/Debit Card</Label>
                            </div>
                        </RadioGroup>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader>
                        <CardTitle>Order Notes (Optional)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            placeholder="Any special instructions for your order..."
                            {...register("notes")}
                        />
                    </CardContent>
                </Card>
                
                <div className="flex justify-end">
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-8 py-2"
                    >
                        {isSubmitting ? "Placing Order..." : "Place Order"}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default Checkout;