import clsx from "clsx";
import Link from "next/link";

interface LogoProps {
  /** "dark" for dark backgrounds (lime mark, light text). */
  tone?: "dark" | "light";
  href?: string;
  className?: string;
  markClassName?: string;
}

export function Logo({ tone = "dark", href = "/", className, markClassName }: LogoProps) {
  return (
    <Link href={href} className={clsx("inline-flex items-center gap-2.5", tone === "dark" ? "text-paper" : "text-ink", className)}>
      <span
        className={clsx(
          "flex size-9 items-center justify-center rounded-[10px] font-display text-xl font-extrabold",
          tone === "dark" ? "bg-lime text-ink" : "bg-ink text-lime",
          markClassName,
        )}
      >
        S
      </span>
      <span className="font-display text-[22px] font-extrabold tracking-tight">Stutest</span>
    </Link>
  );
}
