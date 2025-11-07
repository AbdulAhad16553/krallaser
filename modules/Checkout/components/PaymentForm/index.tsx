import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface NecessaryProps {
    companyId: string;
    storeId: string;
    isPaymentMethodActive: boolean;
}

interface PaymentFormProps {
    isCardPaymentAvailable: boolean
    showCardFields: boolean
    necessary: NecessaryProps
}

const PaymentForm = ({ isCardPaymentAvailable, showCardFields, necessary }: PaymentFormProps) => {
    if (!isCardPaymentAvailable) {
        return (
            <div className="p-4 bg-yellow-100 border border-yellow-400 rounded-md">
                <p className="text-yellow-700">
                    We're currently working on enabling card payments. This feature will be available soon!
                </p>
            </div>
        )
    }

    if (!showCardFields) {
        return null
    }

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">Card Details</h3>
            <div>
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input id="cardNumber" placeholder="1234 5678 9012 3456" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="expirationDate">Expiration Date</Label>
                    <Input id="expirationDate" placeholder="MM/YY" required />
                </div>
                <div>
                    <Label htmlFor="cvv">CVV</Label>
                    <Input id="cvv" placeholder="123" required />
                </div>
            </div>
            <div>
                <Label htmlFor="nameOnCard">Name on Card</Label>
                <Input id="nameOnCard" placeholder="John Doe" required />
            </div>
        </div>
    )
}

export default PaymentForm