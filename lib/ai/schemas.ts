import type { GeneratedMode } from "../types";

/*
 * JSON schemas for each generation mode, enforced by the provider's structured-output
 * feature. They stay inside the subset every provider accepts: every object lists all
 * properties as required and sets additionalProperties: false; no numeric or length
 * constraints (counts and ranges are checked in normalize.ts instead).
 */

type Schema = Record<string, unknown>;

const object = (properties: Record<string, Schema>): Schema => ({
  type: "object",
  properties,
  required: Object.keys(properties),
  additionalProperties: false,
});
const string = (description: string): Schema => ({ type: "string", description });
const list = (items: Schema, description: string): Schema => ({ type: "array", items, description });

export const GENERATION_SCHEMAS: Record<GeneratedMode, Schema> = {
  mcq: object({
    questions: list(
      object({
        question: string("The question, self-contained"),
        options: list({ type: "string" }, "Exactly 4 answer options, no letter prefixes"),
        answerIndex: { type: "integer", description: "0-based index of the correct option" },
        explanation: string("1-2 sentences on why the answer is correct"),
      }),
      "The questions",
    ),
  }),
  flashcards: object({
    cards: list(object({ front: string("Short prompt or term"), back: string("Answer in 1-3 sentences") }), "The flashcards"),
  }),
  fillGap: object({
    items: list(
      object({
        before: string("Text before the blank"),
        answer: string("The removed key term, at most 3 words"),
        alternatives: list({ type: "string" }, "Other accepted answers; may be empty"),
        after: string("Text after the blank, including final punctuation"),
      }),
      "The fill-in-the-blank sentences",
    ),
  }),
  keypoints: object({
    topics: list(
      object({
        title: string("Topic title, 2-5 words"),
        points: list(
          object({ title: string("The idea in one short line"), body: string("1-3 sentence explanation"), tip: string("Short memory aid or exam tip") }),
          "2-6 key points",
        ),
      }),
      "2-6 topics",
    ),
  }),
};
