import type { Metadata } from "next";
import Link from "next/link";
import Layout from "@/components/Layout";
import {
  getArticleBySlug,
  getAllSlugs,
  SITE_URL,
} from "@/lib/blogArticles";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return { title: "Article | Krallaser" };
  return {
    title: article.title,
    description: article.description,
    keywords: article.keywords,
    openGraph: {
      title: article.title,
      description: article.description,
      type: "article",
      publishedTime: article.publishedAt,
      url: `${SITE_URL}/blog/${article.slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.description,
    },
  };
}

function ArticleBody({ content }: { content: string }) {
  const paragraphs = content
    .trim()
    .split(/\n\n+/)
    .filter(Boolean);
  return (
    <div className="prose prose-slate max-w-none">
      {paragraphs.map((para, i) => (
        <p key={i} className="text-slate-700 leading-relaxed mb-4">
          {para}
        </p>
      ))}
    </div>
  );
}

export default async function BlogArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    datePublished: article.publishedAt,
    publisher: {
      "@type": "Organization",
      name: "Krallaser",
      url: SITE_URL,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/krallogo.svg` },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/blog/${article.slug}`,
    },
  };

  return (
    <Layout>
      <div className="min-h-screen bg-slate-50/50">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <article className="page-container py-10 lg:py-14">
          <Link
            href="/blog"
            className="inline-flex items-center text-sm text-slate-600 hover:text-[var(--primary-color)] mb-6"
          >
            ← Back to Blog
          </Link>
          <header className="mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">
              {article.title}
            </h1>
            <time
              dateTime={article.publishedAt}
              className="text-slate-500 text-sm mt-2 block"
            >
              {new Date(article.publishedAt).toLocaleDateString("en-PK", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
          </header>
          <div className="max-w-3xl">
            <ArticleBody content={article.content} />
          </div>
        </article>
      </div>
    </Layout>
  );
}
