import AllSettings from "@/modules/AllSettings";
import { headers } from "next/headers";
import { getUrlWithScheme } from "@/lib/getUrlWithScheme";
import Layout from "@/components/Layout";

import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
    title: "Account Settings",
    description: "Manage your Krallaser account settings.",
    path: "/settings",
    noIndex: true,
});

export default async function Settings() {

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
                <h1 className="text-3xl font-bold tracking-tight mb-6">Account Settings</h1>
                <AllSettings
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

