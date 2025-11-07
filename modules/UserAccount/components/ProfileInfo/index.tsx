"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Upload, User } from "lucide-react";

interface ProfileInfoProps {
    userData: any;
    storeId: string;
}

interface ProfileFormData {
    displayName: string;
    email: string;
    phoneNumber: string;
    bio?: string;
}

const ProfileInfo = ({ userData, storeId }: ProfileInfoProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [avatar, setAvatar] = useState<string | null>(userData?.avatarUrl || null);
    
    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<ProfileFormData>({
        defaultValues: {
            displayName: userData?.displayName || "",
            email: userData?.email || "",
            phoneNumber: userData?.phoneNumber || "",
            bio: ""
        }
    });

    const onSubmit = async (data: ProfileFormData) => {
        setIsSubmitting(true);
        
        try {
            // In a real implementation, you would update user profile in ERPNext
            console.log("Profile update:", data);
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            toast.success("Profile updated successfully!");
            
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error("Failed to update profile");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // In a real implementation, you would upload the file to your storage system
            const reader = new FileReader();
            reader.onload = (e) => {
                setAvatar(e.target?.result as string);
            };
            reader.readAsDataURL(file);
            toast.success("Avatar updated successfully!");
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center space-x-6">
                        <Avatar className="h-20 w-20">
                            {avatar ? (
                                <AvatarImage src={avatar} alt="Profile" />
                            ) : (
                                <AvatarFallback className="h-20 w-20">
                                    <User className="h-8 w-8" />
                                </AvatarFallback>
                            )}
                        </Avatar>
                        <div>
                            <h3 className="text-lg font-semibold">
                                {userData?.displayName || "User"}
                            </h3>
                            <p className="text-muted-foreground">
                                {userData?.email || "user@example.com"}
                            </p>
                            <div className="mt-2">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatarUpload}
                                    className="hidden"
                                    id="avatar-upload"
                                />
                                <Button variant="outline" size="sm" asChild>
                                    <label htmlFor="avatar-upload" className="cursor-pointer">
                                        <Upload className="h-4 w-4 mr-2" />
                                        Change Avatar
                                    </label>
                                </Button>
                            </div>
                        </div>
                    </div>
                    
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
                            <Label htmlFor="phoneNumber">Phone Number</Label>
                            <Input
                                id="phoneNumber"
                                {...register("phoneNumber", { required: "Phone number is required" })}
                            />
                            {errors.phoneNumber && (
                                <p className="text-red-600 text-sm">{errors.phoneNumber.message}</p>
                            )}
                        </div>
                        
                        <div>
                            <Label htmlFor="bio">Bio (Optional)</Label>
                            <Input
                                id="bio"
                                placeholder="Tell us about yourself..."
                                {...register("bio")}
                            />
                        </div>
                        
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Updating..." : "Update Profile"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default ProfileInfo;