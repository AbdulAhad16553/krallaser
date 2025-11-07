import Layout from '@/components/Layout';
import { headers } from 'next/headers';
import { getUrlWithScheme } from '@/lib/getUrlWithScheme';
import { getCatProducts } from '@/hooks/getCatProducts';
import CategoriesContent from '@/modules/CategoriesContent';

type Params = Promise<{ slug: string }>;

export default async function CategoryPage({ params }: { params: Params }) {
    const { slug: categoryId } = await params;

    const Headers = await headers();
    const host = Headers.get("host");
    if (!host) {
        throw new Error("Host header is missing or invalid");
    }

    const fullStoreUrl = getUrlWithScheme(host);

    const response = await fetch(`${fullStoreUrl}/api/fetchStore`);
    const data = await response.json();
    const storeId = data?.store?.stores[0].id;
    const companyId = data?.store?.stores[0].company_id;
    const storeCurrency = data?.store?.stores[0].store_detail?.currency ? data?.store?.stores[0].store_detail?.currency : "Rs.";

    const { catProducts, catName, catSubCats, currentStock } = await getCatProducts(storeId, categoryId);

    return (
        <Layout>
            <div className="container mx-auto px-4 py-8">
                <CategoriesContent
                    catProducts={catProducts}
                    catName={catName}
                    catSubCats={catSubCats}
                    currentStock={currentStock}
                    storeCurrency={storeCurrency}
                    necessary={{
                        storeId,
                        companyId
                    }}
                />
            </div>
        </Layout>
    );
}
