import clsx from "clsx";
import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentProps } from "react";
import { Spinner } from "./Spinner";

type Variant = "ink" | "lime" | "brand" | "outline" | "ghost" | "light" | "outlineDark";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  ink: "bg-ink text-paper hover:bg-ink-2",
  lime: "bg-lime text-ink hover:brightness-95",
  brand: "bg-brand text-white hover:bg-brand-dark",
  outline: "bg-white text-ink border border-line-strong hover:border-ink",
  ghost: "bg-transparent text-muted hover:text-ink",
  light: "bg-paper text-ink hover:bg-white",
  outlineDark: "bg-transparent text-paper border border-ink-line hover:border-soft",
};

const sizes: Record<Size, string> = {
  sm: "min-h-11 px-4 text-sm rounded-xl",
  md: "min-h-12 px-5 rounded-[14px]",
  lg: "min-h-14 px-6 text-[17px] rounded-2xl",
};

export const buttonClass = (variant: Variant = "ink", size: Size = "md", className?: string) =>
  clsx(
    "inline-flex items-center justify-center gap-2.5 font-ui font-bold transition duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:pointer-events-none disabled:opacity-50",
    variants[variant],
    sizes[size],
    className,
  );

interface StyleProps {
  variant?: Variant;
  size?: Size;
}

export function Button({
  variant,
  size,
  loading,
  className,
  children,
  disabled,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & StyleProps & { loading?: boolean }) {
  return (
    <button type={type} className={buttonClass(variant, size, className)} disabled={disabled || loading} {...props}>
      {loading && <Spinner />}
      {children}
    </button>
  );
}

export function ButtonLink({ variant, size, className, ...props }: ComponentProps<typeof Link> & StyleProps) {
  return <Link className={buttonClass(variant, size, className)} {...props} />;
}
