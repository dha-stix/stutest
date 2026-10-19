import { Check } from "lucide-react";
import Image from "next/image";
import library from "@/images/library.svg";
import phoneFlashcards from "@/images/phone-flashcards.svg";
import { Reveal } from "./Reveal";
import { SectionHeading, sectionX } from "./SectionHeading";

const POINTS = ["Answers revealed after you submit", "Progress saved across sections", "Works on phone, tablet and desktop"];

export function Showcase() {
  return (
    <section className={`pb-28 ${sectionX}`}>
      <div className="mx-auto flex max-w-[1240px] flex-wrap items-center gap-12">
        <Reveal className="grid min-w-0 flex-[1_1_400px] grid-cols-2 gap-4">
          <div className="relative row-span-2 min-h-[380px] overflow-hidden rounded-3xl bg-brand">
            <Image src={library} alt="Illustration of a library bookshelf" fill className="object-cover" unoptimized />
          </div>
          <div className="relative min-h-[182px] overflow-hidden rounded-3xl bg-lime">
            <Image src={phoneFlashcards} alt="Phone showing a flashcard flipping" fill className="object-cover" unoptimized />
          </div>
          <div className="flex min-h-[182px] flex-col justify-end rounded-3xl bg-ink p-5 text-paper">
            <span className="font-display text-[40px] font-extrabold text-lime">86%</span>
            <span className="text-sm text-soft">Your score · Section 1</span>
          </div>
        </Reveal>
        <Reveal delay={0.1} className="min-w-0 flex-[1_1_400px]">
          <SectionHeading eyebrow="Results that teach" title="See every answer — and why." />
          <p className="mt-5 text-lg leading-relaxed text-muted">
            At the end of each test you get your score, the right answer for every question, and a short explanation. Retake only the questions you missed.
          </p>
          <ul className="mt-7 flex flex-col gap-3">
            {POINTS.map((p) => (
              <li key={p} className="flex items-center gap-3">
                <span className="flex size-7 items-center justify-center rounded-full bg-success-soft text-success">
                  <Check size={16} strokeWidth={3} />
                </span>
                {p}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
