"use client";

import clsx from "clsx";

interface PillsProps<T extends string | number> {
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  label: string;
  /** "segmented" = tabs in a grey track, "pills" = separate rounded buttons. */
  look?: "segmented" | "pills";
  format?: (value: T) => string;
}

/** Single-choice button group used for filters, tabs and count pickers. */
export function Pills<T extends string | number>({ options, value, onChange, label, look = "pills", format = String }: PillsProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={clsx("flex flex-wrap gap-2", look === "segmented" && "inline-flex gap-1 rounded-[14px] bg-[#e9ebf0] p-1")}
    >
      {options.map((option) => {
        const active = option === value;
        return (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option)}
            className={clsx(
              "min-h-11 font-ui font-semibold transition",
              look === "segmented"
                ? ["rounded-[10px] px-4 text-sm", active ? "bg-white text-ink shadow-sm" : "text-muted hover:text-ink"]
                : ["rounded-full border px-4 text-sm", active ? "border-ink bg-ink text-paper" : "border-line-strong bg-white text-ink hover:border-ink"],
            )}
          >
            {format(option)}
          </button>
        );
      })}
    </div>
  );
}
