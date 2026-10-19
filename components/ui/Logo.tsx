import clsx from "clsx";
import Link from "next/link";

interface LogoProps {
  /** "dark" for dark backgrounds (lime mark, light text). */
  tone?: "dark" | "light";
  href?: string;
  /** "sm" for compact bars (mobile app header). */
  size?: "md" | "sm";
  className?: string;
  markClassName?: string;
}

export function Logo({ tone = "dark", href = "/", size = "md", className, markClassName }: LogoProps) {
  return (
    <Link href={href} className={clsx("inline-flex items-center gap-2.5", tone === "dark" ? "text-paper" : "text-ink", className)}>
      <span
        className={clsx(
          "flex items-center justify-center rounded-[10px] font-display font-bold",
          size === "sm" ? "size-8 text-lg" : "size-9 text-xl",
          tone === "dark" ? "bg-lime text-ink" : "bg-ink text-lime",
          markClassName,
        )}
      >
        S
      </span>
      <span className={clsx("font-display font-bold tracking-tight", size === "sm" ? "text-xl" : "text-[22px]")}>Stutest</span>
    </Link>
  );
}
