"use client";

import React, { useState } from "react";
import Script from "next/script";
import { buildFaqPageSchema, LASER_FAQS } from "@/lib/seo";

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function ChevronUpIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="m18 15-6-6-6 6" />
    </svg>
  );
}

export default function AEOFAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <>
      <Script
        id="faq-schema"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFaqPageSchema()) }}
      />
      <section
        className="page-container py-12 lg:py-14 bg-white border-b border-[var(--secondary-color)]/10"
        aria-labelledby="aeo-faq-heading"
      >
        <h2
          id="aeo-faq-heading"
          className="text-2xl font-bold text-slate-900 tracking-tight mb-2"
        >
          Laser Cutting Machines & Parts — FAQs
        </h2>
        <p className="text-slate-600 mb-8 max-w-3xl">
          Metal fiber laser machines only (not wood CNC). Prices, imports (Cypcut,
          Weihong, MAX), single-phase &amp; solar, sheet/tube/mark/weld, and parts in Pakistan.
        </p>

        <div className="space-y-3" role="list">
          {LASER_FAQS.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={faq.question}
                role="listitem"
                className="rounded-lg border border-slate-200 bg-slate-50/50 overflow-hidden transition-shadow hover:shadow-sm focus-within:ring-2 focus-within:ring-[var(--primary-color)] focus-within:ring-offset-2"
              >
                <button
                  type="button"
                  onClick={() => toggle(index)}
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-slate-100/80 transition-colors rounded-lg"
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${index}`}
                  id={`faq-question-${index}`}
                >
                  <span className="text-base font-semibold text-slate-900 pr-4">
                    {faq.question}
                  </span>
                  <span
                    className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-600 transition-transform duration-200"
                    aria-hidden
                  >
                    {isOpen ? (
                      <ChevronUpIcon className="w-5 h-5" />
                    ) : (
                      <ChevronDownIcon className="w-5 h-5" />
                    )}
                  </span>
                </button>
                <div
                  id={`faq-answer-${index}`}
                  role="region"
                  aria-labelledby={`faq-question-${index}`}
                  className="grid transition-[grid-template-rows] duration-200 ease-out"
                  style={{
                    gridTemplateRows: isOpen ? "1fr" : "0fr",
                  }}
                >
                  <div className="min-h-0 overflow-hidden">
                    <div className="px-5 pb-5 pt-0">
                      <p className="text-slate-700 leading-relaxed text-[15px]">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
