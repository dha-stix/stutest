import { MCQ_SECTION_SIZE } from "./constants";
import type { StudyMode } from "./types";

/*
 * Rough token estimates so students can see what a pack will cost on their own key.
 * Every AI request resends the whole document, so input grows with pages × requests.
 */

/** English text averages about 1.35 tokens per word. */
const TOKENS_PER_WORD = 1.35;
/** Instructions and output schema sent with every generation request. */
const PROMPT_OVERHEAD = 1_200;
/** Approximate output per generated item. */
const OUTPUT_PER_ITEM = { mcq: 90, flashcards: 60, fillGap: 45 };
const KEYPOINTS_OUTPUT = 2_500;

export const wordsToTokens = (words: number) => Math.round(words * TOKENS_PER_WORD);
export const countWords = (text: string) => text.split(/\s+/).filter(Boolean).length;

export interface PackEstimate {
  requests: number;
  inputTokens: number;
  outputTokens: number;
  total: number;
}

export function estimatePack(sourceWords: number, modes: StudyMode[], counts: { mcq: number; flashcards: number; fillGap: number }): PackEstimate {
  const has = (m: StudyMode) => modes.includes(m);
  const calls = (n: number) => Math.ceil(n / MCQ_SECTION_SIZE);
  const requests =
    (has("mcq") ? calls(counts.mcq) : 0) +
    (has("flashcards") ? calls(counts.flashcards) : 0) +
    (has("fillGap") ? calls(counts.fillGap) : 0) +
    (has("keypoints") ? 1 : 0);
  const inputTokens = requests * (wordsToTokens(sourceWords) + PROMPT_OVERHEAD);
  const outputTokens =
    (has("mcq") ? counts.mcq * OUTPUT_PER_ITEM.mcq : 0) +
    (has("flashcards") ? counts.flashcards * OUTPUT_PER_ITEM.flashcards : 0) +
    (has("fillGap") ? counts.fillGap * OUTPUT_PER_ITEM.fillGap : 0) +
    (has("keypoints") ? KEYPOINTS_OUTPUT : 0);
  return { requests, inputTokens, outputTokens, total: inputTokens + outputTokens };
}

/** 1234 → "1.2k", 56789 → "57k". */
export function formatTokens(n: number): string {
  if (n < 1000) return String(n);
  return n < 10_000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k` : `${Math.round(n / 1000)}k`;
}
