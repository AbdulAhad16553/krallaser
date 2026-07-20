import Link from "next/link";
import { notFound } from "next/navigation";
import Layout from "@/components/Layout";
import { buildPageMetadata } from "@/lib/seo";
import CandidateProfileView from "@/modules/Careers/CandidateProfileView";
import {
  getJobApplicant,
  parseMessage,
  parsePosition,
} from "@/lib/erpnext/services/jobApplicantService";
import { getInitials } from "@/lib/careersUtils";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Briefcase } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const applicant = await getJobApplicant(id);

  if (!applicant) {
    return buildPageMetadata({
      title: "Candidate Not Found",
      description: "The requested candidate profile could not be found.",
      path: `/careers/${id}`,
    });
  }

  const position = parsePosition(applicant.cover_letter);

  return buildPageMetadata({
    title: `${applicant.applicant_name}${position ? ` — ${position}` : ""} | Talent Board`,
    description:
      parseMessage(applicant.cover_letter).slice(0, 160) ||
      `Profile of ${applicant.applicant_name}`,
    path: `/careers/${id}`,
  });
}

export default async function CandidateProfilePage({ params }: PageProps) {
  const { id } = await params;
  const applicant = await getJobApplicant(id);

  if (!applicant) notFound();

  const candidate = {
    id: applicant.name,
    name: applicant.applicant_name,
    email: applicant.email_id,
    phone: applicant.phone_number,
    position: parsePosition(applicant.cover_letter),
    message: parseMessage(applicant.cover_letter),
    submittedAt: applicant.creation,
    hasCv: Boolean(applicant.resume_filename),
    cvFilename: applicant.resume_filename,
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50/80">
        <div className="page-container py-10 lg:py-14 max-w-3xl">
          <nav className="breadcrumb mb-6">
            <Link href="/" className="breadcrumb-link">
              Home
            </Link>
            <span className="breadcrumb-separator">/</span>
            <Link href="/careers" className="breadcrumb-link">
              Talent Board
            </Link>
            <span className="breadcrumb-separator">/</span>
            <span className="text-slate-900 font-medium">{candidate.name}</span>
          </nav>

          <Button asChild variant="ghost" size="sm" className="mb-6 -ml-2 text-slate-600 hover:text-[var(--primary-color)]">
            <Link href="/careers">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to all candidates
            </Link>
          </Button>

          <div className="rounded-2xl overflow-hidden shadow-xl border border-slate-200/80 bg-white">
            <div className="talent-dialog-header px-6 py-8 sm:px-8 text-white relative">
              <div className="relative z-10 flex items-start gap-4">
                <div className="talent-avatar w-16 h-16 rounded-2xl flex items-center justify-center text-xl shrink-0 border-2 border-white/20">
                  {getInitials(candidate.name)}
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{candidate.name}</h1>
                  {candidate.position && (
                    <p className="text-white/85 flex items-center gap-2 mt-2">
                      <Briefcase className="w-4 h-4" />
                      {candidate.position}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="p-6 sm:p-8">
              <CandidateProfileView candidate={candidate} hideHeader />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
