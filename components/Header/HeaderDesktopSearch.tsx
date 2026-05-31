"use client";

import { FormEvent, useState, useEffect, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import {
  emitHomeCatalogSearchQuery,
  emitShopSearchQuery,
} from "@/lib/catalogSearchBridge";

const DEBOUNCE_MS = 280;

const LIVE_QUERY_PATHS = ["/", "/shop", "/parts", "/machine"] as const;

function isLiveQueryPath(p: string): boolean {
  return (LIVE_QUERY_PATHS as readonly string[]).includes(p);
}

function isShopLivePath(p: string): boolean {
  return p === "/shop" || p === "/parts" || p === "/machine";
}

/** Search in gradient header on md+ screens; live `?q=` on catalog routes */
export default function HeaderDesktopSearch() {
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const searchParams = useSearchParams();
  const qFromUrl = (searchParams.get("q") || "").trim();
  const live = isLiveQueryPath(pathname);

  const [value, setValue] = useState("");

  useEffect(() => {
    if (!live) return;
    setValue(qFromUrl);
  }, [live, qFromUrl]);

  const applyQueryToUrl = useCallback(
    (raw: string) => {
      const q = raw.trim();
      const base = pathname;
      if (q) {
        router.replace(`${base}?q=${encodeURIComponent(q)}`, { scroll: false });
      } else {
        router.replace(base, { scroll: false });
      }
    },
    [router, pathname]
  );

  useEffect(() => {
    if (!live) return;
    const t = setTimeout(() => {
      const next = value.trim();
      if (next === qFromUrl) return;
      applyQueryToUrl(value);
    }, DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [value, live, qFromUrl, applyQueryToUrl]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (live) {
      applyQueryToUrl(value);
      return;
    }
    const q = value.trim();
    if (q) router.push(`/shop?q=${encodeURIComponent(q)}`);
    else router.push("/shop");
  };

  return (
    <form
      onSubmit={onSubmit}
      className="header-search-bar hidden md:flex w-full max-w-xs items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition-colors"
      role="search"
    >
      <Search className="h-4 w-4 shrink-0 text-white/90" aria-hidden />
      <input
        type="search"
        enterKeyHint="search"
        autoComplete="off"
        value={value}
        onChange={(e) => {
          const v = e.target.value;
          setValue(v);
          if (pathname === "/") emitHomeCatalogSearchQuery(v);
          else if (isShopLivePath(pathname)) emitShopSearchQuery(v);
        }}
        placeholder="Search…"
        className="min-w-0 flex-1 border-0 bg-transparent p-0 text-white outline-none focus:ring-0"
        aria-label="Search products"
      />
    </form>
  );
}
