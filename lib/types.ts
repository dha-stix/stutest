export type Provider = "claude" | "openai" | "grok";

export type StudyMode = "mcq" | "flashcards" | "fillGap" | "keypoints" | "chat";
export type GeneratedMode = Exclude<StudyMode, "chat">;
export type ScoredMode = "mcq" | "fillGap";

export interface AppUser {
  uid: string;
  name: string;
  email: string;
  photoURL: string | null;
}

export interface UserSettings {
  provider: Provider;
  apiKey: string;
  keyLast4: string;
  verifiedAt: number;
}

export interface MCQuestion {
  id: string;
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

export interface MCQSection {
  index: number;
  questions: MCQuestion[];
  timeLimitSec: number;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
}

export interface FlashcardDeck {
  index: number;
  cards: Flashcard[];
}

export interface FillGapItem {
  id: string;
  before: string;
  answer: string;
  /** Other spellings or synonyms that also count as correct. */
  alternatives: string[];
  after: string;
}

export interface FillGapSection {
  index: number;
  items: FillGapItem[];
}

export interface KeyPoint {
  title: string;
  body: string;
  tip: string;
}

export interface KeypointTopic {
  title: string;
  points: KeyPoint[];
}

export interface PackSource {
  type: "topic" | "document";
  topic?: string;
  fileName?: string;
  pagesUsed?: number;
  totalPages?: number;
}

export interface Pack {
  id: string;
  uid: string;
  title: string;
  source: PackSource;
  modes: StudyMode[];
  createdAt: number;
  mcq?: { sections: MCQSection[] };
  flashcards?: { decks: FlashcardDeck[] };
  fillGap?: { sections: FillGapSection[] };
  keypoints?: { topics: KeypointTopic[] };
  /** Extracted document text (with [Page n] markers) used for chat. */
  documentText?: string;
}

export type NewPack = Omit<Pack, "id" | "uid" | "createdAt">;

export interface Attempt {
  id: string;
  packId: string;
  uid: string;
  mode: ScoredMode;
  section: number;
  /** MCQ: option index or null when skipped. Fill-gap: the typed text. */
  answers: (number | string | null)[];
  /** Question ids in the order they were asked (supports "retake missed"). */
  questionIds: string[];
  score: number;
  total: number;
  durationSec: number;
  createdAt: number;
}

export type NewAttempt = Omit<Attempt, "id" | "uid" | "createdAt">;

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

/** Error codes returned by the /api routes. */
export type ApiErrorCode =
  | "INVALID_KEY"
  | "RATE_LIMITED"
  | "PROVIDER_ERROR"
  | "BAD_OUTPUT"
  | "BAD_REQUEST";

export interface ApiError {
  ok: false;
  code: ApiErrorCode;
  message: string;
}
