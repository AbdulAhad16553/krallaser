import Layout from "@/components/Layout";
import { buildPageMetadata } from "@/lib/seo";
import CareerApplicationForm from "@/modules/Careers/CareerApplicationForm";
import Link from "next/link";
import { ArrowLeft, Globe, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = buildPageMetadata({
  title: "Post Your Profile & CV Image | Talent Board",
  description:
    "Submit your CV image and contact details to the public talent board. Your profile will be visible to all companies browsing the site.",
  path: "/careers/apply",
});

export default function ApplyPage() {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50/80">
        <div className="page-container py-10 lg:py-14 max-w-2xl mx-auto">
          <nav className="breadcrumb mb-6">
            <Link href="/" className="breadcrumb-link">
              Home
            </Link>
            <span className="breadcrumb-separator">/</span>
            <Link href="/careers" className="breadcrumb-link">
              Talent Board
            </Link>
            <span className="breadcrumb-separator">/</span>
            <span className="text-slate-900 font-medium">Post Profile</span>
          </nav>

          <Button
            asChild
            variant="ghost"
            size="sm"
            className="mb-6 -ml-2 text-slate-600 hover:text-[var(--primary-color)]"
          >
            <Link href="/careers">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to candidates
            </Link>
          </Button>

          <div className="talent-hero px-6 py-8 sm:py-10 text-center text-white relative mb-8 rounded-2xl">
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide mb-4 border border-white/20">
                <Sparkles className="w-3.5 h-3.5" />
                Join the board
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Post Your Profile</h1>
              <p className="mt-3 text-white/85 text-sm sm:text-base max-w-md mx-auto leading-relaxed flex items-start justify-center gap-2">
                <Globe className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  Your profile will be <strong className="text-white">publicly visible</strong> — any
                  company can view your details and contact you.
                </span>
              </p>
            </div>
          </div>

          <CareerApplicationForm />
        </div>
      </div>
    </Layout>
  );
}
