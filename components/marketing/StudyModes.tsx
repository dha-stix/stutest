import clsx from "clsx";
import type { ReactNode } from "react";
import { Reveal } from "./Reveal";
import { SectionHeading, sectionX } from "./SectionHeading";

const eyebrow = "text-[13px] font-bold font-ui uppercase tracking-[0.08em]";
const cardTitle = "font-display font-bold leading-[1.05]";

function Card({ className, children }: { className: string; children: ReactNode }) {
  return <div className={clsx("st-lift h-full rounded-3xl p-6 sm:p-8", className)}>{children}</div>;
}

const SECTIONS = [
  { label: "Section 1 · Q1–50", value: "46/50", tone: "text-lime" },
  { label: "Section 2 · Q51–100", value: "In progress", tone: "text-soft", active: true },
  { label: "Section 3 · Q101–150", value: "~38 min", tone: "text-faint" },
];

export function StudyModes() {
  return (
    <section id="modes" className={`pb-20 md:pb-28 ${sectionX}`}>
      <div className="mx-auto max-w-[1240px]">
        <SectionHeading eyebrow="Study modes" title={<>Six ways to learn it. <em className="accent">One upload.</em></>} />
        <div className="mt-10 grid md:mt-14 grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] gap-5">
          <Reveal className="col-span-full">
            <Card className="flex flex-wrap items-center gap-6 bg-ink text-paper sm:min-h-[300px] sm:gap-8">
              <div className="flex-[1_1_260px]">
                <span className={clsx(eyebrow, "text-lime")}>Multiple choice packs</span>
                <h3 className={clsx(cardTitle, "my-3 text-[21px] sm:text-[23px] sm:text-[30px]")}>Timed. Sectioned. <em className="accent text-lime">Scored.</em></h3>
                <p className="leading-relaxed text-soft">
                  Generate 150 questions and get a pack of three 50-question sections. Each section&apos;s timer is set from how long its questions take to read.
                </p>
              </div>
              <div className="flex flex-[1_1_260px] flex-col gap-2.5">
                {SECTIONS.map((s) => (
                  <div key={s.label} className={clsx("flex items-center justify-between gap-3 rounded-xl bg-ink-2 px-4 py-3.5 text-sm sm:text-base", s.active && "border border-brand")}>
                    <span className="min-w-0 truncate">{s.label}</span>
                    <span className={clsx("shrink-0 whitespace-nowrap font-mono", s.tone)}>{s.value}</span>
                  </div>
                ))}
              </div>
            </Card>
          </Reveal>

          <Reveal>
            <Card className="flex min-h-[220px] flex-col justify-between bg-lime sm:min-h-[300px]">
              <span className={eyebrow}>Flashcards</span>
              <div>
                <h3 className={clsx(cardTitle, "mb-2 text-3xl")}>Flip, recall, <em className="accent">repeat.</em></h3>
                <p className="leading-normal text-lime-ink">A smooth 3D flip — question on the front, answer on the back.</p>
              </div>
            </Card>
          </Reveal>

          <Reveal delay={0.05}>
            <Card className="min-h-[260px] border border-line bg-white">
              <span className={clsx(eyebrow, "text-brand")}>Fill in the gap</span>
              <h3 className={clsx(cardTitle, "my-3 text-[22px] sm:text-[24px]")}>Type the missing word.</h3>
              <p className="text-[17px] leading-[1.7]">
                The powerhouse of the cell is the{" "}
                <span className="inline-block min-w-[120px] border-b-2 border-dashed border-brand font-semibold text-brand">mitochond</span>.
              </p>
            </Card>
          </Reveal>

          <Reveal delay={0.1}>
            <Card className="min-h-[260px] border border-line bg-white">
              <span className={clsx(eyebrow, "text-brand")}>Key points</span>
              <h3 className={clsx(cardTitle, "my-3 text-[22px] sm:text-[24px]")}>What you must know.</h3>
              <ol className="flex flex-col gap-2 text-[#3a3f50]">
                {["Cells are the basic unit of life", "ATP stores and moves energy", "Membranes control what enters"].map((t, i) => (
                  <li key={t} className="flex gap-2.5">
                    <span className="font-bold text-brand">0{i + 1}</span>
                    {t}
                  </li>
                ))}
              </ol>
            </Card>
          </Reveal>

          <Reveal>
            <Card className="flex min-h-[260px] flex-col gap-3 bg-brand-soft">
              <span className={clsx(eyebrow, "text-brand")}>Chat with your document</span>
              <div className="max-w-[80%] self-end rounded-[16px_16px_4px_16px] bg-brand px-3.5 py-2.5 text-white">What does page 3 say about enzymes?</div>
              <div className="max-w-[85%] self-start rounded-[16px_16px_16px_4px] bg-white px-3.5 py-2.5 leading-snug">
                Enzymes lower activation energy… <span className="font-semibold text-brand">(p. 3)</span>
              </div>
            </Card>
          </Reveal>

          <Reveal delay={0.05}>
            <Card className="flex min-h-[260px] flex-col justify-between border border-line bg-white">
              <span className={clsx(eyebrow, "text-brand")}>Offline packs</span>
              <div>
                <h3 className={clsx(cardTitle, "mb-2 text-[22px] sm:text-[24px]")}>Download Q&amp;A as PDF.</h3>
                <p className="leading-normal text-muted">Questions and answers, formatted for print or study on the train.</p>
              </div>
            </Card>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
