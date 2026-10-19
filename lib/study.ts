import type { FillGapItem, MCQuestion } from "./types";

export const chunk = <T,>(items: T[], size: number): T[][] =>
  Array.from({ length: Math.ceil(items.length / size) }, (_, i) => items.slice(i * size, i * size + size));

const words = (text: string) => text.split(/\s+/).filter(Boolean).length;

/**
 * Time allowed for one question: reading at ~200 words per minute,
 * plus thinking time that grows with how much there is to weigh up.
 */
export function questionSeconds(q: MCQuestion): number {
  const readWords = words(q.question) + q.options.reduce((sum, o) => sum + words(o), 0);
  const readSeconds = (readWords / 200) * 60;
  return Math.round(15 + readSeconds * 1.5);
}

/** Section limit, rounded up to the next half minute. */
export const sectionSeconds = (questions: MCQuestion[]) =>
  Math.ceil(questions.reduce((sum, q) => sum + questionSeconds(q), 0) / 30) * 30;

export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const mm = String(m).padStart(2, "0");
  const ss = String(sec).padStart(2, "0");
  return h ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

export const formatMinutes = (seconds: number) => `${Math.max(1, Math.round(seconds / 60))} min`;

const normalizeAnswer = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim();

/** Case, accent and punctuation-insensitive match against the answer and its alternatives. */
export function isGapCorrect(item: FillGapItem, typed: string): boolean {
  const guess = normalizeAnswer(typed);
  if (!guess) return false;
  return [item.answer, ...item.alternatives].some((a) => normalizeAnswer(a) === guess);
}

export const percent = (score: number, total: number) => (total ? Math.round((score / total) * 100) : 0);

export const relativeDay = (timestamp: number) => {
  const date = new Date(timestamp);
  const today = new Date();
  const diff = Math.floor((today.setHours(0, 0, 0, 0) - new Date(timestamp).setHours(0, 0, 0, 0)) / 86_400_000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};
