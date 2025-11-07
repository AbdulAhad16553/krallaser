"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Plus, Edit, Trash2 } from "lucide-react";

interface AddressesProps {
    userData: any;
    storeId: string;
}

interface AddressFormData {
    name: string;
    address: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
    phone: string;
    isDefault: boolean;
}

const Addresses = ({ userData, storeId }: AddressesProps) => {
    const [addresses, setAddresses] = useState<any[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm<AddressFormData>();

    const onSubmit = async (data: AddressFormData) => {
        try {
            // In a real implementation, you would save address to ERPNext
            console.log("Address data:", data);
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            if (editingId) {
                // Update existing address
                setAddresses(prev => prev.map(addr => 
                    addr.id === editingId ? { ...addr, ...data } : addr
                ));
                toast.success("Address updated successfully!");
            } else {
                // Add new address
                const newAddress = { id: Date.now().toString(), ...data };
                setAddresses(prev => [...prev, newAddress]);
                toast.success("Address added successfully!");
            }
            
            reset();
            setIsAdding(false);
            setEditingId(null);
            
        } catch (error) {
            console.error("Error saving address:", error);
            toast.error("Failed to save address");
        }
    };

    const handleEdit = (address: any) => {
        setEditingId(address.id);
        setIsAdding(true);
        // In a real implementation, you would populate the form with address data
    };

    const handleDelete = async (addressId: string) => {
        try {
            // In a real implementation, you would delete address from ERPNext
            setAddresses(prev => prev.filter(addr => addr.id !== addressId));
            toast.success("Address deleted successfully!");
        } catch (error) {
            console.error("Error deleting address:", error);
            toast.error("Failed to delete address");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Addresses</h2>
                <Button onClick={() => setIsAdding(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Address
                </Button>
            </div>

            {isAdding && (
                <Card>
                    <CardHeader>
                        <CardTitle>
                            {editingId ? "Edit Address" : "Add New Address"}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div>
                                <Label htmlFor="name">Address Name</Label>
                                <Input
                                    id="name"
                                    placeholder="e.g., Home, Office"
                                    {...register("name", { required: "Address name is required" })}
                                />
                                {errors.name && (
                                    <p className="text-red-600 text-sm">{errors.name.message}</p>
                                )}
                            </div>
                            
                            <div>
                                <Label htmlFor="address">Address</Label>
                                <Textarea
                                    id="address"
                                    placeholder="Enter your full address"
                                    {...register("address", { required: "Address is required" })}
                                />
                                {errors.address && (
                                    <p className="text-red-600 text-sm">{errors.address.message}</p>
                                )}
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
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
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="country">Country</Label>
                                    <Input
                                        id="country"
                                        defaultValue="Pakistan"
                                        {...register("country", { required: "Country is required" })}
                                    />
                                    {errors.country && (
                                        <p className="text-red-600 text-sm">{errors.country.message}</p>
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
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input
                                    id="phone"
                                    {...register("phone", { required: "Phone number is required" })}
                                />
                                {errors.phone && (
                                    <p className="text-red-600 text-sm">{errors.phone.message}</p>
                                )}
                            </div>
                            
                            <div className="flex gap-2">
                                <Button type="submit">
                                    {editingId ? "Update Address" : "Add Address"}
                                </Button>
                                <Button 
                                    type="button" 
                                    variant="outline"
                                    onClick={() => {
                                        setIsAdding(false);
                                        setEditingId(null);
                                        reset();
                                    }}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            <div className="grid gap-4">
                {addresses.length === 0 ? (
                    <Card>
                        <CardContent className="text-center py-8">
                            <p className="text-muted-foreground">No addresses saved yet.</p>
                            <Button 
                                variant="outline" 
                                className="mt-4"
                                onClick={() => setIsAdding(true)}
                            >
                                Add Your First Address
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    addresses.map((address) => (
                        <Card key={address.id}>
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-semibold">{address.name}</h3>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {address.address}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {address.city}, {address.state} {address.zipCode}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {address.country}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Phone: {address.phone}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleEdit(address)}
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDelete(address.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};

export default Addresses;