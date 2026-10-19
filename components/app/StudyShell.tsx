"use client";

import clsx from "clsx";
import { ChevronLeft, X } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { usePack } from "@/lib/use-pack";
import type { Pack } from "@/lib/types";
import { ButtonLink } from "../ui/Button";
import { PageLoader } from "../ui/Spinner";
import { RequireAuth } from "./RequireAuth";

interface StudyHeaderProps {
  backHref: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  /** 0–1; draws a progress bar under the header when set. */
  progress?: number;
  exitIcon?: boolean;
  width?: string;
}

/** Focus-mode top bar used by every study screen. */
export function StudyHeader({ backHref, title, subtitle, actions, progress, exitIcon, width = "max-w-[1100px]" }: StudyHeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-white/95 px-4 backdrop-blur sm:px-10">
      <div className={clsx("mx-auto flex flex-wrap items-center justify-between gap-3 py-3.5", width)}>
        <div className="flex min-w-0 items-center gap-3.5">
          <Link
            href={backHref}
            aria-label={exitIcon ? "Exit" : "Back to pack"}
            className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-line text-ink hover:border-ink"
          >
            {exitIcon ? <X size={18} /> : <ChevronLeft size={18} />}
          </Link>
          <div className="min-w-0">
            <div className="truncate font-bold">{title}</div>
            {subtitle && <div className="truncate text-[13px] text-muted">{subtitle}</div>}
          </div>
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
      {progress !== undefined && (
        <div className={clsx("mx-auto h-1 overflow-hidden rounded-full bg-brand-soft", width)}>
          <div className="h-1 bg-brand transition-[width] duration-500" style={{ width: `${Math.min(1, progress) * 100}%` }} />
        </div>
      )}
    </header>
  );
}

/** Loads the pack from the URL, guards auth, and handles missing packs for study pages. */
export function StudyShell({ children }: { children: (pack: Pack) => ReactNode }) {
  return (
    <RequireAuth>
      <PackLoader>{children}</PackLoader>
    </RequireAuth>
  );
}

function PackLoader({ children }: { children: (pack: Pack) => ReactNode }) {
  const { pack, status } = usePack();
  if (status === "loading") return <PageLoader label="Opening your pack" />;
  if (!pack) return <MissingPack />;
  return <div className="min-h-dvh bg-paper">{children(pack)}</div>;
}

export function MissingPack({ message = "This pack doesn't exist or you don't have access to it." }: { message?: string }) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-5 px-4 text-center">
      <h1 className="font-display text-3xl font-bold">Pack not found</h1>
      <p className="max-w-md text-muted">{message}</p>
      <ButtonLink href="/dashboard">Back to dashboard</ButtonLink>
    </div>
  );
}
