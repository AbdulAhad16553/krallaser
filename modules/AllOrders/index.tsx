"use client"

import OrderHistory from "../UserAccount/components/OrderHistory"
import { Button } from "@/components/ui/button"
// Removed Nhost authentication - using mock authentication for now
import { useRouter } from "next/navigation"

interface AllOrdersProps {
    necessary: {
        storeId: string;
        companyId: string;
        storeCurrency: string
    }
}

const AllOrders = ({ necessary }: AllOrdersProps) => {

    // Mock user data - in a real implementation, you'd get this from your auth system
    const userData = { id: 'mock-user-id', displayName: 'User' }
    const router = useRouter()

    return (
        <div className="space-y-6">
            <OrderHistory userData={userData} storeId={necessary?.storeId} />
            <div className="flex justify-center mt-8">
                <Button asChild>
                    <Button onClick={() => { router.push("/") }}>Continue Shopping</Button>
                </Button>
            </div>
        </div>
    )
}

export default AllOrders