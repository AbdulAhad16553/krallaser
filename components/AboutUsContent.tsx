import React from "react";
import Link from "next/link";
import { BRAND_EMAIL, BRAND_NAME } from "@/lib/brand";

export default function AboutUsContent() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 text-slate-700">
      <p className="text-lg leading-relaxed">
        <strong>{BRAND_NAME}</strong> is a Lahore-based industrial machinery
        brand specializing in <strong>metal fiber laser cutting machines</strong>{" "}
        and high-precision cutting solutions for fabrication shops across Pakistan.
        We import and support Chinese fiber laser systems—not wood CNC routers,
        plasma cutters, or router-bit tooling.
      </p>

      <section>
        <h2 className="text-xl font-bold text-slate-900 mb-4 mt-10">
          Key products and services
        </h2>

        <h3 className="text-lg font-semibold text-slate-900 mb-3">
          Laser machines (metal cutting)
        </h3>
        <p className="mb-3 text-[15px] leading-relaxed">
          We distribute and import laser equipment for industrial metal work,
          including:
        </p>
        <ul className="list-disc pl-6 space-y-2 mb-6">
          <li>
            <strong>Fiber laser cutters:</strong> 1kW, 2kW, 3kW and higher for
            stainless steel, mild steel, aluminum sheet and plate—with{" "}
            <strong>Cypcut</strong> software and <strong>Weihong</strong> controls.
          </li>
          <li>
            <strong>Sheet &amp; tube laser systems:</strong> Combined flat-bed and
            tube cutting for railing, furniture metal frames, and structural work.
          </li>
          <li>
            <strong>Laser marking &amp; welding:</strong> Fiber markers and laser
            welders for serial numbers, logos, and stainless fabrication.
          </li>
        </ul>

        <h3 className="text-lg font-semibold text-slate-900 mb-3">
          Laser spare parts
        </h3>
        <p className="mb-3 text-[15px] leading-relaxed">
          We stock consumables and components that keep your metal laser running,
          including:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Focus lenses and protective windows</li>
          <li>Cutting nozzles and assist-gas hardware</li>
          <li>Chillers, cables, and matched consumables for popular head models</li>
        </ul>
        <p className="mt-4">
          Order online at{" "}
          <Link href="/parts" className="text-[var(--primary-color)] font-medium hover:underline">
            krallaser.com/parts
          </Link>{" "}
          or browse{" "}
          <Link href="/shop" className="text-[var(--primary-color)] font-medium hover:underline">
            the full shop
          </Link>
          .
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-slate-900 mb-4 mt-10">
          Operational details
        </h2>
        <ul className="list-disc pl-6 space-y-3">
          <li>
            <strong>Locations:</strong> Display center in Ichra, Lahore, and a
            warehouse near the Saggia Bypass Road.
          </li>
          <li>
            <strong>Industry focus:</strong> Metal fabrication, HVAC ducting,
            automotive sheet parts, stainless kitchens, signage metalwork, and
            industrial production—<em>not</em> MDF/wood furniture CNC.
          </li>
          <li>
            <strong>Reputation:</strong> We emphasize reliable cut quality,
            honest machine specs, and long-term parts availability, with over 10
            years of experience serving the Pakistani market.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-bold text-slate-900 mb-4 mt-10">
          Follow {BRAND_NAME}
        </h2>
        <p className="text-[15px] leading-relaxed mb-4">
          Stay connected for machine demos, new stock, spare-part offers, and
          laser cutting tips.
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <Link
              href="https://web.facebook.com/krallaser?modal=focused_switcher_dialog"
              className="text-[var(--primary-color)] font-medium hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Facebook — Krallaser
            </Link>
          </li>
          <li>
            <Link
              href="https://www.instagram.com/krallaser.9"
              className="text-[var(--primary-color)] font-medium hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Instagram — @krallaser.9
            </Link>
          </li>
          <li>
            <Link
              href="https://youtube.com/@krallaser"
              className="text-[var(--primary-color)] font-medium hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              YouTube — @krallaser
            </Link>
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-bold text-slate-900 mb-4 mt-10">
          Contact us
        </h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Phone / WhatsApp:</strong>{" "}
            <Link
              href="tel:+923214198406"
              className="text-[var(--primary-color)] font-medium hover:underline"
            >
              +92 321 4198406
            </Link>
          </li>
          <li>
            <strong>Email:</strong>{" "}
            <a
              href={`mailto:${BRAND_EMAIL}`}
              className="text-[var(--primary-color)] font-medium hover:underline"
            >
              {BRAND_EMAIL}
            </a>
          </li>
          <li>
            <strong>Website:</strong>{" "}
            <Link
              href="https://krallaser.com"
              className="text-[var(--primary-color)] font-medium hover:underline"
            >
              krallaser.com
            </Link>
          </li>
        </ul>
      </section>
    </div>
  );
}
