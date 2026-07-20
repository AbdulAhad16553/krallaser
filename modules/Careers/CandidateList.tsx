"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import CandidateProfileDialog from "@/modules/Careers/CandidateProfileDialog";
import type { CandidateProfileData } from "@/modules/Careers/CandidateProfileView";
import { CAREERS_LIST_REFRESH_EVENT } from "@/lib/careersListRefresh";
import { getInitials } from "@/lib/careersUtils";
import {
  Briefcase,
  Calendar,
  Eye,
  Image,
  Loader2,
  Mail,
  Search,
  Sparkles,
  User,
  UserPlus,
} from "lucide-react";

interface Candidate extends CandidateProfileData {}

function formatDate(dateStr?: string): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-PK", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function CandidateList() {
  const pathname = usePathname();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);

  const fetchCandidates = useCallback(async () => {
    try {
      const res = await fetch("/api/job-applications", { cache: "no-store" });
      const json = await res.json();
      if (json.success) setCandidates(json.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (pathname !== "/careers") return;

    setLoading(true);
    fetchCandidates();

    const onRefresh = () => fetchCandidates();

    window.addEventListener(CAREERS_LIST_REFRESH_EVENT, onRefresh);
    window.addEventListener("focus", onRefresh);

    return () => {
      window.removeEventListener(CAREERS_LIST_REFRESH_EVENT, onRefresh);
      window.removeEventListener("focus", onRefresh);
    };
  }, [pathname, fetchCandidates]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return candidates;
    return candidates.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.position?.toLowerCase().includes(q) ||
        c.message.toLowerCase().includes(q)
    );
  }, [candidates, search]);

  const openProfile = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setProfileOpen(true);
  };

  const handleProfileOpenChange = (next: boolean) => {
    setProfileOpen(next);
    if (!next) {
      window.setTimeout(() => setSelectedCandidate(null), 200);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-14 h-14 rounded-2xl talent-stat-icon flex items-center justify-center">
          <Loader2 className="w-7 h-7 animate-spin text-[var(--primary-color)]" />
        </div>
        <p className="text-sm text-slate-500">Loading candidates…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CandidateProfileDialog
        candidate={selectedCandidate}
        open={profileOpen}
        onOpenChange={handleProfileOpenChange}
      />

      <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        <div className="talent-search-wrap flex items-center flex-1 max-w-lg px-4 py-1">
          <Search className="w-4 h-4 text-[var(--primary-color)] shrink-0 mr-3" />
          <Input
            placeholder="Search by name, role, or skills…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-0 shadow-none focus-visible:ring-0 bg-transparent h-11 px-0"
          />
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Sparkles className="w-4 h-4 text-[var(--primary-color)]" />
          <span className="text-slate-600">
            <strong className="text-slate-900 font-semibold">{filtered.length}</strong> candidate
            {filtered.length !== 1 ? "s" : ""} available
          </span>
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card className="border-dashed border-2 border-[var(--primary-color)]/15 bg-gradient-to-br from-red-50/30 to-white shadow-none">
          <CardContent className="py-20 text-center">
            <div className="w-16 h-16 rounded-2xl talent-stat-icon flex items-center justify-center mx-auto mb-5">
              <User className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">No candidates yet</h3>
            <p className="text-slate-600 mt-2 max-w-sm mx-auto leading-relaxed">
              Be the first to post your profile. Companies browse this page to discover and hire
              talent.
            </p>
            <Button asChild className="mt-8 talent-btn-primary rounded-full px-8">
              <Link href="/careers/apply">
                <UserPlus className="w-4 h-4 mr-2" />
                Post Your Profile
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((candidate) => (
            <article key={candidate.id} className="talent-candidate-card flex flex-col">
              <div className="p-5 sm:p-6 flex flex-col flex-1">
                <div className="flex items-start gap-3.5 mb-4">
                  <div className="talent-avatar w-12 h-12 rounded-xl flex items-center justify-center text-sm shrink-0">
                    {getInitials(candidate.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-slate-900 truncate text-base leading-snug">
                      {candidate.name}
                    </h3>
                    {candidate.position && (
                      <p className="text-sm text-[var(--primary-color)] font-medium flex items-center gap-1.5 mt-1">
                        <Briefcase className="w-3.5 h-3.5 shrink-0 opacity-80" />
                        <span className="truncate">{candidate.position}</span>
                      </p>
                    )}
                  </div>
                </div>

                {candidate.message && (
                  <p className="text-sm text-slate-600 line-clamp-3 mb-4 flex-1 leading-relaxed">
                    {candidate.message}
                  </p>
                )}

                <div className="flex flex-wrap gap-2 mb-5">
                  {candidate.hasCv && (
                    <span className="talent-badge-cv inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium">
                      <Image className="w-3 h-3 mr-1" aria-hidden />
                      CV Image
                    </span>
                  )}
                  {candidate.submittedAt && (
                    <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium text-slate-500 bg-slate-100 border border-slate-200/80">
                      <Calendar className="w-3 h-3 mr-1" />
                      {formatDate(candidate.submittedAt)}
                    </span>
                  )}
                </div>

                <div className="flex gap-2 pt-4 border-t border-slate-100 mt-auto">
                  <Button
                    size="sm"
                    className="flex-1 talent-btn-primary rounded-full h-9"
                    onClick={() => openProfile(candidate)}
                  >
                    <Eye className="w-3.5 h-3.5 mr-1.5" />
                    View Profile
                  </Button>
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="flex-1 talent-btn-outline rounded-full h-9"
                  >
                    <a href={`mailto:${candidate.email}`}>
                      <Mail className="w-3.5 h-3.5 mr-1.5" />
                      Contact
                    </a>
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
