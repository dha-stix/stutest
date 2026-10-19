"use client";

import clsx from "clsx";
import { Trash } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { deletePack, listAttempts } from "@/lib/firebase-actions";
import { mcqSectionStatuses, nextMcqSection, type SectionStatus } from "@/lib/progress";
import { formatClock, formatMinutes, percent, relativeDay } from "@/lib/study";
import type { Attempt, Pack } from "@/lib/types";
import { usePack } from "@/lib/use-pack";
import { MissingPack } from "../app/StudyShell";
import { Button, ButtonLink } from "../ui/Button";
import { Notice } from "../ui/Notice";
import { PageLoader } from "../ui/Spinner";
import { DownloadButton } from "./DownloadButton";

function SectionRow({ pack, index, status }: { pack: Pack; index: number; status: SectionStatus }) {
  const section = pack.mcq!.sections[index];
  const n = section.questions.length;
  const from = pack.mcq!.sections.slice(0, index).reduce((sum, s) => sum + s.questions.length, 0) + 1;
  const base = `/packs/${pack.id}`;

  const badge = clsx(
    "flex size-11 shrink-0 items-center justify-center rounded-xl font-extrabold",
    status.state === "done" ? "bg-success-soft text-success-ink" : status.state === "inProgress" ? "bg-brand text-white" : "bg-[#f0f1f5] text-muted",
  );

  return (
    <div
      className={clsx(
        "flex flex-wrap items-center gap-4 rounded-[18px] p-4",
        status.state === "inProgress" ? "border-2 border-brand bg-brand-tint" : "border border-line",
      )}
    >
      <span className={badge}>{index + 1}</span>
      <div className="min-w-0 flex-[1_1_200px]">
        <div className="font-bold">
          Section {index + 1} · Q{from}–{from + n - 1}
        </div>
        <div className="text-sm text-muted">
          {status.state === "done" && `Completed · ${formatClock(status.attempt.durationSec)}`}
          {status.state === "inProgress" &&
            `In progress · ${status.progress.answers.filter((a) => a !== null).length}/${n} answered · ${formatMinutes(status.progress.secondsLeft)} left`}
          {status.state === "new" && `Not started · timer ${formatMinutes(section.timeLimitSec)}`}
        </div>
      </div>
      {status.state === "done" && (
        <>
          <span className="font-mono font-bold text-success-ink">
            {status.attempt.score}/{status.attempt.total} · {percent(status.attempt.score, status.attempt.total)}%
          </span>
          <Link href={`${base}/results/${index}`} className="flex min-h-11 items-center font-bold text-brand">
            Review answers
          </Link>
        </>
      )}
      {status.state === "inProgress" && (
        <ButtonLink href={`${base}/mcq/${index}`} variant="brand" size="sm">
          Resume
        </ButtonLink>
      )}
      {status.state === "new" && (
        <Link href={`${base}/mcq/${index}`} className="flex min-h-11 items-center font-bold text-brand">
          Start
        </Link>
      )}
    </div>
  );
}

const MODE_CARDS = [
  {
    key: "flashcards" as const,
    label: "Flashcards",
    path: "flashcards",
    className: "bg-lime text-ink",
    eyebrow: "",
    title: (p: Pack) => `${p.flashcards?.decks.reduce((n, d) => n + d.cards.length, 0)} cards`,
    sub: (p: Pack) => `${p.flashcards?.decks.length} deck${(p.flashcards?.decks.length ?? 0) > 1 ? "s" : ""}`,
  },
  {
    key: "fillGap" as const,
    label: "Fill in the gap",
    path: "fill-gap",
    className: "border border-line bg-white",
    eyebrow: "text-brand",
    title: (p: Pack) => `${p.fillGap?.sections.reduce((n, s) => n + s.items.length, 0)} blanks`,
    sub: (p: Pack) => `${p.fillGap?.sections.length} section${(p.fillGap?.sections.length ?? 0) > 1 ? "s" : ""}`,
  },
  {
    key: "keypoints" as const,
    label: "Key points",
    path: "keypoints",
    className: "border border-line bg-white",
    eyebrow: "text-brand",
    title: (p: Pack) => `${p.keypoints?.topics.reduce((n, t) => n + t.points.length, 0)} points`,
    sub: (p: Pack) => `${p.keypoints?.topics.length} topics`,
  },
];

export function PackOverview() {
  const router = useRouter();
  const { user } = useAuth();
  const { pack, status } = usePack();
  const [attempts, setAttempts] = useState<Attempt[] | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteError, setDeleteError] = useState(false);

  useEffect(() => {
    if (pack && user) listAttempts(pack.id, user.uid).then(setAttempts, () => setAttempts([]));
  }, [pack, user]);

  if (status === "loading" || (pack && !attempts)) return <PageLoader label="Opening your pack" />;
  if (!pack) return <MissingPack />;

  const statuses = mcqSectionStatuses(pack, attempts ?? []);
  const next = nextMcqSection(statuses);
  const totalQ = pack.mcq?.sections.reduce((n, s) => n + s.questions.length, 0) ?? 0;
  const canChat = pack.modes.includes("chat");

  return (
    <>
      <Link href="/packs" className="text-sm font-semibold text-brand">
        ← All packs
      </Link>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-5">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted">
            {pack.source.type === "document" ? (
              <>
                <span className="rounded-md bg-danger-soft px-2 py-1 text-[11px] font-extrabold text-danger-ink">DOC</span>
                {pack.source.fileName} · pages 1–{pack.source.pagesUsed}
              </>
            ) : (
              <span className="rounded-md bg-brand-soft px-2 py-1 text-[11px] font-extrabold text-brand-dark">TOPIC</span>
            )}
            <span>· Created {relativeDay(pack.createdAt).toLowerCase()}</span>
          </div>
          <h1 className="mt-2.5 break-words font-display text-[clamp(32px,4vw,48px)] font-extrabold tracking-[-0.03em]">{pack.title}</h1>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <DownloadButton pack={pack} />
          {next !== null && (
            <ButtonLink href={`/packs/${pack.id}/mcq/${next}`}>
              {statuses[next].state === "inProgress" ? "Continue" : "Start"} Section {next + 1} →
            </ButtonLink>
          )}
        </div>
      </div>

      {pack.mcq && (
        <section aria-labelledby="mcq-heading" className="mt-8 rounded-3xl border border-line bg-white p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 id="mcq-heading" className="font-display text-2xl font-bold">
              Multiple-choice pack
            </h2>
            <span className="text-sm text-muted">
              {totalQ} questions · {pack.mcq.sections.length} section{pack.mcq.sections.length > 1 ? "s" : ""} of up to 50
            </span>
          </div>
          <div className="mt-4 flex flex-col gap-2.5">
            {statuses.map((s, i) => (
              <SectionRow key={i} pack={pack} index={i} status={s} />
            ))}
          </div>
        </section>
      )}

      <div className="mt-4 grid grid-cols-[repeat(auto-fit,minmax(min(100%,240px),1fr))] gap-4">
        {MODE_CARDS.filter((c) => pack[c.key]).map((c) => (
          <Link key={c.key} href={`/packs/${pack.id}/${c.path}`} className={clsx("st-lift flex min-h-[180px] flex-col justify-between rounded-3xl p-6", c.className)}>
            <span className={clsx("text-[13px] font-bold uppercase tracking-[0.08em]", c.eyebrow)}>{c.label}</span>
            <div>
              <div className="font-display text-[26px] font-bold">{c.title(pack)}</div>
              <div className="text-sm opacity-75">{c.sub(pack)}</div>
            </div>
          </Link>
        ))}
        {canChat && (
          <Link href={`/packs/${pack.id}/chat`} className="st-lift flex min-h-[180px] flex-col justify-between rounded-3xl bg-ink p-6 text-paper">
            <span className="text-[13px] font-bold uppercase tracking-[0.08em] text-lime">Chat</span>
            <div>
              <div className="font-display text-[26px] font-bold">{pack.source.type === "document" ? "Ask the document" : "Ask a tutor"}</div>
              <div className="text-sm text-soft">{pack.source.type === "document" ? "Answers cite page numbers" : "Questions about this topic"}</div>
            </div>
          </Link>
        )}
      </div>

      {deleteError && (
        <Notice tone="error" className="mt-10">
          We couldn&apos;t delete this pack. Check your connection and try again.
        </Notice>
      )}
      <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-line pt-6">
        {confirmDelete ? (
          <>
            <span className="text-sm font-semibold">Delete this pack and its scores? This can&apos;t be undone.</span>
            <Button
              size="sm"
              className="bg-danger hover:bg-danger-ink"
              onClick={async () => {
                try {
                  await deletePack(pack.id, user!.uid);
                  router.replace("/packs");
                } catch {
                  setDeleteError(true);
                }
              }}
            >
              Delete pack
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
          </>
        ) : (
          <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(true)}>
            <Trash size={16} /> Delete pack
          </Button>
        )}
      </div>
    </>
  );
}
