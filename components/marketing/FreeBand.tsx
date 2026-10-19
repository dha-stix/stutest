import { Check } from "lucide-react";
import { ButtonLink } from "../ui/Button";
import { Reveal } from "./Reveal";
import { SectionHeading, sectionX } from "./SectionHeading";

const PERKS = ["All six study modes", "Unlimited packs", "Offline downloads"];

export function FreeBand() {
  return (
    <section id="free" className={`relative overflow-hidden bg-ink py-16 md:py-24 text-paper ${sectionX}`}>
      <svg viewBox="0 0 1200 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true" className="pointer-events-none absolute inset-0 size-full">
        <g className="sv-orbit" style={{ transformOrigin: "1050px 200px" }}>
          <circle cx="1050" cy="200" r="150" fill="none" stroke="var(--color-ink-line)" strokeWidth="2" strokeDasharray="4 12" />
          <circle cx="1050" cy="50" r="8" fill="var(--color-lime)" />
        </g>
        <g className="sv-orbit" style={{ transformOrigin: "150px 220px", animationDuration: "36s" }}>
          <circle cx="150" cy="220" r="110" fill="none" stroke="var(--color-ink-line)" strokeWidth="2" strokeDasharray="4 12" />
          <circle cx="260" cy="220" r="6" fill="#8576F7" />
        </g>
      </svg>
      <Reveal className="relative mx-auto max-w-[900px] text-center">
        <SectionHeading eyebrow="100% free" title={<>Free for <em className="accent text-lime">every student.</em></>} tone="dark" center />
        <p className="mx-auto mt-5 max-w-[560px] text-lg leading-relaxed text-soft">No plans, no paywalls. Connect your own AI key and use every study mode.</p>
        <ul className="mt-7 flex flex-wrap justify-center gap-x-6 gap-y-2.5">
          {PERKS.map((p) => (
            <li key={p} className="flex items-center gap-2">
              <Check size={18} strokeWidth={3} className="text-lime" />
              {p}
            </li>
          ))}
        </ul>
        <ButtonLink href="/auth/register" variant="lime" size="lg" className="mt-9 font-extrabold">
          Start studying free
        </ButtonLink>
      </Reveal>
    </section>
  );
}
