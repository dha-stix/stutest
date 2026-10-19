"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { providerInfo } from "@/lib/constants";
import { computeStats } from "@/lib/firebase-actions";
import { mcqSectionStatuses, nextMcqSection } from "@/lib/progress";
import { formatMinutes } from "@/lib/study";
import type { Attempt, Pack } from "@/lib/types";
import { usePacks } from "@/lib/use-packs";
import { PackGrid } from "../packs/PackGrid";
import { FlameIcon, ProgressRing } from "../svg/AnimatedIcons";
import { ButtonLink } from "../ui/Button";
import { Notice } from "../ui/Notice";
import { PageLoader } from "../ui/Spinner";

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

function StatCard({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="st-in rounded-[20px] border border-line bg-white p-5">
      <div className="text-sm text-muted">{label}</div>
      <div className={`mt-1.5 font-display text-4xl font-extrabold ${accent ?? ""}`}>{value}</div>
    </div>
  );
}

/** Finds the most recent pack with an MCQ section still to do. */
function findContinue(packs: Pack[], attempts: Attempt[]) {
  for (const pack of packs) {
    const statuses = mcqSectionStatuses(pack, attempts);
    const next = nextMcqSection(statuses);
    if (next === null) continue;
    const section = pack.mcq!.sections[next];
    const status = statuses[next];
    const answered = status.state === "inProgress" ? status.progress.answers.filter((a) => a !== null).length : 0;
    const left = status.state === "inProgress" ? status.progress.secondsLeft : section.timeLimitSec;
    return { pack, next, total: section.questions.length, answered, left, sections: statuses.length };
  }
  return null;
}

function ContinueCard({ packs, attempts }: { packs: Pack[]; attempts: Attempt[] }) {
  const item = findContinue(packs, attempts);
  if (!item) {
    return (
      <Link href="/create" className="st-lift flex flex-[2_1_420px] flex-col justify-center gap-2 rounded-3xl bg-ink p-7 text-paper">
        <span className="text-[13px] font-bold uppercase tracking-[0.08em] text-lime">Start something new</span>
        <span className="font-display text-[28px] font-bold leading-tight">Turn a topic or your notes into a test</span>
        <span className="text-soft">Takes under a minute to generate.</span>
      </Link>
    );
  }
  const { pack, next, total, answered, left, sections } = item;
  return (
    <Link
      href={`/packs/${pack.id}/mcq/${next}`}
      className="st-lift flex min-w-0 flex-[2_1_420px] flex-wrap items-center justify-between gap-6 rounded-3xl bg-ink p-7 text-paper"
    >
      <div className="min-w-0">
        <div className="text-[13px] font-bold uppercase tracking-[0.08em] text-lime">{answered ? "Continue" : "Up next"}</div>
        <div className="mt-2 font-display text-[28px] font-bold leading-tight">
          {pack.title} · Section {next + 1}
          {sections > 1 && <span className="text-soft"> of {sections}</span>}
        </div>
        <div className="mt-1.5 text-soft">
          {answered ? `Question ${answered + 1} of ${total}` : `${total} questions`} · {formatMinutes(left)} {answered ? "left" : "timer"}
        </div>
      </div>
      <div className="flex items-center gap-5">
        <ProgressRing value={answered / total} label={`${Math.round((answered / total) * 100)} percent complete`} />
        <span className="rounded-[14px] bg-paper px-5 py-3.5 font-bold text-ink">{answered ? "Resume" : "Start"} →</span>
      </div>
    </Link>
  );
}

export function Dashboard() {
  const { user, settings } = useAuth();
  const { packs, attempts, loading, error } = usePacks();
  if (loading) return <PageLoader label="Loading your dashboard" />;

  const stats = computeStats(packs, attempts);
  const today = new Date().toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" });

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-muted">{today}</p>
          <h1 className="mt-1.5 font-display text-[clamp(30px,3.4vw,42px)] font-extrabold tracking-[-0.03em]">
            {greeting()}, {user?.name.split(" ")[0]}
          </h1>
        </div>
        <ButtonLink href="/create">
          <Plus size={18} strokeWidth={2.6} /> New test
        </ButtonLink>
      </div>

      {error && <Notice tone="error" className="mt-6">We couldn&apos;t load your packs. Refresh to try again.</Notice>}
      {!settings && (
        <Notice tone="warn" className="mt-6">
          Connect an AI provider before creating tests.{" "}
          <Link href="/settings/api-key" className="font-bold underline">
            Add your API key
          </Link>
        </Notice>
      )}

      <div className="mt-8 grid grid-cols-[repeat(auto-fit,minmax(min(100%,200px),1fr))] gap-4">
        <StatCard label="Packs created" value={String(stats.packs)} />
        <StatCard label="Questions answered" value={String(stats.questionsAnswered)} />
        <StatCard label="Average score" value={stats.averageScore === null ? "—" : `${stats.averageScore}%`} accent="text-success" />
        <div className="st-in relative overflow-hidden rounded-[20px] bg-lime p-5">
          <FlameIcon className="absolute right-4 top-4" />
          <div className="text-sm font-semibold">Study streak</div>
          <div className="mt-1.5 font-display text-4xl font-extrabold">
            {stats.streakDays} day{stats.streakDays === 1 ? "" : "s"}
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-5">
        <ContinueCard packs={packs} attempts={attempts} />
        <div className="flex min-w-0 flex-[1_1_260px] flex-col gap-3 rounded-3xl border border-line bg-white p-6">
          <div className="flex items-center justify-between">
            <span className="font-bold">AI provider</span>
            <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${settings ? "bg-success-soft text-success-ink" : "bg-warn-soft text-warn-ink"}`}>
              {settings ? "Connected" : "Not set"}
            </span>
          </div>
          <div className="font-display text-2xl font-bold">{settings ? providerInfo(settings.provider).name : "No provider"}</div>
          {settings && <div className="font-mono text-[13px] text-muted">••••••••{settings.keyLast4}</div>}
          <Link href="/settings/api-key" className="mt-auto font-semibold text-brand hover:text-brand-dark">
            {settings ? "Change key" : "Add a key"}
          </Link>
        </div>
      </div>

      <div className="mt-10">
        <PackGrid packs={packs.slice(0, 9)} />
        {packs.length > 9 && (
          <Link href="/packs" className="mt-5 inline-block font-bold text-brand">
            See all {packs.length} packs →
          </Link>
        )}
      </div>
    </>
  );
}
