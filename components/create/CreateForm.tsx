"use client";

import clsx from "clsx";
import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { ApiClientError } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { FILL_GAP_COUNTS, FLASHCARD_COUNTS, MCQ_COUNTS, MCQ_PER_PAGE, MCQ_SECTION_SIZE, MODES, providerInfo } from "@/lib/constants";
import type { ParsedDocument } from "@/lib/documents";
import { createPack } from "@/lib/firebase-actions";
import { generatePack } from "@/lib/generate";
import { chunk } from "@/lib/study";
import type { StudyMode } from "@/lib/types";
import { countWords, estimatePack, formatTokens } from "@/lib/usage";
import { Sparkles } from "../svg/AnimatedIcons";
import { Button } from "../ui/Button";
import { Notice } from "../ui/Notice";
import { Pills } from "../ui/Pills";
import { DocumentDrop } from "./DocumentDrop";
import { GeneratingOverlay } from "./GeneratingOverlay";

const SUGGESTIONS = ["Photosynthesis", "Supply and demand", "Big-O notation", "The French Revolution"];

function Panel({ title, sub, children }: { title?: string; sub?: string; children: ReactNode }) {
  return (
    <section className="rounded-3xl border border-line bg-white p-6">
      {title && <h2 className="text-lg font-bold">{title}</h2>}
      {sub && <p className="mb-4 mt-1 text-sm text-muted">{sub}</p>}
      {!sub && title && <div className="mb-4" />}
      {children}
    </section>
  );
}

function SummaryRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex justify-between gap-3 text-soft">
      <span>{label}</span>
      <span className="text-right font-semibold text-paper">{value}</span>
    </div>
  );
}

export function CreateForm() {
  const router = useRouter();
  const { user, settings } = useAuth();
  const [source, setSource] = useState<"topic" | "upload">("topic");
  const [topic, setTopic] = useState("");
  const [doc, setDoc] = useState<ParsedDocument | null>(null);
  const [modes, setModes] = useState<StudyMode[]>(["mcq", "flashcards", "keypoints", "chat"]);
  const [counts, setCounts] = useState({ mcq: 50, flashcards: 40, fillGap: 20 });
  const [progress, setProgress] = useState<{ done: number; total: number; label: string } | null>(null);
  const [error, setError] = useState<ReactNode>("");

  const toggleMode = (m: StudyMode) => setModes((cur) => (cur.includes(m) ? cur.filter((x) => x !== m) : [...cur, m]));

  // A document can only support so many good questions: about MCQ_PER_PAGE per page
  // (or one per ~60 words, for sparse pages like slides), in steps of 5.
  const usingDoc = source === "upload" && doc ? doc : null;
  const mcqMax = usingDoc
    ? Math.max(5, Math.floor(Math.min(usingDoc.pagesUsed * MCQ_PER_PAGE, usingDoc.words / 60) / 5) * 5)
    : Infinity;
  const mcqOptions = MCQ_COUNTS.filter((c) => c <= mcqMax);
  if (Number.isFinite(mcqMax) && !mcqOptions.includes(mcqMax) && mcqMax < MCQ_COUNTS[MCQ_COUNTS.length - 1]) mcqOptions.push(mcqMax);
  const mcqCount = Math.min(counts.mcq, mcqMax);
  const effectiveCounts = { ...counts, mcq: mcqCount };
  const estimate = estimatePack(usingDoc ? usingDoc.words : countWords(topic) + 20, modes, effectiveCounts);

  const sections = chunk(Array.from({ length: mcqCount }), MCQ_SECTION_SIZE).map((s, i) => ({
    from: i * MCQ_SECTION_SIZE + 1,
    to: i * MCQ_SECTION_SIZE + s.length,
  }));
  const hasSource = source === "topic" ? topic.trim().length >= 3 : !!doc;
  const canGenerate = !!settings && hasSource && modes.some((m) => m !== "chat");

  async function handleGenerate() {
    if (!user || !settings) return;
    setError("");
    if (!hasSource) return setError(source === "topic" ? "Enter a topic of at least a few letters." : "Upload a document first.");

    const isDoc = source === "upload" && doc;
    const title = isDoc ? doc.fileName.replace(/\.(pdf|docx)$/i, "") : topic.trim().slice(0, 80);
    setProgress({ done: 0, total: 1, label: "Reading your material" });
    try {
      const pack = await generatePack(
        settings,
        {
          title,
          modes,
          counts: effectiveCounts,
          source: isDoc
            ? { type: "document", fileName: doc.fileName, pagesUsed: doc.pagesUsed, totalPages: doc.totalPages }
            : { type: "topic", topic: topic.trim() },
          payload: isDoc ? { text: doc.text } : { topic: topic.trim() },
        },
        (done, total, label) => setProgress({ done, total, label }),
      );
      setProgress((p) => p && { ...p, label: "Saving your pack" });
      const id = await createPack(user.uid, pack);
      router.push(`/packs/${id}`);
    } catch (err) {
      setProgress(null);
      if (err instanceof ApiClientError && err.code === "INVALID_KEY") {
        setError(
          <>
            {err.message}{" "}
            <Link href="/settings/api-key" className="font-bold underline">
              Update your key
            </Link>
          </>,
        );
      } else {
        setError(err instanceof Error ? err.message : "Generation failed. Please try again.");
      }
    }
  }

  return (
    <>
      <h1 className="mb-2 font-display text-[clamp(24px,2.8vw,34px)] font-bold tracking-[-0.03em]">Create a test</h1>
      <p className="mb-7 text-muted">Start from a topic or your own notes.</p>

      {!settings && (
        <Notice tone="warn" className="mb-6">
          You need to connect an AI provider first.{" "}
          <Link href="/settings/api-key" className="font-bold underline">
            Add your API key
          </Link>
        </Notice>
      )}

      <div className="flex flex-wrap items-start gap-6">
        <div className="flex min-w-0 flex-[2_1_520px] flex-col gap-5">
          <Panel>
            <Pills
              look="segmented"
              label="Source"
              options={["topic", "upload"] as const}
              value={source}
              onChange={setSource}
              format={(s) => (s === "topic" ? "Topic" : "Upload document")}
            />
            <div key={source} className="st-in mt-5">
              {source === "topic" ? (
                <>
                  <label htmlFor="topic" className="mb-2.5 block font-bold">
                    What do you want to be tested on?
                  </label>
                  <textarea
                    id="topic"
                    rows={3}
                    maxLength={500}
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. Krebs cycle for A-level Biology, focus on inputs and outputs"
                    className="w-full resize-y rounded-2xl border border-line-strong p-4 text-[17px]"
                  />
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="text-[13px] text-muted">Try:</span>
                    {SUGGESTIONS.map((s) => (
                      <button key={s} type="button" onClick={() => setTopic(s)} className="min-h-9 rounded-full bg-[#f0f1f5] px-3.5 text-sm hover:bg-brand-soft">
                        {s}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <DocumentDrop doc={doc} onChange={setDoc} />
              )}
            </div>
          </Panel>

          <Panel title="Study modes" sub="Pick one or more. Each becomes part of your pack.">
            <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,180px),1fr))] gap-2.5">
              {MODES.map((m) => {
                const on = modes.includes(m.id);
                return (
                  <button
                    key={m.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggleMode(m.id)}
                    className={clsx(
                      "flex min-h-[84px] flex-col items-start gap-1.5 rounded-2xl border-2 p-4 text-left transition",
                      on ? "border-brand bg-brand-soft text-brand-deep" : "border-line bg-white hover:border-brand-line",
                    )}
                  >
                    <span className="flex w-full items-center justify-between font-bold">
                      {m.name}
                      <span className={clsx("flex size-[22px] items-center justify-center rounded-full", on ? "bg-brand text-white" : "bg-[#f0f1f5] text-transparent")}>
                        <Check size={13} strokeWidth={3} />
                      </span>
                    </span>
                    <span className="text-[13px] opacity-80">{m.desc}</span>
                  </button>
                );
              })}
            </div>
          </Panel>

          {modes.includes("mcq") && (
            <Panel title="How many multiple-choice questions?">
              <Pills label="Question count" options={mcqOptions} value={mcqCount} onChange={(mcq) => setCounts({ ...counts, mcq })} />
              <div className="mt-4 flex flex-wrap gap-2">
                {sections.map((s, i) => (
                  <div key={i} className="st-pop flex-[1_1_120px] rounded-xl bg-brand-soft p-3 text-sm font-semibold text-brand-dark">
                    Section {i + 1} · Q{s.from}–{s.to}
                  </div>
                ))}
              </div>
              {usingDoc && (
                <p className="mt-3 text-sm text-muted">
                  Your document supports up to <strong className="text-ink">{mcqMax} questions</strong> (about {MCQ_PER_PAGE} per page). Asking for more would
                  make questions repetitive.
                </p>
              )}
              <p className="mt-3 text-sm text-muted">
                {mcqCount} questions → {sections.length} section{sections.length > 1 ? "s" : ""} of up to {MCQ_SECTION_SIZE}. Each section&apos;s timer is set from how long
                its questions take to read.
              </p>
            </Panel>
          )}

          {(modes.includes("flashcards") || modes.includes("fillGap")) && (
            <Panel title="More counts">
              <div className="flex flex-wrap gap-8">
                {modes.includes("flashcards") && (
                  <div>
                    <div className="mb-2 text-sm font-semibold text-muted">Flashcards</div>
                    <Pills label="Flashcard count" options={FLASHCARD_COUNTS} value={counts.flashcards} onChange={(flashcards) => setCounts({ ...counts, flashcards })} />
                  </div>
                )}
                {modes.includes("fillGap") && (
                  <div>
                    <div className="mb-2 text-sm font-semibold text-muted">Fill-in-the-gap</div>
                    <Pills label="Fill-in-the-gap count" options={FILL_GAP_COUNTS} value={counts.fillGap} onChange={(fillGap) => setCounts({ ...counts, fillGap })} />
                  </div>
                )}
              </div>
            </Panel>
          )}
        </div>

        <aside className="flex min-w-0 flex-[1_1_300px] flex-col gap-3.5 rounded-3xl bg-ink p-6 text-paper lg:sticky lg:top-8">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-[22px] font-bold">Summary</h2>
            <Sparkles />
          </div>
          <SummaryRow label="Source" value={source === "topic" ? "Topic" : doc ? `${doc.kind.toUpperCase()} · pages 1–${doc.pagesUsed}` : "No file yet"} />
          <SummaryRow label="Study modes" value={modes.length} />
          <SummaryRow label="MCQ" value={modes.includes("mcq") ? `${mcqCount} Q · ${sections.length} section${sections.length > 1 ? "s" : ""}` : "Off"} />
          <SummaryRow label="Model" value={settings ? providerInfo(settings.provider).name : "Not connected"} />
          <SummaryRow label="AI requests" value={estimate.requests} />
          <SummaryRow label="Estimated tokens" value={`~${formatTokens(estimate.total)}`} />
          {error && <Notice tone="error">{error}</Notice>}
          <Button variant="lime" size="lg" className="mt-2 w-full font-extrabold" disabled={!canGenerate} onClick={handleGenerate}>
            Generate pack <ArrowRight size={18} strokeWidth={2.4} />
          </Button>
          <p className="text-[13px] leading-normal text-faint">
            Tokens are charged to your own API key. Each request resends {usingDoc ? "your document" : "your topic"}, so more pages and more questions use more
            tokens. This is an estimate; reasoning models may use more. Typical time: 20–90 seconds.
          </p>
        </aside>
      </div>

      {progress && <GeneratingOverlay {...progress} />}
    </>
  );
}
