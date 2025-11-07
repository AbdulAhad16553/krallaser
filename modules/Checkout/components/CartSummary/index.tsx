import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface CartItem {
    id: string;
    name: string;
    quantity: number;
    basePrice: number;
    salePrice?: number;
    variation?: { attributes: { attribute_name: string, selected_value: string }[] };
}

interface CartProps {
    cartItems: CartItem[];
    storeCurrency: string
}

const CartSummary = ({ cartItems, storeCurrency }: CartProps) => {

    const subtotal = cartItems.reduce((acc: number, item: any) =>
        acc + ((item.salePrice && item.salePrice !== 0 ? item.salePrice : item.basePrice) * item.quantity), 0
    );

    const tax = 0; // Assuming 10% tax
    const total = subtotal + tax;


    return (
        <div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Price</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {cartItems.map((item: any, index: number) => {
                        const attributes = item?.variation?.attributes;

                        // Check if any attribute has a selected value
                        const selectedValues = attributes?.length
                            ? `(${attributes.map((attr: any) => attr.selected_value).join(', ')})`
                            : '';

                        return (
                            <TableRow key={index}>
                                <TableCell>
                                    {item.name} {selectedValues}
                                </TableCell>
                                <TableCell>{item.quantity}</TableCell>
                                <TableCell>{item.currency ? item.currency.split(" - ")[1] : storeCurrency.split(" - ")[1]}{((item.salePrice && item.salePrice !== 0 ? item.salePrice : item.basePrice) * item.quantity).toFixed(2)}</TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
            <div className="mt-4 text-right">
                <p>Subtotal: {storeCurrency.split(" - ")[1]}{subtotal.toFixed(2)}</p>
                <p>Tax: {storeCurrency.split(" - ")[1]}{tax.toFixed(2)}</p>
                <p className="font-bold">Total: {storeCurrency.split(" - ")[1]}{total.toFixed(2)}</p>
            </div>
        </div>
    );
}

export default CartSummary;
