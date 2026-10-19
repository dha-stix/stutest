import { shuffle } from "../study";
import type { FillGapItem, Flashcard, GeneratedMode, KeypointTopic, MCQuestion } from "../types";

/*
 * Model output is checked here before it reaches a student. Anything that would make an
 * item wrong or confusing (bad answer index, duplicate options, an answer leaked into the
 * sentence, repeats) is dropped rather than shown; the route tops up if too much is lost.
 */

/** Pulls the first JSON object out of a model reply (tolerates code fences or stray text). */
export function extractJson(text: string): unknown {
  const stripped = text.replace(/```(?:json)?/gi, "").trim();
  const start = stripped.indexOf("{");
  const end = stripped.lastIndexOf("}");
  if (start === -1 || end <= start) throw new Error("No JSON object in reply");
  return JSON.parse(stripped.slice(start, end + 1));
}

type Raw = Record<string, unknown>;
const str = (v: unknown) => (typeof v === "string" ? v.replace(/\s+/g, " ").trim() : "");
const arr = (v: unknown): Raw[] => (Array.isArray(v) ? v.filter((x): x is Raw => !!x && typeof x === "object") : []);
const strList = (v: unknown) => (Array.isArray(v) ? v.map(str).filter(Boolean) : []);
const uid = () => Math.random().toString(36).slice(2, 10);

/** Comparison key: lowercase letters and digits only. */
export const fingerprint = (text: string) => text.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();

const OPTION_PREFIX = /^\(?[A-Ha-h1-8][).:]\s+/;
const BANNED_OPTION = /\b(all|none|both) of the (above|options)\b|\bboth [a-d] and [a-d]\b/i;

function mcq(data: Raw): MCQuestion[] {
  const out: MCQuestion[] = [];
  for (const q of arr(data.questions)) {
    const question = str(q.question);
    let options = strList(q.options);
    const answerIndex = Number(q.answerIndex);
    if (!question || options.length !== 4 || !Number.isInteger(answerIndex) || answerIndex < 0 || answerIndex > 3) continue;
    // Strip "A) " style prefixes only when every option has one.
    if (options.every((o) => OPTION_PREFIX.test(o))) options = options.map((o) => o.replace(OPTION_PREFIX, ""));
    if (new Set(options.map(fingerprint)).size !== 4 || options.some((o) => BANNED_OPTION.test(o))) continue;

    // Shuffle so the correct answer's position is uniformly random, whatever the model did.
    const correct = options[answerIndex];
    const shuffled = shuffle(options);
    out.push({ id: uid(), question, options: shuffled, answerIndex: shuffled.indexOf(correct), explanation: str(q.explanation) });
  }
  return out;
}

function flashcards(data: Raw): Flashcard[] {
  return arr(data.cards)
    .map((c) => ({ id: uid(), front: str(c.front), back: str(c.back) }))
    .filter((c) => c.front && c.back && fingerprint(c.front) !== fingerprint(c.back));
}

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const containsTerm = (text: string, term: string) => new RegExp(`(^|[^\\p{L}\\p{N}])${escapeRegex(term)}($|[^\\p{L}\\p{N}])`, "iu").test(text);
const stripBlanks = (text: string) => text.replace(/_{2,}|\[blank\]|\(blank\)/gi, "").replace(/\s+/g, " ").trim();

function fillGap(data: Raw): FillGapItem[] {
  const out: FillGapItem[] = [];
  for (const i of arr(data.items)) {
    const before = stripBlanks(str(i.before));
    const after = stripBlanks(str(i.after));
    const answer = str(i.answer).replace(/[.,;:!?]+$/, "");
    if (!answer || (!before && !after) || answer.split(" ").length > 4) continue;
    // A sentence that already shows its answer is useless as a test.
    if (containsTerm(`${before} ${after}`, answer)) continue;
    const alternatives = strList(i.alternatives).filter((a) => fingerprint(a) !== fingerprint(answer));
    out.push({ id: uid(), before, answer, alternatives, after });
  }
  return out;
}

function keypoints(data: Raw): KeypointTopic[] {
  return arr(data.topics)
    .map((t) => ({
      title: str(t.title),
      points: arr(t.points)
        .map((p) => ({ title: str(p.title), body: str(p.body), tip: str(p.tip) }))
        .filter((p) => p.title && p.body)
        .slice(0, 8),
    }))
    .filter((t) => t.title && t.points.length)
    .slice(0, 8);
}

/** The text that identifies an item, used to spot duplicates across calls and sections. */
export function itemKey(mode: GeneratedMode, item: unknown): string {
  const i = item as Record<string, string>;
  if (mode === "mcq") return i.question;
  if (mode === "flashcards") return i.front;
  if (mode === "fillGap") return `${i.before} ___ ${i.after}`;
  return i.title;
}

const normalizers = { mcq, flashcards, fillGap, keypoints } satisfies Record<GeneratedMode, (d: Raw) => unknown[]>;

/** Validates model output and drops invalid items and repeats (within the reply and against `existing`). */
export function normalize(mode: GeneratedMode, data: unknown, existing: string[] = []): unknown[] {
  if (!data || typeof data !== "object") return [];
  const seen = new Set(existing.map(fingerprint));
  return normalizers[mode](data as Raw).filter((item) => {
    const key = fingerprint(itemKey(mode, item));
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
