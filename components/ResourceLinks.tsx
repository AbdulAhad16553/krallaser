"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Wrench, Layers, Gauge, Lightbulb, ChevronRight } from "lucide-react";

const resources = [
  {
    title: "Parts Recommendations",
    icon: Wrench,
    description: "Expert guidance for your laser setup",
    answerPoints: [
      "Match lens focal length, nozzle diameter, and assist gas to your machine power and typical sheet thickness.",
      "Stock protective windows, focus lenses, and nozzles — worn optics are a leading cause of poor cuts and downtime.",
      "Build a core spare-parts kit for your most common materials, then add specialty items (e.g. high-pressure nozzles) as jobs require.",
    ],
  },
  {
    title: "Applications",
    icon: Layers,
    description: "Material and use case guides",
    answerPoints: [
      "Stainless and mild steel: fiber laser with nitrogen or oxygen assist; tune power and speed for edge quality and dross.",
      "Acrylic and plastics: CO2 laser works well; use correct focus and air assist to avoid flaming or melted edges.",
      "Wood, MDF, and laminates: CO2 or lower-power fiber depending on thickness; watch for charring and use extraction.",
    ],
  },
  {
    title: "Power / Speed",
    icon: Gauge,
    description: "Optimal laser cutting parameters",
    answerPoints: [
      "Start from the machine maker’s parameter chart for your wattage and material, then adjust in small steps by edge finish.",
      "If edges are yellow, rough, or full of dross, reduce speed, check gas pressure, or verify focus height and nozzle condition.",
      "For thick plate, use multiple passes or higher assist pressure rather than max power alone — quality and nozzle life improve.",
    ],
  },
  {
    title: "Tips / Tricks",
    icon: Lightbulb,
    description: "Best practices and tricks",
    answerPoints: [
      "Clean lenses only with approved wipes and fluid; fingerprints and dust on optics reduce power and ruin cut quality.",
      "Keep sheet flat with strong clamps or a good vacuum bed — even slight lift causes inconsistent focus and bad kerf.",
      "Log successful jobs (material, thickness, power, speed, gas, nozzle) — your own laser ‘recipe book’ saves setup time.",
    ],
  },
];

export function ResourceLinks() {
  const [openTitle, setOpenTitle] = useState<string | null>(null);

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {resources.map((item, i) => {
        const isOpen = openTitle === item.title;

        return (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className="flex flex-col gap-2"
          >
            <button
              type="button"
              onClick={() =>
                setOpenTitle((prev) => (prev === item.title ? null : item.title))
              }
              className="group flex items-center justify-between p-5 rounded-xl border border-slate-200 bg-white hover:border-[var(--primary-color)]/30 hover:shadow-md hover:shadow-[var(--primary-color)]/5 transition-all duration-200 text-left w-full"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-[var(--secondary-color)]/10 flex items-center justify-center group-hover:bg-[var(--primary-color)]/10 transition-colors">
                  <item.icon className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 group-hover:text-[var(--primary-color)] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-500">{item.description}</p>
                </div>
              </div>
              <ChevronRight
                className={`w-5 h-5 text-slate-400 transition-all ${
                  isOpen
                    ? "rotate-90 text-[var(--primary-color)]"
                    : "group-hover:text-[var(--primary-color)] group-hover:translate-x-0.5"
                }`}
              />
            </button>

            {isOpen && item.answerPoints && (
              <div className="rounded-lg border border-dashed border-[var(--primary-color)]/40 bg-white/70 px-4 py-3 text-sm text-slate-700">
                <ul className="list-disc list-inside space-y-1">
                  {item.answerPoints.map((point: string, idx: number) => (
                    <li key={idx}>{point}</li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        );
      })}
    </section>
  );
}
