"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Eye, Download } from "lucide-react";

interface OrderHistoryProps {
    userData: any;
    storeId: string;
}

interface Order {
    id: string;
    orderNumber: string;
    date: string;
    status: string;
    total: number;
    currency: string;
    items: Array<{
        name: string;
        quantity: number;
        price: number;
    }>;
}

const OrderHistory = ({ userData, storeId }: OrderHistoryProps) => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            try {
                // In a real implementation, you would fetch orders from ERPNext
                // For now, we'll use mock data
                const mockOrders: Order[] = [
                    {
                        id: "1",
                        orderNumber: "ORD-001",
                        date: "2024-01-15",
                        status: "Delivered",
                        total: 150.00,
                        currency: "USD",
                        items: [
                            { name: "Sample Product 1", quantity: 1, price: 100.00 },
                            { name: "Sample Product 2", quantity: 1, price: 50.00 }
                        ]
                    },
                    {
                        id: "2",
                        orderNumber: "ORD-002",
                        date: "2024-01-10",
                        status: "Processing",
                        total: 75.00,
                        currency: "USD",
                        items: [
                            { name: "Sample Product 3", quantity: 1, price: 75.00 }
                        ]
                    }
                ];
                
                setOrders(mockOrders);
            } catch (error) {
                console.error("Error fetching orders:", error);
                setOrders([]);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [storeId]);

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "delivered":
                return "bg-green-100 text-green-800";
            case "processing":
                return "bg-yellow-100 text-yellow-800";
            case "shipped":
                return "bg-blue-100 text-blue-800";
            case "cancelled":
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    if (loading) {
        return (
            <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                        <CardContent className="p-6">
                            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">Order History</h2>
            
            {orders.length === 0 ? (
                <Card>
                    <CardContent className="text-center py-8">
                        <p className="text-muted-foreground">No orders found.</p>
                        <Button variant="outline" className="mt-4">
                            Start Shopping
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <Card key={order.id}>
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-lg">
                                            Order #{order.orderNumber}
                                        </CardTitle>
                                        <p className="text-sm text-muted-foreground">
                                            Placed on {new Date(order.date).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <Badge className={getStatusColor(order.status)}>
                                        {order.status}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="font-medium mb-2">Items Ordered:</h4>
                                        <div className="space-y-1">
                                            {order.items.map((item, index) => (
                                                <div key={index} className="flex justify-between text-sm">
                                                    <span>{item.name} x {item.quantity}</span>
                                                    <span>{order.currency}{item.price}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    <Separator />
                                    
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium">Total: {order.currency}{order.total}</span>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm">
                                                <Eye className="h-4 w-4 mr-1" />
                                                View Details
                                            </Button>
                                            <Button variant="outline" size="sm">
                                                <Download className="h-4 w-4 mr-1" />
                                                Invoice
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default OrderHistory;