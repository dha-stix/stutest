"use client";

import { AnimatePresence, motion } from "motion/react";
import { Plus } from "lucide-react";
import { useState } from "react";
import clsx from "clsx";
import { sectionX } from "./SectionHeading";

const FAQS = [
  {
    q: "Which AI providers can I use?",
    a: "Claude (Anthropic), ChatGPT (OpenAI) or Grok (xAI). Paste one API key in settings; we verify it right away.",
  },
  {
    q: "Is Stutest free?",
    a: "Yes, completely. Stutest costs nothing. The only cost is what your AI provider charges for the requests your key makes.",
  },
  { q: "What happens if my API key does not work?", a: "We tell you straight away so you can check the key or switch to another provider." },
  {
    q: "How long can my document be?",
    a: "Up to 5 pages of PDF or DOCX. Longer files are trimmed to the first 5 pages and we show you which pages were used.",
  },
  { q: "Can I study offline?", a: "Yes. Every pack has a Download button that exports questions and answers as a PDF." },
];

export function Faq() {
  const [open, setOpen] = useState(0);

  return (
    <section id="faq" className={`pt-28 ${sectionX}`}>
      <div className="mx-auto max-w-[860px]">
        <h2 className="mb-8 font-display text-[clamp(34px,4.4vw,52px)] font-extrabold tracking-[-0.03em]">Questions</h2>
        <div className="flex flex-col gap-3">
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={f.q} className="rounded-[18px] border border-line bg-white">
                <h3>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpen(isOpen ? -1 : i)}
                    className="flex min-h-11 w-full items-center justify-between gap-4 px-6 py-5 text-left text-lg font-bold"
                  >
                    {f.q}
                    <Plus className={clsx("shrink-0 text-brand transition-transform duration-300", isOpen && "rotate-45")} />
                  </button>
                </h3>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="px-6 pb-5 leading-relaxed text-muted">{f.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
