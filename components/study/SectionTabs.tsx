"use client";

import { Pills } from "../ui/Pills";

/** Deck/section switcher shown only when a mode has more than one part. */
export function SectionTabs({ count, value, onChange, noun }: { count: number; value: number; onChange: (i: number) => void; noun: string }) {
  if (count < 2) return null;
  return (
    <div className="mb-6 overflow-x-auto">
      <Pills
        label={`${noun}s`}
        options={Array.from({ length: count }, (_, i) => i)}
        value={value}
        onChange={onChange}
        format={(i) => `${noun} ${i + 1}`}
      />
    </div>
  );
}
