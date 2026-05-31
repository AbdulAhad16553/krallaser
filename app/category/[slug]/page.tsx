import Layout from '@/components/Layout';
import { headers } from 'next/headers';
import { getUrlWithScheme } from '@/lib/getUrlWithScheme';
import { getCatProducts } from '@/hooks/getCatProducts';
import CategoriesContent from '@/modules/CategoriesContent';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo';

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const name = decodeURIComponent(slug).replace(/-/g, ' ');
  return buildPageMetadata({
    title: `${name} | Laser Products`,
    description: `Shop ${name} laser cutting machines and parts at Krallaser Pakistan. Browse products with Lahore support and delivery.`,
    path: `/category/${slug}`,
  });
}

export default async function CategoryPage({ params }: { params: Params }) {
    const { slug: categorySlug } = await params;
    if (!categorySlug?.trim()) {
        notFound();
    }

    const Headers = await headers();
    const host = Headers.get("host");
    if (!host) {
        throw new Error("Host header is missing or invalid");
    }

    const fullStoreUrl = getUrlWithScheme(host);
    const response = await fetch(`${fullStoreUrl}/api/fetchStore`, { next: { revalidate: 300 } });
    const data = await response.json().catch(() => ({}));
    const store = data?.store?.stores?.[0];
    if (!store?.id) {
        notFound();
    }

    const storeId = store.id;
    const companyId = store.company_id ?? '';
    const storeCurrency = store.store_detail?.currency ?? "Rs.";

    const { catProducts, catName, catSubCats, currentStock } = await getCatProducts(storeId, categorySlug);

    return (
        <Layout>
            <div className="min-h-screen bg-white">
                <div className="page-container py-8 lg:py-10">
                    <nav className="breadcrumb">
                        <Link href="/" className="breadcrumb-link">Home</Link>
                        <span className="breadcrumb-separator">/</span>
                        <Link href="/category" className="breadcrumb-link">Categories</Link>
                        <span className="breadcrumb-separator">/</span>
                        <span className="text-slate-900 font-medium">{catName || "Category"}</span>
                    </nav>
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
            </div>
        </Layout>
    );
}
