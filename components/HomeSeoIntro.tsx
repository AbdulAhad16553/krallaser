import Link from "next/link";
import { SITE_URL } from "@/lib/seo";

/** Keyword-rich, human-readable homepage copy for Google & AI crawlers. */
export default function HomeSeoIntro() {
  return (
    <section
      className="page-container py-12 lg:py-14 border-b border-[var(--secondary-color)]/10 bg-white"
      aria-labelledby="home-seo-heading"
    >
      <h2
        id="home-seo-heading"
        className="text-2xl font-bold text-slate-900 tracking-tight mb-4"
      >
        Pakistan&apos;s laser cutting machine &amp; parts store
      </h2>
      <div className="prose prose-slate max-w-none text-slate-700 space-y-4 text-[15px] leading-relaxed">
        <p>
          <strong>Krallaser</strong> is an importer and online store for{" "}
          <strong>metal cutting fiber lasers</strong> (not wood CNC routers),{" "}
          plus <strong>sheet &amp; tube lasers</strong>,{" "}
          <strong>marking lasers</strong>, and{" "}
          <strong>laser welding machines</strong> in Pakistan. We configure
          systems with <strong>Cypcut</strong> cutting software,{" "}
          <strong>Weihong</strong> controls, and{" "}
          <strong>Raycus / MAX</strong> laser sources—plus lenses, nozzles,
          chillers, and consumables from our Lahore team.
        </p>
        <p>
          Browse{" "}
          <Link
            href="/machine"
            className="text-[var(--primary-color)] font-medium hover:underline"
          >
            laser cutting machines
          </Link>
          , shop{" "}
          <Link
            href="/parts"
            className="text-[var(--primary-color)] font-medium hover:underline"
          >
            parts &amp; accessories
          </Link>
          , or view our full{" "}
          <Link
            href="/shop"
            className="text-[var(--primary-color)] font-medium hover:underline"
          >
            catalog
          </Link>
          . Based in Lahore with support across Pakistan—call{" "}
          <a
            href="tel:+923214198406"
            className="text-[var(--primary-color)] font-medium hover:underline"
          >
            +92 321 4198406
          </a>{" "}
          or visit{" "}
          <a
            href={SITE_URL}
            className="text-[var(--primary-color)] font-medium hover:underline"
          >
            krallaser.com
          </a>
          .
        </p>

        <h3 className="text-xl font-semibold text-slate-900 pt-2">
          Popular laser searches in Pakistan (2026)
        </h3>
        <ul className="list-disc pl-5 space-y-2 text-slate-700">
          <li>
            <strong>1kW–3kW fiber laser price</strong> — Compare power for your
            sheet thickness; see our{" "}
            <Link
              href="/blog/1kw-3kw-fiber-laser-price-pakistan"
              className="text-[var(--primary-color)] font-medium hover:underline"
            >
              1kW–3kW price guide
            </Link>{" "}
            and machines at{" "}
            <Link
              href="/machine"
              className="text-[var(--primary-color)] font-medium hover:underline"
            >
              /machine
            </Link>
            .
          </li>
          <li>
            <strong>Chinese fiber laser importers</strong> — Krallaser supplies
            Cypcut, Weihong, and MAX/Raycus-class systems with local parts:{" "}
            <Link
              href="/blog/chinese-fiber-laser-importer-pakistan"
              className="text-[var(--primary-color)] font-medium hover:underline"
            >
              importer guide
            </Link>
            .
          </li>
          <li>
            <strong>Metal laser cutting services</strong> (not wood CNC) — We
            sell fiber machines for in-house steel/aluminum work; read{" "}
            <Link
              href="/blog/metal-laser-cutting-services-pakistan"
              className="text-[var(--primary-color)] font-medium hover:underline"
            >
              services vs owning a machine
            </Link>
            .
          </li>
          <li>
            <strong>Single phase fiber laser</strong> &amp;{" "}
            <strong>solar compatible laser</strong> — Power planning for 220V
            and solar workshops:{" "}
            <Link
              href="/blog/single-phase-solar-fiber-laser-pakistan-2026"
              className="text-[var(--primary-color)] font-medium hover:underline"
            >
              2026 electrical guide
            </Link>
            .
          </li>
          <li>
            <strong>Sheet &amp; tube, marking &amp; welding</strong> —{" "}
            <Link
              href="/blog/sheet-tube-marking-welding-laser-machines-pakistan"
              className="text-[var(--primary-color)] font-medium hover:underline"
            >
              machine types we import
            </Link>
            .
          </li>
        </ul>
      </div>
    </section>
  );
}
