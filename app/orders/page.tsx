import type { Metadata } from "next"
import AllOrders from "@/modules/AllOrders"
import { headers } from "next/headers";
import { getUrlWithScheme } from "@/lib/getUrlWithScheme";
import Layout from "@/components/Layout";

export const metadata: Metadata = {
    title: "My Orders | EasyShop",
    description: "View and track your order history",
}

export default async function Orders() {

    const Headers = await headers();
    const host = Headers.get("host");

    if (!host) {
        throw new Error("Host header is missing or invalid");
    }

    const fullStoreUrl = getUrlWithScheme(host);

    const response = await fetch(`${fullStoreUrl}/api/fetchStore`);
    const data = await response.json();

    const storeId = data?.store?.stores[0].id
    const companyId = data?.store?.stores[0].company_id
    const storeCurrency = data?.store?.stores[0].store_detail?.currency ? data?.store?.stores[0].store_detail?.currency : "Rs.";

    return (
        <Layout>
            <div className="container mx-auto py-8 px-4">
                <h1 className="text-3xl font-bold tracking-tight mb-6">My Orders</h1>
                <AllOrders
                    necessary={{
                        storeId: storeId,
                        companyId: companyId,
                        storeCurrency: storeCurrency
                    }}
                />
            </div>
        </Layout>
    )
}

