"use client";

import clsx from "clsx";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { saveAttempt } from "@/lib/firebase-actions";
import { isGapCorrect } from "@/lib/study";
import type { Pack } from "@/lib/types";
import { MissingPack, StudyHeader } from "../app/StudyShell";
import { DownloadButton } from "../packs/DownloadButton";
import { PencilWrite } from "../svg/AnimatedIcons";
import { Button } from "../ui/Button";
import { SectionTabs } from "./SectionTabs";

export function FillGap({ pack }: { pack: Pack }) {
  const { user } = useAuth();
  const sections = pack.fillGap?.sections ?? [];
  const [sectionIndex, setSectionIndex] = useState(0);
  const [values, setValues] = useState<string[]>(() => (sections[0]?.items ?? []).map(() => ""));
  const [checked, setChecked] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!sections.length) return <MissingPack message="This pack has no fill-in-the-gap questions." />;

  const items = sections[sectionIndex].items;
  const results = items.map((item, i) => isGapCorrect(item, values[i] ?? ""));
  const score = results.filter(Boolean).length;
  const filled = values.filter((v) => v.trim()).length;

  const switchSection = (i: number) => {
    setSectionIndex(i);
    setValues(sections[i].items.map(() => ""));
    setChecked(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  async function check() {
    setChecked(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (!user) return;
    setSaving(true);
    await saveAttempt(user.uid, {
      packId: pack.id,
      mode: "fillGap",
      section: sectionIndex,
      answers: values,
      questionIds: items.map((i) => i.id),
      score,
      total: items.length,
      durationSec: 0,
    }).catch(() => undefined);
    setSaving(false);
  }

  return (
    <>
      <StudyHeader
        backHref={`/packs/${pack.id}`}
        title={`${pack.title} · Fill in the gap`}
        subtitle={`Section ${sectionIndex + 1} of ${sections.length} · ${items.length} blanks`}
        width="max-w-[900px]"
        progress={filled / items.length}
        actions={<span className="text-sm font-semibold text-muted">{filled} of {items.length} filled</span>}
      />

      <main className="mx-auto max-w-[900px] px-4 pb-14 pt-8 sm:px-10">
        <SectionTabs count={sections.length} value={sectionIndex} onChange={switchSection} noun="Section" />

        {checked && (
          <div role="status" className="st-pop mb-5 flex flex-wrap items-center justify-between gap-5 rounded-3xl bg-ink px-7 py-6 text-paper">
            <div>
              <div className="text-[13px] font-bold uppercase tracking-[0.08em] text-lime">Your score</div>
              <div className="font-display text-[40px] font-extrabold">
                {score} / {items.length}
              </div>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <Button variant="lime" onClick={() => (setValues(items.map(() => "")), setChecked(false))}>
                Try again
              </Button>
              {sectionIndex + 1 < sections.length && (
                <Button variant="outlineDark" onClick={() => switchSection(sectionIndex + 1)}>
                  Next section →
                </Button>
              )}
            </div>
          </div>
        )}

        <div className="mb-5 flex items-center gap-4">
          <PencilWrite />
          <p className="text-muted">Type the missing word on each dashed line. Capitals, accents and punctuation don&apos;t matter.</p>
        </div>

        <ol className="flex flex-col gap-3">
          {items.map((item, i) => {
            const state = !checked ? "idle" : results[i] ? "right" : "wrong";
            return (
              <li
                key={item.id}
                className={clsx(
                  "flex items-start gap-4 rounded-[20px] border bg-white p-5 transition",
                  state === "right" ? "border-[#a7dec4]" : state === "wrong" ? "border-[#f5c2bc]" : "border-line",
                )}
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-[10px] bg-brand-soft text-sm font-extrabold text-brand-dark">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-[clamp(17px,2vw,20px)] leading-[2]">
                    {item.before}{" "}
                    <input
                      type="text"
                      aria-label={`Blank ${i + 1}`}
                      autoComplete="off"
                      spellCheck={false}
                      value={values[i] ?? ""}
                      readOnly={checked}
                      onChange={(e) => setValues(values.map((v, k) => (k === i ? e.target.value : v)))}
                      placeholder="______________"
                      className={clsx(
                        "w-[clamp(120px,30vw,190px)] max-w-full rounded-t border-0 border-b-2 border-dashed bg-transparent px-1.5 text-center font-bold outline-none focus:border-solid focus:bg-brand-tint",
                        state === "right" && "border-success text-success",
                        state === "wrong" && "border-danger text-danger line-through",
                        state === "idle" && "border-brand text-brand",
                      )}
                    />{" "}
                    {item.after}
                  </p>
                  {state === "wrong" && <p className="mt-1.5 text-sm font-semibold text-success-ink">Answer: {item.answer}</p>}
                </div>
              </li>
            );
          })}
        </ol>

        <div className="mt-7 flex flex-wrap justify-between gap-3">
          <DownloadButton pack={pack} mode="fillGap" label="Download blanks + answers" />
          {!checked && (
            <Button variant="brand" size="lg" onClick={check} loading={saving}>
              Check answers
            </Button>
          )}
        </div>
      </main>
    </>
  );
}
