"use client";

import Link from "next/link";
import { useState } from "react";
import { modeInfo } from "@/lib/constants";
import { relativeDay } from "@/lib/study";
import type { Pack, StudyMode } from "@/lib/types";
import { ButtonLink } from "../ui/Button";
import { Pills } from "../ui/Pills";

const CHIP: Record<StudyMode, string> = {
  mcq: "bg-brand-soft text-brand-dark",
  flashcards: "bg-lime-soft text-lime-ink",
  fillGap: "bg-warn-soft text-warn-ink",
  keypoints: "bg-success-soft text-success-ink",
  chat: "bg-[#f0f1f5] text-muted",
};

export function ModeChip({ mode }: { mode: StudyMode }) {
  return <span className={`rounded-full px-2.5 py-1 font-ui text-xs font-bold ${CHIP[mode]}`}>{modeInfo(mode).short}</span>;
}

function packMeta(pack: Pack): string {
  const parts: string[] = [];
  const mcq = pack.mcq?.sections.reduce((n, s) => n + s.questions.length, 0);
  if (mcq) parts.push(`${mcq} questions · ${pack.mcq!.sections.length} section${pack.mcq!.sections.length > 1 ? "s" : ""}`);
  const cards = pack.flashcards?.decks.reduce((n, d) => n + d.cards.length, 0);
  if (cards) parts.push(`${cards} cards`);
  const gaps = pack.fillGap?.sections.reduce((n, s) => n + s.items.length, 0);
  if (gaps) parts.push(`${gaps} blanks`);
  if (pack.keypoints) parts.push(`${pack.keypoints.topics.reduce((n, t) => n + t.points.length, 0)} key points`);
  return parts.slice(0, 2).join(" · ") || "Chat only";
}

const FILTERS = ["All", "mcq", "flashcards", "fillGap", "keypoints"] as const;
type Filter = (typeof FILTERS)[number];

export function PackGrid({ packs, title = "Your packs" }: { packs: Pack[]; title?: string }) {
  const [filter, setFilter] = useState<Filter>("All");
  const shown = packs.filter((p) => filter === "All" || p.modes.includes(filter));

  return (
    <section aria-labelledby="packs-heading">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="packs-heading" className="font-display text-[21px] sm:text-[23px] font-bold">
          {title}
        </h2>
        {packs.length > 0 && (
          <Pills label="Filter packs" options={FILTERS} value={filter} onChange={setFilter} format={(f) => (f === "All" ? "All" : modeInfo(f).short)} />
        )}
      </div>

      {packs.length === 0 ? (
        <div className="mt-5 flex flex-col items-center gap-4 rounded-3xl border-2 border-dashed border-line-strong bg-white px-6 py-14 text-center">
          <p className="font-display text-2xl font-bold">No packs yet</p>
          <p className="max-w-sm text-muted">Type a topic or upload your notes and Stutest will build your first study pack.</p>
          <ButtonLink href="/create">Create my first test</ButtonLink>
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-[repeat(auto-fill,minmax(min(100%,260px),1fr))] gap-4">
          {shown.map((pack, i) => (
            <Link
              key={pack.id}
              href={`/packs/${pack.id}`}
              className="st-lift st-in flex flex-col gap-3 rounded-[20px] border border-line bg-white p-5"
              style={{ animationDelay: `${Math.min(i, 8) * 0.04}s` }}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex flex-wrap gap-1.5">
                  {pack.modes.filter((m) => m !== "chat").slice(0, 2).map((m) => (
                    <ModeChip key={m} mode={m} />
                  ))}
                </div>
                <span className="shrink-0 text-[13px] text-muted">{relativeDay(pack.createdAt)}</span>
              </div>
              <div className="line-clamp-2 font-display text-[21px] font-bold leading-tight">{pack.title}</div>
              <div className="text-sm text-muted">{packMeta(pack)}</div>
              <div className="mt-auto flex items-center justify-between border-t border-[#eef0f4] pt-3 text-sm">
                <span className="truncate font-semibold">{pack.source.type === "document" ? pack.source.fileName : "Topic"}</span>
                <span className="font-bold text-brand">Open →</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
