"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import CandidateProfileView, {
  type CandidateProfileData,
} from "@/modules/Careers/CandidateProfileView";
import { getInitials } from "@/lib/careersUtils";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Briefcase, ExternalLink, Mail, Phone, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CandidateProfileDialogProps {
  candidate: CandidateProfileData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CandidateProfileDialog({
  candidate,
  open,
  onOpenChange,
}: CandidateProfileDialogProps) {
  const isOpen = open && Boolean(candidate);

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className={cn(
            "talent-dialog-overlay fixed inset-0 z-[100]",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
          )}
        />

        <DialogPrimitive.Content
          className={cn(
            "talent-dialog-panel relative fixed z-[101] flex flex-col overflow-hidden",
            "left-[50%] top-[50%] w-[calc(100vw-1.25rem)] max-w-3xl",
            "max-h-[min(88dvh,920px)] sm:max-h-[90vh]",
            "-translate-x-1/2 -translate-y-1/2",
            "rounded-2xl sm:rounded-3xl",
            "duration-200 outline-none",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
          )}
        >
          {candidate ? (
            <>
              <DialogPrimitive.Title className="sr-only">
                {candidate.name} — Profile
              </DialogPrimitive.Title>

              {/* Header */}
              <div className="talent-dialog-header relative shrink-0 px-5 pt-5 pb-5 sm:px-7 sm:pt-6 sm:pb-6 text-white">
                <DialogPrimitive.Close className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white/90 hover:bg-white/25 hover:text-white transition-colors">
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </DialogPrimitive.Close>

                <div className="relative z-10 flex items-start gap-3.5 sm:gap-4 pr-10">
                  <div className="talent-avatar flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-2xl text-lg sm:text-xl ring-2 ring-white/25">
                    {getInitials(candidate.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight leading-tight line-clamp-2">
                      {candidate.name}
                    </h2>
                    {candidate.position && (
                      <p className="mt-1.5 flex items-center gap-2 text-sm sm:text-base text-white/90">
                        <Briefcase className="h-4 w-4 shrink-0" />
                        <span className="truncate">{candidate.position}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Quick actions in header */}
                <div className="relative z-10 mt-4 flex gap-2">
                  <a
                    href={`mailto:${candidate.email}?subject=Job Opportunity`}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-white/15 px-3 py-2 text-xs sm:text-sm font-medium text-white hover:bg-white/25 transition-colors"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    Email
                  </a>
                  <a
                    href={`tel:${candidate.phone}`}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-white/15 px-3 py-2 text-xs sm:text-sm font-medium text-white hover:bg-white/25 transition-colors"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    Call
                  </a>
                </div>
              </div>

              {/* Scrollable body */}
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-slate-50/40 px-5 py-5 sm:px-7 sm:py-6">
                <CandidateProfileView candidate={candidate} hideHeader hideActions inDialog />
              </div>

              {/* Sticky footer */}
              <div className="talent-dialog-footer shrink-0 px-5 py-4 sm:px-7 flex flex-col sm:flex-row gap-2.5">
                <Button asChild className="talent-btn-primary rounded-full h-11 flex-1 sm:flex-none sm:px-8">
                  <a href={`mailto:${candidate.email}?subject=Job Opportunity`}>
                    <Mail className="w-4 h-4 mr-2" />
                    Email Candidate
                  </a>
                </Button>
                <Button asChild variant="outline" className="talent-btn-outline rounded-full h-11 flex-1 sm:flex-none sm:px-8">
                  <a href={`tel:${candidate.phone}`}>
                    <Phone className="w-4 h-4 mr-2" />
                    Call
                  </a>
                </Button>
                <Button asChild variant="outline" className="rounded-full h-11 flex-1 sm:flex-none border-slate-200">
                  <Link href={`/careers/${encodeURIComponent(candidate.id)}`}>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Full Page
                  </Link>
                </Button>
              </div>
            </>
          ) : null}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
