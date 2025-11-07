import Cart from '@/modules/Cart'
import OrderSummary from '@/modules/OrderSummary'
import { headers } from 'next/headers';
import { getUrlWithScheme } from '@/lib/getUrlWithScheme';
import Layout from '@/components/Layout';

export default async function CartPage() {

    const Headers = await headers();
    const host = Headers.get("host");

    if (!host) {
        throw new Error("Host header is missing or invalid");
    }

    const fullStoreUrl = getUrlWithScheme(host);

    const response = await fetch(`${fullStoreUrl}/api/fetchStore`);
    const data = await response.json();

    // console.log("data", data)
    const storeCurrency = data?.store?.stores[0].store_detail?.currency ? data?.store?.stores[0].store_detail?.currency : "Rs.";


    return (
        <Layout>
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2">
                        <Cart storeCurrency={storeCurrency} />
                    </div>
                    <OrderSummary storeCurrency={storeCurrency} />
                </div>
            </div>
        </Layout>
    )
}
