import type { Metadata } from "next"
import UserAccount from "@/modules/UserAccount"
import Layout from "@/components/Layout"
import { headers } from "next/headers";
import { getUrlWithScheme } from "@/lib/getUrlWithScheme";

export const metadata: Metadata = {
    title: "My Account | EasyShop",
    description: "View and manage your account information and order history",
}

export default async function AccountPage() {

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
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold tracking-tight mb-6">My Account</h1>
                <UserAccount
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

