"use client";

import clsx from "clsx";
import { useState } from "react";
import type { Pack } from "@/lib/types";
import { MissingPack, StudyHeader } from "../app/StudyShell";
import { DownloadButton } from "../packs/DownloadButton";
import { BulbIcon } from "../svg/AnimatedIcons";

export function Keypoints({ pack }: { pack: Pack }) {
  const topics = pack.keypoints?.topics ?? [];
  const [active, setActive] = useState(0);
  if (!topics.length) return <MissingPack message="This pack has no key points." />;

  const topic = topics[active];
  const total = topics.reduce((n, t) => n + t.points.length, 0);

  return (
    <>
      <StudyHeader
        backHref={`/packs/${pack.id}`}
        title={`${pack.title} · Key points`}
        subtitle={`${total} points · ${topics.length} topics`}
        actions={<DownloadButton pack={pack} mode="keypoints" label="Download" size="sm" />}
      />
      <div className="mx-auto flex max-w-[1100px] flex-wrap items-start gap-7 px-4 pb-14 pt-8 sm:px-10">
        <nav aria-label="Topics" className="flex min-w-0 flex-[1_1_220px] flex-wrap gap-2 md:sticky md:top-28">
          {topics.map((t, i) => (
            <button
              key={t.title}
              type="button"
              aria-pressed={i === active}
              onClick={() => setActive(i)}
              className={clsx(
                "flex min-h-12 flex-[1_1_200px] items-center justify-between gap-3 rounded-[14px] border px-4 py-3 text-left font-semibold transition",
                i === active ? "border-ink bg-ink text-paper" : "border-line bg-white hover:border-ink",
              )}
            >
              <span>{t.title}</span>
              <span className="text-[13px] opacity-70">{t.points.length}</span>
            </button>
          ))}
        </nav>

        <main className="min-w-0 flex-[999_1_520px]">
          <p className="text-[13px] font-bold font-ui uppercase tracking-[0.1em] text-brand">
            Topic {active + 1} of {topics.length}
          </p>
          <div className="mb-6 mt-1.5 flex items-center gap-3.5">
            <BulbIcon />
            <h1 className="font-display text-[clamp(24px,2.8vw,34px)] font-bold tracking-[-0.03em]">{topic.title}</h1>
          </div>
          <div key={active} className="flex flex-col gap-3.5">
            {topic.points.map((p, i) => (
              <article key={p.title} className="st-in flex gap-[18px] rounded-[22px] border border-line bg-white px-6 py-[22px]" style={{ animationDelay: `${i * 0.06}s` }}>
                <span className="shrink-0 font-mono text-xl font-bold text-brand">{String(i + 1).padStart(2, "0")}</span>
                <div className="min-w-0 flex-1">
                  <h2 className="mb-1.5 text-[19px] font-bold leading-snug">{p.title}</h2>
                  <p className="leading-relaxed text-[#3a3f50]">{p.body}</p>
                  {p.tip && (
                    <div className="mt-3 rounded-xl bg-lime-soft px-3.5 py-2.5 text-sm leading-normal text-[#2f380b]">
                      <strong>Remember:</strong> {p.tip}
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        </main>
      </div>
    </>
  );
}
