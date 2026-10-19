"use client";

import clsx from "clsx";
import { Flag } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { getLatestAttempt, saveAttempt } from "@/lib/firebase-actions";
import { clearQuizProgress, loadQuizProgress, saveQuizProgress } from "@/lib/progress";
import { formatClock, sectionSeconds } from "@/lib/study";
import type { MCQuestion, Pack } from "@/lib/types";
import { MissingPack, StudyHeader } from "../app/StudyShell";
import { TimerIcon } from "../svg/AnimatedIcons";
import { Button } from "../ui/Button";
import { PageLoader } from "../ui/Spinner";

const KEYS = "ABCDEFGH";

interface QuizSetup {
  questions: MCQuestion[];
  limit: number;
  numberOffset: number;
}

/** Works out which questions this run covers (the full section, or only last attempt's misses). */
function useQuizSetup(pack: Pack, sectionIndex: number, missedOnly: boolean): QuizSetup | null | "empty" {
  const { user } = useAuth();
  const section = pack.mcq?.sections[sectionIndex];
  const [missed, setMissed] = useState<MCQuestion[] | null>(null);

  useEffect(() => {
    if (!missedOnly || !section || !user) return;
    getLatestAttempt(pack.id, user.uid, "mcq", sectionIndex).then((attempt) => {
      if (!attempt) return setMissed(section.questions);
      const wrong = new Set(
        attempt.questionIds.filter((id, i) => attempt.answers[i] !== section.questions.find((q) => q.id === id)?.answerIndex),
      );
      setMissed(section.questions.filter((q) => wrong.has(q.id)));
    });
  }, [missedOnly, section, user, pack.id, sectionIndex]);

  if (!section) return null;
  const offset = pack.mcq!.sections.slice(0, sectionIndex).reduce((n, s) => n + s.questions.length, 0);
  if (!missedOnly) return { questions: section.questions, limit: section.timeLimitSec, numberOffset: offset };
  if (!missed) return null;
  if (!missed.length) return "empty";
  return { questions: missed, limit: sectionSeconds(missed), numberOffset: offset };
}

export function Quiz({ pack }: { pack: Pack }) {
  const params = useParams<{ section: string }>();
  const missedOnly = useSearchParams().get("missed") === "1";
  const sectionIndex = Number(params.section);
  const setup = useQuizSetup(pack, sectionIndex, missedOnly);

  if (!pack.mcq?.sections[sectionIndex]) return <MissingPack message="This section doesn't exist in the pack." />;
  if (setup === null) return <PageLoader label="Preparing your test" />;
  if (setup === "empty") return <MissingPack message="You got every question right last time — nothing to retake!" />;
  return <QuizRunner key={`${sectionIndex}-${missedOnly}`} pack={pack} sectionIndex={sectionIndex} missedOnly={missedOnly} setup={setup} />;
}

function QuizRunner({ pack, sectionIndex, missedOnly, setup }: { pack: Pack; sectionIndex: number; missedOnly: boolean; setup: QuizSetup }) {
  const router = useRouter();
  const { user } = useAuth();
  const { questions, limit, numberOffset } = setup;
  const questionIds = useMemo(() => questions.map((q) => q.id), [questions]);
  const sectionCount = pack.mcq!.sections.length;

  // Restore saved progress if it belongs to this exact question set.
  const [state, setState] = useState(() => {
    const saved = loadQuizProgress(pack.id, sectionIndex, missedOnly);
    if (saved && saved.questionIds.join() === questionIds.join()) return saved;
    return { answers: questions.map(() => null), flags: questions.map(() => false), index: 0, secondsLeft: limit, questionIds, updatedAt: Date.now() };
  });
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const q = questions[state.index];
  const answered = state.answers.filter((a) => a !== null).length;
  // Warn in the last fifth of the time (capped at 5 minutes for long sections).
  const low = state.secondsLeft < Math.min(300, limit * 0.2);

  const update = useCallback((patch: Partial<typeof state>) => setState((s) => ({ ...s, ...patch, updatedAt: Date.now() })), []);
  const pick = useCallback(
    (option: number) => setState((s) => ({ ...s, answers: s.answers.map((a, i) => (i === s.index ? option : a)), updatedAt: Date.now() })),
    [],
  );
  const go = useCallback((i: number) => setState((s) => ({ ...s, index: Math.max(0, Math.min(questions.length - 1, i)) })), [questions.length]);

  const submit = useCallback(async () => {
    if (!user || submitting) return;
    setSubmitting(true);
    const score = questions.reduce((n, question, i) => n + (state.answers[i] === question.answerIndex ? 1 : 0), 0);
    const durationSec = limit - state.secondsLeft;
    await saveAttempt(user.uid, {
      packId: pack.id,
      mode: "mcq",
      section: sectionIndex,
      answers: state.answers,
      questionIds,
      score,
      total: questions.length,
      durationSec,
    });
    clearQuizProgress(pack.id, sectionIndex, missedOnly);
    router.push(`/packs/${pack.id}/results/${sectionIndex}`);
  }, [user, submitting, questions, state.answers, state.secondsLeft, limit, pack.id, sectionIndex, questionIds, missedOnly, router]);

  // Countdown; submit automatically when time runs out.
  useEffect(() => {
    if (submitting) return;
    const timeUp = state.secondsLeft <= 1;
    const t = setTimeout(
      () => (timeUp ? submit() : setState((s) => ({ ...s, secondsLeft: s.secondsLeft - 1 }))),
      state.secondsLeft <= 0 ? 0 : 1000,
    );
    return () => clearTimeout(t);
  }, [state.secondsLeft, submitting, submit]);

  useEffect(() => {
    if (!submitting) saveQuizProgress(pack.id, sectionIndex, state, missedOnly);
  }, [state, pack.id, sectionIndex, missedOnly, submitting]);

  // Keyboard: A–D to answer, arrow keys to move.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.metaKey || e.ctrlKey) return;
      const k = KEYS.indexOf(e.key.toUpperCase());
      if (k !== -1 && k < q.options.length) pick(k);
      if (e.key === "ArrowRight") go(state.index + 1);
      if (e.key === "ArrowLeft") go(state.index - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [q, pick, go, state.index]);

  return (
    <>
      <StudyHeader
        exitIcon
        backHref={`/packs/${pack.id}`}
        title={`${pack.title} · Section ${sectionIndex + 1}${sectionCount > 1 ? ` of ${sectionCount}` : ""}`}
        subtitle={missedOnly ? `Retaking ${questions.length} missed questions` : `Questions ${numberOffset + 1}–${numberOffset + questions.length}`}
        progress={(state.index + 1) / questions.length}
        width="max-w-[1200px]"
        actions={
          <>
            <div
              role="timer"
              aria-label={`Time left ${formatClock(state.secondsLeft)}`}
              className={clsx("flex items-center gap-2 rounded-xl px-3.5 py-2.5 font-mono text-[17px] font-bold", low ? "bg-danger-soft text-danger-ink" : "bg-brand-soft text-brand-dark")}
            >
              <TimerIcon />
              {formatClock(state.secondsLeft)}
            </div>
            <Button size="sm" onClick={() => (answered < questions.length ? setConfirming(true) : submit())} loading={submitting}>
              Submit
            </Button>
          </>
        }
      />

      <div className="mx-auto flex max-w-[1200px] flex-wrap items-start gap-6 px-4 py-8 sm:px-10">
        <div className="min-w-0 flex-[999_1_520px]">
          <div key={q.id} className="st-slide rounded-[28px] border border-line bg-white p-[clamp(20px,4vw,40px)]">
            <div className="flex items-center justify-between gap-3 text-sm font-semibold text-muted">
              <span>
                Question {state.index + 1} of {questions.length}
              </span>
              <button
                type="button"
                aria-pressed={state.flags[state.index]}
                onClick={() => update({ flags: state.flags.map((f, i) => (i === state.index ? !f : f)) })}
                className={clsx(
                  "flex min-h-9 items-center gap-1.5 rounded-full border px-3 text-[13px]",
                  state.flags[state.index] ? "border-[#ffc98a] bg-[#ffe2bf] text-[#7a3e00]" : "border-line hover:border-ink",
                )}
              >
                <Flag size={14} /> {state.flags[state.index] ? "Flagged" : "Flag"}
              </button>
            </div>
            <h1 className="mb-7 mt-4 font-display text-[clamp(22px,2.6vw,30px)] font-bold leading-tight tracking-[-0.015em]">{q.question}</h1>
            <div role="radiogroup" aria-label="Answer options" className="flex flex-col gap-3">
              {q.options.map((option, k) => {
                const on = state.answers[state.index] === k;
                return (
                  <button
                    key={k}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => pick(k)}
                    className={clsx(
                      "flex min-h-[60px] w-full items-center gap-4 rounded-2xl border-2 px-[18px] py-4 text-left text-[17px] transition duration-200",
                      on ? "translate-x-1 border-brand bg-brand-soft font-semibold text-brand-deep" : "border-line bg-white hover:border-brand",
                    )}
                  >
                    <span className={clsx("flex size-[34px] shrink-0 items-center justify-center rounded-[10px] text-sm font-extrabold", on ? "bg-brand text-white" : "bg-[#f0f1f5] text-muted")}>
                      {KEYS[k]}
                    </span>
                    <span>{option}</span>
                  </button>
                );
              })}
            </div>
            <div className="mt-8 flex justify-between gap-3">
              <Button variant="outline" onClick={() => go(state.index - 1)} disabled={state.index === 0}>
                ← Previous
              </Button>
              {state.index < questions.length - 1 ? (
                <Button variant="brand" onClick={() => go(state.index + 1)}>
                  Next →
                </Button>
              ) : (
                <Button onClick={() => (answered < questions.length ? setConfirming(true) : submit())} loading={submitting}>
                  Finish section
                </Button>
              )}
            </div>
          </div>
          <p className="mx-1 mt-3.5 text-[13px] text-muted">Answers are revealed when you submit. Keyboard: A–D to choose, ← → to move. Progress saves automatically.</p>
        </div>

        <aside aria-label="Question navigator" className="min-w-0 flex-[1_1_280px] rounded-3xl border border-line bg-white p-5 lg:sticky lg:top-28">
          <div className="flex items-baseline justify-between">
            <h2 className="font-bold">Navigator</h2>
            <span className="text-[13px] text-muted">
              {answered}/{questions.length} answered
            </span>
          </div>
          <div className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(38px,1fr))] gap-1.5">
            {questions.map((question, i) => (
              <button
                key={question.id}
                type="button"
                aria-label={`Question ${i + 1}`}
                aria-current={i === state.index}
                onClick={() => go(i)}
                className={clsx(
                  "h-9 rounded-[9px] border-2 text-xs font-bold transition",
                  i === state.index ? "border-ink" : "border-transparent",
                  state.flags[i] ? "bg-[#ffe2bf] text-[#7a3e00]" : state.answers[i] !== null ? "bg-brand text-white" : "bg-[#f0f1f5] text-muted",
                )}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-3.5 text-xs text-muted">
            <span className="flex items-center gap-1.5">
              <span className="size-3 rounded bg-brand" />
              Answered
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-3 rounded border-2 border-ink" />
              Current
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-3 rounded bg-[#ffe2bf]" />
              Flagged
            </span>
          </div>
        </aside>
      </div>

      {confirming && (
        <div role="dialog" aria-modal="true" aria-labelledby="confirm-title" className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 p-4">
          <div className="st-pop w-full max-w-sm rounded-3xl bg-white p-7">
            <h2 id="confirm-title" className="font-display text-2xl font-extrabold">
              Submit section?
            </h2>
            <p className="mt-2 text-muted">
              You have {questions.length - answered} unanswered question{questions.length - answered === 1 ? "" : "s"}. They&apos;ll be marked wrong.
            </p>
            <div className="mt-6 flex flex-wrap justify-end gap-2.5">
              <Button variant="outline" onClick={() => setConfirming(false)}>
                Keep going
              </Button>
              <Button onClick={submit} loading={submitting}>
                Submit anyway
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
