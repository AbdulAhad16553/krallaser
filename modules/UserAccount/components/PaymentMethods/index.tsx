"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Plus, Pencil, Trash2 } from "lucide-react"
// import { useToast } from "@/hooks/use-toast"

// Mock payment methods - in a real app, this would come from your API
const paymentMethods = [
    {
        id: "card_1",
        type: "Visa",
        default: true,
        last4: "4242",
        expMonth: 12,
        expYear: 2024,
        name: "Alex Johnson",
    },
    {
        id: "card_2",
        type: "Mastercard",
        default: false,
        last4: "5555",
        expMonth: 8,
        expYear: 2025,
        name: "Alex Johnson",
    },
]

export function PaymentMethods() {
    // const { toast } = useToast()
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingCard, setEditingCard] = useState<(typeof paymentMethods)[0] | null>(null)

    const handleEditCard = (card: (typeof paymentMethods)[0]) => {
        setEditingCard(card)
        setIsDialogOpen(true)
    }

    const handleAddCard = () => {
        setEditingCard(null)
        setIsDialogOpen(true)
    }

    const handleDeleteCard = (id: string) => {
        // In a real app, you would send this data to your API
        // toast({
        //     title: "Payment method removed",
        //     description: "The payment method has been removed from your account.",
        // })
    }

    const handleSaveCard = (e: React.FormEvent) => {
        e.preventDefault()
        // In a real app, you would send this data to your API

        // toast({
        //     title: editingCard ? "Payment method updated" : "Payment method added",
        //     description: editingCard
        //         ? "Your payment method has been updated successfully."
        //         : "Your new payment method has been added successfully.",
        // })

        setIsDialogOpen(false)
    }

    const handleSetDefault = (id: string) => {
        // In a real app, you would send this data to your API
        // toast({
        //     title: "Default payment method updated",
        //     description: "Your default payment method has been updated.",
        // })
    }

    const getCardIcon = (type: string) => {
        // In a real app, you would use proper card brand icons
        return <CreditCard className="h-4 w-4" />
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Payment Methods</h2>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={handleAddCard}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Payment Method
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[550px]">
                        <DialogHeader>
                            <DialogTitle>{editingCard ? "Edit Payment Method" : "Add Payment Method"}</DialogTitle>
                            <DialogDescription>
                                {editingCard ? "Update your payment method details." : "Add a new payment method to your account."}
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSaveCard}>
                            <div className="grid gap-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="cardName">Name on Card</Label>
                                    <Input id="cardName" defaultValue={editingCard?.name || ""} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="cardNumber">Card Number</Label>
                                    <Input id="cardNumber" placeholder="•••• •••• •••• ••••" required />
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="expMonth">Exp. Month</Label>
                                        <Input id="expMonth" placeholder="MM" defaultValue={editingCard?.expMonth || ""} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="expYear">Exp. Year</Label>
                                        <Input id="expYear" placeholder="YYYY" defaultValue={editingCard?.expYear || ""} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="cvc">CVC</Label>
                                        <Input id="cvc" placeholder="•••" required />
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit">Save Payment Method</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {paymentMethods.map((card) => (
                    <Card key={card.id} className={card.default ? "border-primary" : ""}>
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    {getCardIcon(card.type)}
                                    <CardTitle className="text-lg">
                                        {card.type} •••• {card.last4}
                                    </CardTitle>
                                </div>
                                {card.default && (
                                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                                        Default
                                    </Badge>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-1 text-sm">
                                <p className="font-medium">{card.name}</p>
                                <p className="text-muted-foreground">
                                    Expires {card.expMonth}/{card.expYear}
                                </p>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => handleEditCard(card)}>
                                    <Pencil className="h-4 w-4 mr-2" />
                                    Edit
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => handleDeleteCard(card.id)}>
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                </Button>
                            </div>
                            {!card.default && (
                                <Button variant="ghost" size="sm" onClick={() => handleSetDefault(card.id)}>
                                    Set as Default
                                </Button>
                            )}
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    )
}

