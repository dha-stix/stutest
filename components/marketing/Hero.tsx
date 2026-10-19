import { ArrowDown } from "lucide-react";
import Image from "next/image";
import heroStudent from "@/images/hero-student.svg";
import { ButtonLink } from "../ui/Button";
import { GoogleIcon } from "../ui/GoogleIcon";
import { Navbar } from "./Navbar";
import { sectionX } from "./SectionHeading";

const SAMPLE_OPTIONS = [
  { key: "A", text: "Ribosome" },
  { key: "B", text: "Mitochondrion", chosen: true },
  { key: "C", text: "Golgi body" },
];

export function Hero() {
  return (
    <section className={`bg-ink pb-16 text-paper md:pb-24 ${sectionX}`}>
      <div className="mx-auto max-w-[1240px]">
        <Navbar />
        <div className="flex flex-wrap items-center gap-12 pt-6 md:gap-14 md:pt-14">
          <div className="st-in min-w-0 flex-[1_1_440px]">
            <div className="inline-flex items-center gap-2 rounded-full border border-ink-line py-1.5 pl-2 pr-3.5 text-sm text-soft">
              <span className="st-pulse ml-1.5 size-2 rounded-full bg-lime" />
              Powered by Claude, ChatGPT or Grok
            </div>
            <h1 className="mt-6 font-display text-[clamp(36px,6vw,72px)] font-bold leading-[0.95] tracking-[-0.035em]">
              Study smarter. <span className="text-lime">Ace <em className="accent">the test.</em></span>
            </h1>
            <p className="mt-6 max-w-[460px] text-[clamp(16px,1.4vw,18px)] leading-relaxed text-soft">
              Turn any topic or document into timed tests, flashcards and more.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <ButtonLink href="/auth/register" variant="light" size="lg" className="w-full sm:w-auto">
                <GoogleIcon /> Start free with Google
              </ButtonLink>
              <ButtonLink href="#how" variant="outlineDark" size="lg" className="w-full font-semibold sm:w-auto">
                See how it works <ArrowDown size={18} />
              </ButtonLink>
            </div>
          </div>

          <div className="relative h-[400px] min-w-0 flex-[1_1_340px] sm:h-[520px]" aria-hidden="true">
            <div className="absolute inset-[40px_0_20px_24px] overflow-hidden rounded-[32px] bg-brand sm:inset-[40px_20px_20px_40px]">
              <Image src={heroStudent} alt="" fill priority className="object-contain object-bottom" unoptimized />
            </div>

            <div className="st-float-a absolute left-0 top-0 w-[300px] max-w-[80%] rounded-[20px] bg-white p-4 sm:p-5 text-ink shadow-[0_30px_60px_-20px_rgba(0,0,0,.5)]">
              <div className="flex items-center justify-between text-xs font-semibold text-muted">
                <span>Section 2 of 3 · Q 14/50</span>
                <span className="font-mono text-brand">00:42</span>
              </div>
              <p className="mb-3.5 mt-3 font-semibold leading-snug">Which organelle produces most of a cell&apos;s ATP?</p>
              <div className="flex flex-col gap-2 text-sm">
                {SAMPLE_OPTIONS.map((o) => (
                  <div
                    key={o.key}
                    className={o.chosen ? "rounded-[10px] border-2 border-brand bg-brand-soft px-3 py-2 font-semibold" : "rounded-[10px] border border-line px-3 py-2.5"}
                  >
                    {o.key} · {o.text}
                  </div>
                ))}
              </div>
            </div>

            <div className="st-float-b absolute right-0 top-[220px] flex h-[124px] w-[176px] max-w-[60%] sm:top-[150px] sm:h-[150px] sm:w-[220px] flex-col justify-between rounded-[20px] bg-lime p-[18px] text-ink shadow-[0_30px_60px_-20px_rgba(0,0,0,.5)]">
              <span className="text-xs font-bold font-ui uppercase tracking-[0.08em]">Flashcard · tap to flip</span>
              <span className="font-display text-lg font-bold leading-tight sm:text-[22px]">What is osmosis?</span>
            </div>

            <div className="st-float-c absolute bottom-0 left-6 hidden items-center sm:flex gap-4 rounded-[20px] bg-white px-5 py-4 text-ink shadow-[0_30px_60px_-20px_rgba(0,0,0,.5)] sm:left-[60px]">
              <div className="flex size-16 items-center justify-center rounded-full bg-[conic-gradient(var(--color-success)_0_86%,var(--color-line)_86%_100%)]">
                <div className="flex size-[50px] items-center justify-center rounded-full bg-white text-[15px] font-bold">43/50</div>
              </div>
              <div>
                <div className="font-bold">Section complete</div>
                <div className="text-[13px] text-muted">Review 7 missed answers</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
