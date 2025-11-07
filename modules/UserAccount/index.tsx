"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ProfileInfo from "./components/ProfileInfo"
import OrderHistory from "./components/OrderHistory"
import AccountSettings from "./components/AccountSettings"
import { PaymentMethods } from "./components/PaymentMethods"
import Addresses from "./components/Addresses"
// Removed Nhost authentication - using mock authentication for now

interface UserAccountProps {
    necessary: {
        storeId: string;
        companyId: string;
        storeCurrency: string
    }
}

const UserAccount = ({ necessary }: UserAccountProps) => {

    const [activeTab, setActiveTab] = useState("profile")
    // Mock user data - in a real implementation, you'd get this from your auth system
    const userData = { id: 'mock-user-id', displayName: 'User' }
    // console.log("userData", userData)

    return (
        <Card className="border-none shadow-none">
            <CardHeader className="px-0">
                <CardTitle className="text-2xl">Welcome back, {userData?.displayName}</CardTitle>
                <CardDescription>Manage your account information, track orders, and update your preferences</CardDescription>
            </CardHeader>
            <CardContent className="px-0">
                <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid grid-cols-2 md:grid-cols-5 mb-8">
                        <TabsTrigger value="profile">Profile</TabsTrigger>
                        <TabsTrigger value="orders">Orders</TabsTrigger>
                        <TabsTrigger value="addresses">Addresses</TabsTrigger>
                        <TabsTrigger value="payment">Payment</TabsTrigger>
                        <TabsTrigger value="settings">Settings</TabsTrigger>
                    </TabsList>

                    <TabsContent value="profile">
                        <ProfileInfo userData={userData} storeId={necessary?.storeId} />
                    </TabsContent>

                    <TabsContent value="orders">
                        <OrderHistory userData={userData} storeId={necessary?.storeId} />
                    </TabsContent>

                    <TabsContent value="addresses">
                        <Addresses userData={userData} storeId={necessary?.storeId} />
                    </TabsContent>

                    <TabsContent value="payment">
                        <PaymentMethods />
                    </TabsContent>

                    <TabsContent value="settings">
                        <AccountSettings userData={userData} storeId={necessary?.storeId} />
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    )
}

export default UserAccount