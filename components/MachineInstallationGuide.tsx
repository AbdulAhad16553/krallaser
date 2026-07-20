"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MACHINE_INSTALLATION_FAQS,
  MACHINE_INSTALLATION_INTRO,
  MACHINE_INSTALLATION_STEPS,
  MACHINE_INSTALLATION_TITLE,
} from "@/lib/machineInstallationGuide";
import { ChevronDown, ChevronUp, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MachineInstallationGuideProps {
  showPageLink?: boolean;
  compact?: boolean;
}

export default function MachineInstallationGuide({
  showPageLink = false,
  compact = false,
}: MachineInstallationGuideProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className={compact ? "space-y-4" : "space-y-8"}>
      {!compact && (
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[var(--primary-color)]/10 px-3 py-1 text-xs font-semibold text-[var(--primary-color)] mb-3">
            <Wrench className="w-3.5 h-3.5" />
            Installation Guide
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {MACHINE_INSTALLATION_TITLE}
          </h2>
          <p className="text-slate-600 mt-2 text-sm sm:text-base leading-relaxed max-w-3xl">
            {MACHINE_INSTALLATION_INTRO}
          </p>
        </div>
      )}

      <ol className="grid gap-3 sm:grid-cols-2">
        {MACHINE_INSTALLATION_STEPS.map((item) => (
          <li
            key={item.step}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--primary-color)] text-sm font-bold text-white">
                {item.step}
              </span>
              <div>
                <h3 className="font-semibold text-slate-900 text-sm sm:text-base">
                  {item.title}
                </h3>
                <p className="text-slate-600 text-sm mt-1 leading-relaxed">{item.detail}</p>
              </div>
            </div>
          </li>
        ))}
      </ol>

      <div className="space-y-3" role="list">
        <h3 className="text-base font-semibold text-slate-900">Sawal aur Jawab</h3>
        {MACHINE_INSTALLATION_FAQS.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={faq.question}
              role="listitem"
              className="rounded-lg border border-slate-200 bg-slate-50/50 overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left hover:bg-slate-100/80 transition-colors"
                aria-expanded={isOpen}
              >
                <span className="text-sm sm:text-base font-semibold text-slate-900 pr-2">
                  {faq.question}
                </span>
                <span className="shrink-0 text-slate-500">
                  {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </span>
              </button>
              {isOpen && (
                <div className="px-4 pb-4 pt-0">
                  <p className="text-slate-700 text-sm leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showPageLink && (
        <Button asChild variant="outline" className="talent-btn-outline rounded-full">
          <Link href="/machine-installation">Full installation page</Link>
        </Button>
      )}
    </div>
  );
}
