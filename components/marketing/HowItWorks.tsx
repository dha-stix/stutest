import { Check, Upload } from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";
import stepSignin from "@/images/step-signin.svg";
import { Reveal } from "./Reveal";
import { SectionHeading, sectionX } from "./SectionHeading";

const STEPS: { title: string; body: string; visual: ReactNode }[] = [
  {
    title: "Sign in with Google",
    body: "One tap. Your packs, scores and chats sync to your account.",
    visual: <Image src={stepSignin} alt="Animated Google sign-in" className="size-full object-cover" unoptimized />,
  },
  {
    title: "Add your AI key",
    body: "Paste a Claude, ChatGPT or Grok key. We check it instantly so you know it works before you start.",
    visual: (
      <div className="flex size-full flex-col justify-center gap-2.5 bg-ink p-5">
        <div className="flex gap-2 text-[13px]">
          <span className="rounded-lg bg-lime px-2.5 py-1.5 font-bold text-ink">Claude</span>
          <span className="rounded-lg border border-ink-line px-2.5 py-1.5 text-soft">ChatGPT</span>
          <span className="rounded-lg border border-ink-line px-2.5 py-1.5 text-soft">Grok</span>
        </div>
        <div className="rounded-[10px] border border-ink-line p-3 font-mono text-[13px] text-soft">sk-ant-••••••••••••4f2a</div>
        <div className="flex items-center gap-1.5 text-[13px] font-semibold text-lime">
          <Check size={15} /> Key verified
        </div>
      </div>
    ),
  },
  {
    title: "Topic or document",
    body: "Type a topic, or upload a PDF/DOCX. We read up to 20 pages and build your packs.",
    visual: (
      <div className="flex size-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-soft text-sm text-muted">
        <Upload className="sv-bob text-brand" size={32} strokeWidth={1.8} />
        <span className="font-semibold text-ink">lecture-notes.pdf</span>
        <span>12 of 12 pages used</span>
      </div>
    ),
  },
];

export function HowItWorks() {
  return (
    <section id="how" className={`py-20 md:py-28 ${sectionX}`}>
      <div className="mx-auto max-w-[1240px]">
        <SectionHeading eyebrow="How it works" title={<>From blank page to <em className="accent">practice test</em> in three steps.</>} />
        <div className="mt-10 grid md:mt-14 grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6">
          {STEPS.map((step, i) => (
            <Reveal key={step.title} delay={i * 0.1}>
              <div className="st-lift h-full rounded-3xl border border-line bg-white p-7">
                <div className="font-mono font-bold text-brand">0{i + 1}</div>
                <h3 className="mb-2 mt-3 font-display text-[21px] sm:text-[23px] font-bold">{step.title}</h3>
                <p className="leading-relaxed text-muted">{step.body}</p>
                <div className="mt-6 h-[180px] overflow-hidden rounded-2xl">{step.visual}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
