import clsx from "clsx";
import type { ReactNode } from "react";

const tones = {
  info: "bg-brand-tint text-brand-deep border-brand-line",
  warn: "bg-warn-soft text-warn-ink border-[#ffd9a8]",
  error: "bg-danger-soft text-danger-ink border-[#f5c2bc]",
  success: "bg-success-soft text-success-ink border-[#a7dec4]",
};

export function Notice({ tone = "info", children, className }: { tone?: keyof typeof tones; children: ReactNode; className?: string }) {
  return (
    <div role={tone === "error" ? "alert" : "status"} className={clsx("rounded-xl border px-4 py-3 text-sm leading-relaxed", tones[tone], className)}>
      {children}
    </div>
  );
}
