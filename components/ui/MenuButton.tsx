"use client";

import clsx from "clsx";

interface MenuButtonProps {
  open: boolean;
  onClick: () => void;
  /** id of the menu this button controls. */
  controls: string;
  tone?: "dark" | "light";
  className?: string;
}

/** Hamburger that morphs into an X: the outer bars rotate in, the middle bar shrinks away. */
export function MenuButton({ open, onClick, controls, tone = "dark", className }: MenuButtonProps) {
  const bar = clsx(
    "absolute left-1/2 h-[2px] w-[18px] -translate-x-1/2 rounded-full transition-all duration-300 ease-[cubic-bezier(.2,.8,.2,1)]",
    tone === "dark" ? "bg-paper" : "bg-ink",
  );
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={open ? "Close menu" : "Open menu"}
      aria-expanded={open}
      aria-controls={controls}
      className={clsx(
        "relative z-50 size-11 shrink-0 rounded-xl border transition-colors",
        tone === "dark" ? "border-ink-line hover:border-soft" : "border-line bg-white hover:border-ink",
        open && (tone === "dark" ? "border-soft" : "border-ink"),
        className,
      )}
    >
      <span className={clsx(bar, open ? "top-1/2 -translate-y-1/2 rotate-45" : "top-[14px]")} />
      <span className={clsx(bar, "top-1/2 -translate-y-1/2", open ? "scale-x-0 opacity-0" : "scale-x-100 opacity-100")} />
      <span className={clsx(bar, open ? "top-1/2 -translate-y-1/2 -rotate-45" : "bottom-[14px]")} />
    </button>
  );
}
