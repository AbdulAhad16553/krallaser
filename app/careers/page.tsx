import Layout from "@/components/Layout";
import { buildPageMetadata } from "@/lib/seo";
import CandidateList from "@/modules/Careers/CandidateList";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Building2, Globe, Sparkles, UserPlus, Users } from "lucide-react";

export const metadata = buildPageMetadata({
  title: "Talent Board | Find Candidates & Post Your CV Image",
  description:
    "Public talent board — browse candidate profiles, view CV images, and contact applicants directly. Anyone can post their profile for companies to discover.",
  path: "/careers",
});

const stats = [
  {
    icon: Users,
    title: "For Job Seekers",
    text: "Upload a CV image and get discovered by companies looking to hire.",
  },
  {
    icon: Building2,
    title: "For Employers",
    text: "Browse candidates, read profiles, and contact them directly.",
  },
  {
    icon: Globe,
    title: "Open to Everyone",
    text: "All profiles are public. Any company can view and reach out.",
  },
];

export default function CareersPage() {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50/80">
        <div className="page-container py-10 lg:py-14">
          <nav className="breadcrumb mb-8">
            <Link href="/" className="breadcrumb-link">
              Home
            </Link>
            <span className="breadcrumb-separator">/</span>
            <span className="text-slate-900 font-medium">Talent Board</span>
          </nav>

          <section className="talent-hero px-6 py-10 sm:px-10 sm:py-12 lg:px-14 lg:py-14 mb-10 text-center text-white relative">
            <div className="relative z-10 max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-sm px-4 py-1.5 text-xs font-semibold tracking-wide uppercase mb-5 border border-white/20">
                <Sparkles className="w-3.5 h-3.5" />
                Open Hiring Platform
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold tracking-tight leading-tight">
                Find Talent. Get Hired.
              </h1>
              <p className="mt-4 text-white/85 text-base sm:text-lg leading-relaxed max-w-xl mx-auto">
                Post your CV image for the world to see — or browse candidates and contact them directly
                to build your team.
              </p>
              <Button asChild size="lg" className="mt-8 talent-btn-primary rounded-full px-8 h-12 text-base shadow-lg">
                <Link href="/careers/apply">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Post Your Profile & CV Image
                </Link>
              </Button>
            </div>
          </section>

          <div className="grid sm:grid-cols-3 gap-4 lg:gap-5 mb-12 -mt-6 sm:-mt-8 relative z-10 px-0 sm:px-4">
            {stats.map(({ icon: Icon, title, text }) => (
              <div key={title} className="talent-stat-card p-5 sm:p-6 text-center">
                <div className="talent-stat-icon w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-slate-900">{title}</h3>
                <p className="text-slate-600 text-sm mt-1.5 leading-relaxed">{text}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Browse Candidates</h2>
              <p className="text-slate-500 text-sm mt-1">
                Click a profile to view full details and CV image
              </p>
            </div>
          </div>

          <CandidateList />
        </div>
      </div>
    </Layout>
  );
}
