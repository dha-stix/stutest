import type { GeneratedMode, Provider, StudyMode } from "./types";

/** Largest number of multiple-choice questions in one section. */
export const MCQ_SECTION_SIZE = 50;
export const FLASHCARD_DECK_SIZE = 25;
export const FILL_GAP_SECTION_SIZE = 20;

/** Documents are cut to whichever limit comes first: this many pages… */
export const MAX_DOCUMENT_PAGES = 20;
/** …or this many words (about 20 average pages; slide decks fit more pages, dense text fewer). */
export const MAX_DOCUMENT_WORDS = 10_000;
/** DOCX files have no real pages, so we estimate one page per this many words. */
export const WORDS_PER_PAGE = 500;
/** Most multiple-choice questions a page of material can support before quality drops. */
export const MCQ_PER_PAGE = 8;
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

export const MCQ_COUNTS = [25, 50, 100, 150, 200];
export const FLASHCARD_COUNTS = [20, 40, 60];
export const FILL_GAP_COUNTS = [10, 20, 40];

export interface ProviderInfo {
  id: Provider;
  name: string;
  maker: string;
  keyPrefix: string;
  consoleUrl: string;
}

export const PROVIDERS: ProviderInfo[] = [
  { id: "claude", name: "Claude", maker: "Anthropic", keyPrefix: "sk-ant-", consoleUrl: "https://console.anthropic.com/settings/keys" },
  { id: "openai", name: "ChatGPT", maker: "OpenAI", keyPrefix: "sk-", consoleUrl: "https://platform.openai.com/api-keys" },
  { id: "grok", name: "Grok", maker: "xAI", keyPrefix: "xai-", consoleUrl: "https://console.x.ai" },
];

export const providerInfo = (id: Provider) => PROVIDERS.find((p) => p.id === id) ?? PROVIDERS[0];

export interface ModeInfo {
  id: StudyMode;
  name: string;
  short: string;
  desc: string;
  path: string;
}

export const MODES: ModeInfo[] = [
  { id: "mcq", name: "Multiple choice", short: "MCQ", desc: "Timed, 50 per section", path: "mcq/0" },
  { id: "flashcards", name: "Flashcards", short: "Flashcards", desc: "Flip to reveal", path: "flashcards" },
  { id: "fillGap", name: "Fill in the gap", short: "Fill-gap", desc: "Type the answer", path: "fill-gap" },
  { id: "keypoints", name: "Key points", short: "Keypoints", desc: "Essentials to know", path: "keypoints" },
  { id: "chat", name: "Chat", short: "Chat", desc: "Ask your document", path: "chat" },
];

export const modeInfo = (id: StudyMode) => MODES.find((m) => m.id === id) ?? MODES[0];

export const GENERATED_MODES: GeneratedMode[] = ["mcq", "flashcards", "fillGap", "keypoints"];
