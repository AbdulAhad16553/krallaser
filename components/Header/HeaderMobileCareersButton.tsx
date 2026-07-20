"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";

export default function HeaderMobileCareersButton() {
  const pathname = usePathname() || "/";
  const isCareersRoute = pathname.startsWith("/careers");

  return (
    <Link
      href="/careers"
      className={cn(
        "relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
        "bg-[var(--primary-color)] text-white shadow-md shadow-red-500/30",
        "ring-2 ring-[var(--primary-color)]/20",
        "active:scale-95 transition-transform",
        isCareersRoute && "ring-offset-1 ring-offset-white"
      )}
      aria-label="Talent Board"
    >
      <Briefcase className="h-5 w-5 fill-white/15" strokeWidth={2.25} aria-hidden />
    </Link>
  );
}
