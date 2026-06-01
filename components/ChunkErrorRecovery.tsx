"use client";

import { useEffect } from "react";

const RELOAD_KEY = "krallaser_chunk_reload_once";

function shouldRecoverChunkError(reason: unknown): boolean {
  const text =
    typeof reason === "string"
      ? reason
      : (reason as { message?: string })?.message || "";
  return /ChunkLoadError|Loading chunk [\w-]+ failed/i.test(text);
}

function recoverByReload() {
  try {
    if (sessionStorage.getItem(RELOAD_KEY) === "1") return;
    sessionStorage.setItem(RELOAD_KEY, "1");
  } catch {
    // Ignore storage errors and still try reload.
  }
  const next = new URL(window.location.href);
  next.searchParams.set("_r", String(Date.now()));
  window.location.replace(next.toString());
}

export default function ChunkErrorRecovery() {
  useEffect(() => {
    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (shouldRecoverChunkError(event.reason)) recoverByReload();
    };

    const onError = (event: ErrorEvent) => {
      if (shouldRecoverChunkError(event.error || event.message)) recoverByReload();
    };

    window.addEventListener("unhandledrejection", onUnhandledRejection);
    window.addEventListener("error", onError);

    try {
      sessionStorage.removeItem(RELOAD_KEY);
    } catch {
      // Ignore storage errors.
    }

    return () => {
      window.removeEventListener("unhandledrejection", onUnhandledRejection);
      window.removeEventListener("error", onError);
    };
  }, []);

  return null;
}

