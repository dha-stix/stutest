"use client";

import type { Attempt, Pack } from "./types";

/** In-progress quiz state kept in the browser so a section can be resumed. */
export interface QuizProgress {
  answers: (number | null)[];
  flags: boolean[];
  index: number;
  secondsLeft: number;
  questionIds: string[];
  updatedAt: number;
}

const progressKey = (packId: string, section: number, missedOnly: boolean) =>
  `stutest:quiz:${packId}:${section}${missedOnly ? ":missed" : ""}`;

export function loadQuizProgress(packId: string, section: number, missedOnly = false): QuizProgress | null {
  try {
    const raw = localStorage.getItem(progressKey(packId, section, missedOnly));
    return raw ? (JSON.parse(raw) as QuizProgress) : null;
  } catch {
    return null;
  }
}

export function saveQuizProgress(packId: string, section: number, progress: QuizProgress, missedOnly = false) {
  try {
    localStorage.setItem(progressKey(packId, section, missedOnly), JSON.stringify(progress));
  } catch {
    // Resume is a convenience; ignore storage failures.
  }
}

export function clearQuizProgress(packId: string, section: number, missedOnly = false) {
  try {
    localStorage.removeItem(progressKey(packId, section, missedOnly));
  } catch {
    // ignore
  }
}

export type SectionStatus =
  | { state: "done"; attempt: Attempt }
  | { state: "inProgress"; progress: QuizProgress }
  | { state: "new" };

/** Where each MCQ section stands for this user. */
export function mcqSectionStatuses(pack: Pack, attempts: Attempt[]): SectionStatus[] {
  return (pack.mcq?.sections ?? []).map((section) => {
    const progress = loadQuizProgress(pack.id, section.index);
    if (progress && progress.answers.some((a) => a !== null)) return { state: "inProgress", progress };
    const attempt = attempts.find((a) => a.packId === pack.id && a.mode === "mcq" && a.section === section.index);
    return attempt ? { state: "done", attempt } : { state: "new" };
  });
}

/** The section a student should open next: in progress first, then the first unattempted one. */
export function nextMcqSection(statuses: SectionStatus[]): number | null {
  const inProgress = statuses.findIndex((s) => s.state === "inProgress");
  if (inProgress !== -1) return inProgress;
  const fresh = statuses.findIndex((s) => s.state === "new");
  return fresh === -1 ? null : fresh;
}
