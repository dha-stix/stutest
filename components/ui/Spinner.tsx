import clsx from "clsx";

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={clsx("inline-block size-4 animate-spin rounded-full border-2 border-current border-t-transparent", className)}
    />
  );
}

/** Full-area loading state used while pages fetch their data. */
export function PageLoader({ label = "Loading" }: { label?: string }) {
  return (
    <div role="status" className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-muted">
      <svg width="56" height="56" viewBox="0 0 56 56" aria-hidden="true">
        <circle cx="28" cy="28" r="22" fill="none" stroke="var(--color-brand-soft)" strokeWidth="6" />
        <circle className="sv-spin" cx="28" cy="28" r="22" fill="none" stroke="var(--color-brand)" strokeWidth="6" strokeLinecap="round" strokeDasharray="40 98" />
      </svg>
      <span className="font-semibold">{label}…</span>
    </div>
  );
}
