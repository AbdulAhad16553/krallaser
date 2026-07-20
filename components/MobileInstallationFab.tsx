"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import MachineInstallationGuide from "@/components/MachineInstallationGuide";
import { MACHINE_INSTALLATION_TITLE } from "@/lib/machineInstallationGuide";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Anchor, X } from "lucide-react";

/** Floating button on mobile home — opens machine floor installation instructions */
export default function MobileInstallationFab() {
  const pathname = usePathname() || "/";
  const [open, setOpen] = useState(false);

  if (pathname !== "/") return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "md:hidden fixed z-[55] left-4",
          "bottom-[calc(4.25rem+env(safe-area-inset-bottom,0px))]",
          "flex h-14 w-14 items-center justify-center rounded-full",
          "bg-[var(--primary-color)] text-white",
          "shadow-lg shadow-red-600/40 ring-4 ring-[var(--primary-color)]/25",
          "active:scale-95 transition-transform",
          "animate-in fade-in slide-in-from-bottom-4 duration-300"
        )}
        aria-label="Machine installation guide — zameen mein lagane ka tareeqa"
      >
        <Anchor className="h-6 w-6 fill-white/20" strokeWidth={2.5} aria-hidden />
      </button>

      <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay
            className={cn(
              "md:hidden fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-[6px]",
              "data-[state=open]:animate-in data-[state=closed]:animate-out",
              "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
            )}
          />
          <DialogPrimitive.Content
            className={cn(
              "md:hidden fixed z-[101] inset-x-0 bottom-0 flex flex-col",
              "max-h-[min(92dvh,820px)] rounded-t-2xl bg-white shadow-2xl outline-none",
              "data-[state=open]:animate-in data-[state=closed]:animate-out",
              "data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
              "duration-300"
            )}
          >
            <div className="shrink-0 flex items-center justify-between gap-3 px-4 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-red-50/40">
              <div className="min-w-0">
                <DialogPrimitive.Title className="text-base font-bold text-slate-900 leading-snug line-clamp-2">
                  {MACHINE_INSTALLATION_TITLE}
                </DialogPrimitive.Title>
                <p className="text-xs text-slate-500 mt-0.5">Anchor · bolts · weld · floor</p>
              </div>
              <DialogPrimitive.Close className="shrink-0 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200">
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </DialogPrimitive.Close>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 py-4 pb-6">
              <MachineInstallationGuide compact />
              <Link
                href="/machine-installation"
                onClick={() => setOpen(false)}
                className="mt-4 block text-center text-sm font-medium text-[var(--primary-color)] underline underline-offset-2"
              >
                Poori guide page kholen
              </Link>
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </>
  );
}
