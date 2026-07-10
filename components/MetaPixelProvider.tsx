"use client";

import { Suspense } from "react";
import MetaPixel from "@/components/MetaPixel";

/** Suspense boundary required because MetaPixel uses useSearchParams */
export default function MetaPixelProvider() {
  return (
    <Suspense fallback={null}>
      <MetaPixel />
    </Suspense>
  );
}
