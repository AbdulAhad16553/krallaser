import { CheckCircle } from "lucide-react"

interface OrderConfirmationProps {
    paymentMethod: "cash" | "card";
    orderNo: string | null;
}

const OrderConfirmation = ({ paymentMethod, orderNo }: OrderConfirmationProps) => {
    return (
        <div className="text-center">
            <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
            <h2 className="mt-4 text-2xl font-bold">Order Confirmed!</h2>
            <p className="mt-2">Thank you for your purchase. Your order has been received and is being processed.</p>
            <p className="mt-4">Order number: #{orderNo}</p>
            <p className="mt-2">Payment Method: {paymentMethod === "cash" ? "Cash on Delivery" : "Card Payment"}</p>
        </div>
    )
}

export default OrderConfirmation