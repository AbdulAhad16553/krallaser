"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
// import { useToast } from "@/hooks/use-toast"

// Mock user data - in a real app, this would come from your auth system
const userData = {
    id: "user_123",
    name: "Alex Johnson",
    email: "alex.johnson@example.com",
    phone: "+1 (555) 123-4567",
    address: "123 Main Street, Apt 4B",
    city: "New York",
    state: "NY",
    zipCode: "10001",
    country: "United States",
    avatarUrl: "/placeholder.svg?height=100&width=100",
}

export function UserDetails() {
    // const { toast } = useToast()
    const [isEditing, setIsEditing] = useState(false)
    const [formData, setFormData] = useState(userData)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // In a real app, you would send this data to your API
        console.log("Saving user data:", formData)

        // Show success toast
        // toast({
        //     title: "Profile updated",
        //     description: "Your profile information has been updated successfully.",
        // })

        setIsEditing(false)
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-start gap-4 space-y-0">
                <Avatar className="h-16 w-16 border">
                    <AvatarImage src={userData.avatarUrl} alt={userData.name} />
                    <AvatarFallback>
                        {userData.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                    </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                    <CardTitle>{userData.name}</CardTitle>
                    <CardDescription>Member since January 2023</CardDescription>
                </div>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            {isEditing ? (
                                <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
                            ) : (
                                <div className="p-2 border rounded-md bg-muted/20">{userData.name}</div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            {isEditing ? (
                                <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
                            ) : (
                                <div className="p-2 border rounded-md bg-muted/20">{userData.email}</div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            {isEditing ? (
                                <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} />
                            ) : (
                                <div className="p-2 border rounded-md bg-muted/20">{userData.phone}</div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="address">Address</Label>
                            {isEditing ? (
                                <Input id="address" name="address" value={formData.address} onChange={handleChange} />
                            ) : (
                                <div className="p-2 border rounded-md bg-muted/20">{userData.address}</div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="city">City</Label>
                            {isEditing ? (
                                <Input id="city" name="city" value={formData.city} onChange={handleChange} />
                            ) : (
                                <div className="p-2 border rounded-md bg-muted/20">{userData.city}</div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="state">State/Province</Label>
                            {isEditing ? (
                                <Input id="state" name="state" value={formData.state} onChange={handleChange} />
                            ) : (
                                <div className="p-2 border rounded-md bg-muted/20">{userData.state}</div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="zipCode">ZIP/Postal Code</Label>
                            {isEditing ? (
                                <Input id="zipCode" name="zipCode" value={formData.zipCode} onChange={handleChange} />
                            ) : (
                                <div className="p-2 border rounded-md bg-muted/20">{userData.zipCode}</div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="country">Country</Label>
                            {isEditing ? (
                                <Input id="country" name="country" value={formData.country} onChange={handleChange} />
                            ) : (
                                <div className="p-2 border rounded-md bg-muted/20">{userData.country}</div>
                            )}
                        </div>
                    </div>

                    {isEditing && (
                        <div className="flex justify-end mt-6 space-x-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setFormData(userData)
                                    setIsEditing(false)
                                }}
                            >
                                Cancel
                            </Button>
                            <Button type="submit">Save Changes</Button>
                        </div>
                    )}
                </form>
            </CardContent>
            {!isEditing && (
                <CardFooter>
                    <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
                </CardFooter>
            )}
        </Card>
    )
}

