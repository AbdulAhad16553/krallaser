import Layout from "@/components/Layout"
import CheckOut from "@/modules/Checkout";
import { headers } from "next/headers";
import { getUrlWithScheme } from "@/lib/getUrlWithScheme";

export default async function CheckoutPage() {

    const Headers = await headers()
    const host = Headers.get("host");
    if (!host) {
        throw new Error("Host header is missing or invalid");
    }

    const fullStoreUrl = getUrlWithScheme(host);

    const response = await fetch(`${fullStoreUrl}/api/fetchStore`);
    const data = await response.json();

    const store = data?.store?.stores?.[0]
    const storeCurrency = data?.store?.stores[0].store_detail?.currency ? data?.store?.stores[0].store_detail?.currency : "Rs.";

    return (
        <Layout>
            <CheckOut
                necessary={{
                    companyId: store?.company_id,
                    storeId: store?.id,
                }}
                storeCurrency={storeCurrency}
            />
        </Layout>
    )
}

