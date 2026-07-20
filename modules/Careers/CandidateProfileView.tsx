import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getInitials } from "@/lib/careersUtils";
import { isImageCvFilename, isPdfCvFilename } from "@/lib/careersUpload";
import {
  Briefcase,
  Calendar,
  Download,
  ExternalLink,
  Image,
  Mail,
  Phone,
} from "lucide-react";

export interface CandidateProfileData {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string | null;
  message: string;
  submittedAt?: string;
  hasCv: boolean;
  cvFilename?: string;
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-PK", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function isPdfCv(filename?: string): boolean {
  return isPdfCvFilename(filename);
}

function isImageCv(filename?: string): boolean {
  return isImageCvFilename(filename);
}

interface CandidateProfileViewProps {
  candidate: CandidateProfileData;
  showFullPageLink?: boolean;
  hideHeader?: boolean;
  hideActions?: boolean;
  inDialog?: boolean;
}

export default function CandidateProfileView({
  candidate,
  showFullPageLink = false,
  hideHeader = false,
  hideActions = false,
  inDialog = false,
}: CandidateProfileViewProps) {
  const cvUrl = `/api/job-applications/${encodeURIComponent(candidate.id)}/cv`;
  const canPreviewImage = candidate.hasCv && isImageCv(candidate.cvFilename);
  const canPreviewPdf = candidate.hasCv && isPdfCv(candidate.cvFilename);

  return (
    <div className={inDialog ? "space-y-4" : "space-y-4 sm:space-y-6"}>
      {!hideHeader && (
        <div className="flex items-start gap-4 pb-6 border-b border-slate-100">
          <div className="talent-avatar w-16 h-16 rounded-2xl flex items-center justify-center text-xl shrink-0">
            {getInitials(candidate.name)}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{candidate.name}</h2>
            {candidate.position && (
              <p className="text-slate-600 flex items-center gap-2 mt-1.5">
                <Briefcase className="w-4 h-4 shrink-0 text-[var(--primary-color)]" />
                {candidate.position}
              </p>
            )}
            <div className="flex flex-wrap gap-2 mt-3">
              {candidate.submittedAt && (
                <Badge variant="outline" className="text-slate-500 border-slate-200">
                  <Calendar className="w-3 h-3 mr-1" />
                  Posted {formatDate(candidate.submittedAt)}
                </Badge>
              )}
              {candidate.hasCv && (
                <span className="talent-badge-cv inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium">
                  <Image className="w-3 h-3 mr-1" aria-hidden />
                  {candidate.cvFilename || "CV image"}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {hideHeader && (
        <div className="flex flex-wrap gap-2 -mt-1">
          {candidate.submittedAt && (
            <Badge variant="outline" className="text-slate-500 border-slate-200">
              <Calendar className="w-3 h-3 mr-1" />
              Posted {formatDate(candidate.submittedAt)}
            </Badge>
          )}
          {candidate.hasCv && (
            <span className="talent-badge-cv inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium">
              <Image className="w-3 h-3 mr-1" aria-hidden />
              {candidate.cvFilename || "CV image"}
            </span>
          )}
        </div>
      )}

      {candidate.message && (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-sm">
          <h3 className="talent-section-label mb-2.5">About</h3>
          <p className="text-slate-700 leading-relaxed whitespace-pre-wrap text-sm sm:text-base">
            {candidate.message}
          </p>
        </div>
      )}

      <div className="talent-contact-box rounded-2xl p-4 sm:p-5 bg-white shadow-sm">
        <h3 className="talent-section-label mb-4">Contact</h3>
        <div className="space-y-3">
          <a
            href={`mailto:${candidate.email}`}
            className="flex items-center gap-3 p-3 rounded-lg bg-white border border-slate-100 text-slate-700 hover:border-[var(--primary-color)]/25 hover:text-[var(--primary-color)] transition-colors group"
          >
            <span className="w-9 h-9 rounded-lg bg-[var(--primary-color)]/10 flex items-center justify-center shrink-0 group-hover:bg-[var(--primary-color)]/15">
              <Mail className="w-4 h-4 text-[var(--primary-color)]" />
            </span>
            <span className="break-all font-medium">{candidate.email}</span>
          </a>
          <a
            href={`tel:${candidate.phone}`}
            className="flex items-center gap-3 p-3 rounded-lg bg-white border border-slate-100 text-slate-700 hover:border-[var(--primary-color)]/25 hover:text-[var(--primary-color)] transition-colors group"
          >
            <span className="w-9 h-9 rounded-lg bg-[var(--primary-color)]/10 flex items-center justify-center shrink-0 group-hover:bg-[var(--primary-color)]/15">
              <Phone className="w-4 h-4 text-[var(--primary-color)]" />
            </span>
            <span className="font-medium">{candidate.phone}</span>
          </a>
        </div>
      </div>

      {candidate.hasCv && (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <h3 className="talent-section-label">CV Image</h3>
            <Button asChild variant="outline" size="sm" className="talent-btn-outline rounded-full">
              <a href={cvUrl} target="_blank" rel="noopener noreferrer" download>
                <Download className="w-4 h-4 mr-2" />
                Download
              </a>
            </Button>
          </div>

          {canPreviewImage ? (
            <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-100 shadow-inner">
              <img
                src={cvUrl}
                alt={`${candidate.name} CV`}
                className="w-full h-auto max-h-[min(60dvh,560px)] object-contain object-top mx-auto bg-white"
              />
            </div>
          ) : canPreviewPdf ? (
            <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50 shadow-inner">
              <iframe
                src={cvUrl}
                title={`${candidate.name} CV`}
                className="w-full h-[min(50dvh,360px)] sm:h-[min(70vh,480px)] min-h-[220px] sm:min-h-[280px] bg-white"
              />
            </div>
          ) : (
            <div className="rounded-xl border-2 border-dashed border-[var(--primary-color)]/20 bg-gradient-to-br from-red-50/50 to-slate-50 p-8 text-center">
              <div className="w-14 h-14 rounded-2xl talent-stat-icon flex items-center justify-center mx-auto mb-3">
                <Image className="w-7 h-7" aria-hidden />
              </div>
              <p className="text-sm text-slate-600">
                CV preview unavailable. Use the download button above.
              </p>
            </div>
          )}
        </div>
      )}

      {!hideActions && (
      <div className="flex flex-col sm:flex-row flex-wrap gap-2.5 sm:gap-3 pt-2 border-t border-slate-100">
        <Button asChild className="talent-btn-primary rounded-full px-6 w-full sm:w-auto h-10 sm:h-11">
          <a href={`mailto:${candidate.email}?subject=Job Opportunity`}>
            <Mail className="w-4 h-4 mr-2" />
            Email Candidate
          </a>
        </Button>
        <Button asChild variant="outline" className="talent-btn-outline rounded-full px-6 w-full sm:w-auto h-10 sm:h-11">
          <a href={`tel:${candidate.phone}`}>
            <Phone className="w-4 h-4 mr-2" />
            Call Candidate
          </a>
        </Button>
        {showFullPageLink && (
          <Button asChild variant="outline" className="rounded-full px-6 w-full sm:w-auto h-10 sm:h-11 border-slate-200">
            <Link href={`/careers/${encodeURIComponent(candidate.id)}`}>
              <ExternalLink className="w-4 h-4 mr-2" />
              Open Full Page
            </Link>
          </Button>
        )}
      </div>
      )}
    </div>
  );
}
