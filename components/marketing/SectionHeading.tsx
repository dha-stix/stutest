import clsx from "clsx";
import type { ReactNode } from "react";

interface SectionHeadingProps {
  eyebrow: string;
  title: ReactNode;
  tone?: "light" | "dark";
  center?: boolean;
  className?: string;
}

export function SectionHeading({ eyebrow, title, tone = "light", center, className }: SectionHeadingProps) {
  return (
    <div className={clsx(center && "text-center", className)}>
      <p className={clsx("font-ui text-sm font-bold uppercase tracking-[0.1em]", tone === "dark" ? "text-lime" : "text-brand")}>{eyebrow}</p>
      <h2
        className={clsx(
          "mt-3 max-w-3xl font-display text-[clamp(27px,3.6vw,44px)] font-bold leading-[1.02] tracking-[-0.03em]",
          center && "mx-auto",
        )}
      >
        {title}
      </h2>
    </div>
  );
}

/** Shared horizontal padding + max width for marketing sections. */
export const sectionX = "px-4 sm:px-[clamp(16px,4vw,64px)]";
