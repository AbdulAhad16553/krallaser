"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface AccountSettingsProps {
    userData: any;
    storeId: string;
}

interface SettingsFormData {
    displayName: string;
    email: string;
    phone: string;
    bio?: string;
}

const AccountSettings = ({ userData, storeId }: AccountSettingsProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<SettingsFormData>({
        defaultValues: {
            displayName: userData?.displayName || "",
            email: userData?.email || "",
            phone: userData?.phoneNumber || "",
            bio: ""
        }
    });

    const onSubmit = async (data: SettingsFormData) => {
        setIsSubmitting(true);
        
        try {
            // In a real implementation, you would update user data in ERPNext
            console.log("Settings update:", data);
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            toast.success("Settings updated successfully!");
            
        } catch (error) {
            console.error("Error updating settings:", error);
            toast.error("Failed to update settings");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Account Settings</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                            <Label htmlFor="displayName">Display Name</Label>
                            <Input
                                id="displayName"
                                {...register("displayName", { required: "Display name is required" })}
                            />
                            {errors.displayName && (
                                <p className="text-red-600 text-sm">{errors.displayName.message}</p>
                            )}
                        </div>
                        
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
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                                id="phone"
                                {...register("phone", { required: "Phone number is required" })}
                            />
                            {errors.phone && (
                                <p className="text-red-600 text-sm">{errors.phone.message}</p>
                            )}
                        </div>
                        
                        <div>
                            <Label htmlFor="bio">Bio (Optional)</Label>
                            <Textarea
                                id="bio"
                                placeholder="Tell us about yourself..."
                                {...register("bio")}
                            />
                        </div>
                        
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Updating..." : "Update Settings"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle>Security</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <h4 className="font-medium mb-2">Change Password</h4>
                        <p className="text-sm text-muted-foreground mb-4">
                            Update your password to keep your account secure.
                        </p>
                        <Button variant="outline">
                            Change Password
                        </Button>
                    </div>
                    
                    <div>
                        <h4 className="font-medium mb-2">Two-Factor Authentication</h4>
                        <p className="text-sm text-muted-foreground mb-4">
                            Add an extra layer of security to your account.
                        </p>
                        <Button variant="outline">
                            Enable 2FA
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AccountSettings;