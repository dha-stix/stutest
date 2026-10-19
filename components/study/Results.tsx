"use client";

import clsx from "clsx";
import { Check, X } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { getLatestAttempt } from "@/lib/firebase-actions";
import { formatClock, percent } from "@/lib/study";
import type { Attempt, MCQuestion, Pack } from "@/lib/types";
import { MissingPack } from "../app/StudyShell";
import { DownloadButton } from "../packs/DownloadButton";
import { ConfettiBurst } from "../svg/AnimatedIcons";
import { ButtonLink } from "../ui/Button";
import { Pills } from "../ui/Pills";
import { PageLoader } from "../ui/Spinner";

const KEYS = "ABCDEFGH";
const FILTERS = ["All", "Correct", "Wrong"] as const;

function verdict(p: number) {
  if (p >= 90) return "Excellent work.";
  if (p >= 75) return "Great job.";
  if (p >= 50) return "Good effort — review the misses.";
  return "Keep going — you'll get there.";
}

/** Big animated score ring. */
function ScoreRing({ score, total }: { score: number; total: number }) {
  const r = 78;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative size-[180px] shrink-0">
      <svg width="180" height="180" viewBox="0 0 180 180" role="img" aria-label={`Score ${score} out of ${total}`} className="-rotate-90">
        <circle cx="90" cy="90" r={r} fill="none" stroke="var(--color-ink-line)" strokeWidth="16" />
        <circle
          className="sv-ring"
          cx="90"
          cy="90"
          r={r}
          fill="none"
          stroke="var(--color-lime)"
          strokeWidth="16"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - score / Math.max(total, 1))}
          style={{ ["--ring-from" as string]: c }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-[46px] font-extrabold leading-none">{percent(score, total)}%</span>
        <span className="mt-1 text-sm text-soft">
          {score} / {total}
        </span>
      </div>
    </div>
  );
}

export function Results({ pack }: { pack: Pack }) {
  const { user } = useAuth();
  const sectionIndex = Number(useParams<{ section: string }>().section);
  const section = pack.mcq?.sections[sectionIndex];
  const [attempt, setAttempt] = useState<Attempt | null | undefined>(undefined);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");

  useEffect(() => {
    if (user) getLatestAttempt(pack.id, user.uid, "mcq", sectionIndex).then(setAttempt, () => setAttempt(null));
  }, [pack.id, user, sectionIndex]);

  if (!section) return <MissingPack message="This section doesn't exist in the pack." />;
  if (attempt === undefined) return <PageLoader label="Scoring your answers" />;
  if (!attempt) return <MissingPack message="You haven't finished this section yet." />;

  const byId = new Map(section.questions.map((q) => [q.id, q]));
  const rows = attempt.questionIds
    .map((id, i) => ({ q: byId.get(id), answer: attempt.answers[i] as number | null, n: i + 1 }))
    .filter((r): r is { q: MCQuestion; answer: number | null; n: number } => !!r.q)
    .map((r) => ({ ...r, ok: r.answer === r.q.answerIndex }));
  const wrong = rows.filter((r) => !r.ok).length;
  const skipped = rows.filter((r) => r.answer === null).length;
  const hasNext = sectionIndex + 1 < (pack.mcq?.sections.length ?? 0);
  const shown = rows.filter((r) => filter === "All" || (filter === "Correct" ? r.ok : !r.ok));
  const p = percent(attempt.score, attempt.total);

  return (
    <>
      <section className="relative overflow-hidden bg-ink px-4 pb-14 pt-6 text-paper sm:px-10">
        {p >= 50 && <ConfettiBurst />}
        <div className="relative mx-auto max-w-[1100px]">
          <Link href={`/packs/${pack.id}`} className="text-sm font-semibold text-soft hover:text-paper">
            ← Back to pack
          </Link>
          <div className="mt-7 flex flex-wrap items-center gap-10">
            <ScoreRing score={attempt.score} total={attempt.total} />
            <div className="min-w-0 flex-[1_1_320px]">
              <p className="text-sm font-bold uppercase tracking-[0.08em] text-lime">Section {sectionIndex + 1} complete</p>
              <h1 className="mb-5 mt-2.5 font-display text-[clamp(32px,4vw,50px)] font-extrabold leading-[1.02] tracking-[-0.03em]">{verdict(p)}</h1>
              <div className="flex flex-wrap gap-2.5">
                {[
                  { label: "Correct", value: attempt.score, tone: "text-[#7ee2b4]" },
                  { label: "Wrong", value: wrong - skipped, tone: "text-[#ff9c92]" },
                  { label: "Skipped", value: skipped, tone: "" },
                  { label: "Time", value: formatClock(attempt.durationSec), tone: "font-mono" },
                ].map((s) => (
                  <div key={s.label} className="rounded-[14px] bg-ink-2 px-4 py-3">
                    <div className="text-xs text-faint">{s.label}</div>
                    <div className={clsx("text-xl font-bold", s.tone)}>{s.value}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-[0_1_240px] flex-col gap-2.5">
              {hasNext && (
                <ButtonLink href={`/packs/${pack.id}/mcq/${sectionIndex + 1}`} variant="lime">
                  Next: Section {sectionIndex + 2} →
                </ButtonLink>
              )}
              {wrong > 0 && (
                <ButtonLink href={`/packs/${pack.id}/mcq/${sectionIndex}?missed=1`} variant="outlineDark">
                  Retake {wrong} missed
                </ButtonLink>
              )}
              <ButtonLink href={`/packs/${pack.id}/mcq/${sectionIndex}`} variant="outlineDark">
                Retake whole section
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-[1100px] px-4 pb-14 pt-8 sm:px-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-[26px] font-bold">Answer review</h2>
          <div className="flex flex-wrap items-center gap-3">
            <Pills look="segmented" label="Filter answers" options={FILTERS} value={filter} onChange={setFilter} />
            <DownloadButton pack={pack} mode="mcq" label="Download" size="sm" />
          </div>
        </div>
        <div className="mt-5 flex flex-col gap-3">
          {shown.map(({ q, answer, n, ok }, i) => (
            <article
              key={q.id}
              className={clsx("st-in rounded-[20px] border bg-white p-5", ok ? "border-line" : "border-[#f5c2bc]")}
              style={{ animationDelay: `${Math.min(i, 10) * 0.03}s` }}
            >
              <div className="flex items-start gap-3.5">
                <span className={clsx("flex size-8 shrink-0 items-center justify-center rounded-full text-white", ok ? "bg-success" : "bg-danger")}>
                  {ok ? <Check size={16} strokeWidth={3} /> : <X size={16} strokeWidth={3} />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-semibold text-muted">Question {n}</div>
                  <h3 className="mb-3 mt-1 text-lg font-semibold leading-snug">{q.question}</h3>
                  <div className="flex flex-wrap gap-2 text-sm font-semibold">
                    <span className={clsx("rounded-[10px] px-3 py-2", ok ? "bg-success-soft text-success-ink" : "bg-danger-soft text-danger-ink")}>
                      Your answer: {answer === null ? "Skipped" : `${KEYS[answer]} · ${q.options[answer]}`}
                    </span>
                    {!ok && (
                      <span className="rounded-[10px] bg-success-soft px-3 py-2 text-success-ink">
                        Correct: {KEYS[q.answerIndex]} · {q.options[q.answerIndex]}
                      </span>
                    )}
                  </div>
                  {q.explanation && <p className="mt-3 leading-relaxed text-[#3a3f50]">{q.explanation}</p>}
                </div>
              </div>
            </article>
          ))}
          {!shown.length && <p className="rounded-2xl bg-white p-6 text-center text-muted">Nothing here.</p>}
        </div>
      </main>
    </>
  );
}
