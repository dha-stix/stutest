"use client";

import { itemKey } from "./ai/normalize";
import { generateItems, type SourcePayload } from "./api-client";
import { FILL_GAP_SECTION_SIZE, FLASHCARD_DECK_SIZE, MCQ_SECTION_SIZE } from "./constants";
import { chunk, sectionSeconds } from "./study";
import type { FillGapItem, Flashcard, KeypointTopic, MCQuestion, NewPack, PackSource, StudyMode, UserSettings } from "./types";

export interface GenerateRequest {
  title: string;
  source: PackSource;
  payload: SourcePayload;
  modes: StudyMode[];
  counts: { mcq: number; flashcards: number; fillGap: number };
}

export type ProgressFn = (done: number, total: number, label: string) => void;

/** Splits a count into API calls of at most `size` items. */
const batches = (count: number, size: number) => chunk(Array.from({ length: count }), size).map((b) => b.length);

/**
 * Builds a whole pack. MCQ sections run in sequence (each one is told which
 * questions already exist so sections don't repeat); other modes run alongside.
 */
export async function generatePack(settings: UserSettings, req: GenerateRequest, onProgress: ProgressFn): Promise<NewPack> {
  const key = { provider: settings.provider, apiKey: settings.apiKey };
  const has = (m: StudyMode) => req.modes.includes(m);

  const mcqBatches = has("mcq") ? batches(req.counts.mcq, MCQ_SECTION_SIZE) : [];
  const flashBatches = has("flashcards") ? batches(req.counts.flashcards, MCQ_SECTION_SIZE) : [];
  const gapBatches = has("fillGap") ? batches(req.counts.fillGap, MCQ_SECTION_SIZE) : [];
  const total = mcqBatches.length + flashBatches.length + gapBatches.length + (has("keypoints") ? 1 : 0);

  let done = 0;
  const step = (label: string) => onProgress(++done, total, label);
  onProgress(0, total, "Reading your material");

  const sequential = async <T,>(sizes: number[], mode: "mcq" | "flashcards" | "fillGap", label: (i: number) => string) => {
    const all: T[] = [];
    for (const [i, size] of sizes.entries()) {
      const items = await generateItems<T>(key, mode, req.payload, size, all.map((item) => itemKey(mode, item)));
      all.push(...items.slice(0, size));
      step(label(i));
    }
    return all;
  };

  const [questions, cards, gaps, topics] = await Promise.all([
    sequential<MCQuestion>(mcqBatches, "mcq", (i) => `Wrote MCQ section ${i + 1}`),
    sequential<Flashcard>(flashBatches, "flashcards", () => "Made flashcards"),
    sequential<FillGapItem>(gapBatches, "fillGap", () => "Made fill-in-the-gap"),
    has("keypoints")
      ? generateItems<KeypointTopic>(key, "keypoints", req.payload, 1).then((t) => (step("Pulled out key points"), t))
      : Promise.resolve([]),
  ]);

  const pack: NewPack = {
    title: req.title,
    source: req.source,
    modes: req.modes,
    ...(req.payload.text ? { documentText: req.payload.text } : {}),
  };
  if (questions.length) {
    pack.mcq = {
      sections: chunk(questions, MCQ_SECTION_SIZE).map((qs, index) => ({ index, questions: qs, timeLimitSec: sectionSeconds(qs) })),
    };
  }
  if (cards.length) pack.flashcards = { decks: chunk(cards, FLASHCARD_DECK_SIZE).map((c, index) => ({ index, cards: c })) };
  if (gaps.length) pack.fillGap = { sections: chunk(gaps, FILL_GAP_SECTION_SIZE).map((items, index) => ({ index, items })) };
  if (topics.length) pack.keypoints = { topics };
  return pack;
}
