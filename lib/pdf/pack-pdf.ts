import type { jsPDF as JsPDF } from "jspdf";
import { modeInfo } from "../constants";
import type { GeneratedMode, Pack } from "../types";
import { pdfSafe } from "./pdf-text";

/*
 * Lays out a study pack as an A4 PDF. Layout rules that keep it readable:
 * - one spacing scale (SPACE) and two text sizes for body copy, used everywhere;
 * - every question, card and key point is measured first and moved to the next page
 *   whole if it doesn't fit, so options never get separated from their question;
 * - headings are never left alone at the bottom of a page;
 * - answer keys start on their own page so students can test themselves first;
 * - a header and "Page x of y" footer are added once all pages exist.
 */

type RGB = [number, number, number];
const COLOR = {
  ink: [20, 22, 33] as RGB,
  body: [45, 49, 66] as RGB,
  muted: [96, 101, 118] as RGB,
  faint: [150, 155, 170] as RGB,
  line: [222, 225, 232] as RGB,
  brand: [79, 60, 240] as RGB,
  brandSoft: [236, 234, 254] as RGB,
  limeSoft: [240, 250, 210] as RGB,
  success: [11, 106, 71] as RGB,
};

const PAGE = { width: 595.28, height: 841.89 };
const MARGIN = { x: 56, top: 72, bottom: 72 };
const CONTENT_WIDTH = PAGE.width - MARGIN.x * 2;
const SPACE = { xs: 4, sm: 8, md: 14, lg: 22, xl: 34 };
const LINE_HEIGHT = 1.45;
const SIZE = { title: 26, heading: 17, subheading: 13, body: 11, small: 9.5 };
const LETTERS = "ABCDEFGH";

type Style = "normal" | "bold" | "italic";
interface TextOpts {
  size?: number;
  style?: Style;
  color?: RGB;
  /** Offset from the left margin. */
  x?: number;
  width?: number;
}

class Layout {
  y = MARGIN.top;
  constructor(readonly doc: JsPDF) {}

  private apply({ size = SIZE.body, style = "normal", color = COLOR.body }: TextOpts) {
    this.doc.setFont("helvetica", style).setFontSize(size).setTextColor(...color);
  }

  lines(text: string, opts: TextOpts = {}): string[] {
    this.apply(opts);
    return this.doc.splitTextToSize(pdfSafe(text), opts.width ?? CONTENT_WIDTH - (opts.x ?? 0));
  }

  /** Height a paragraph will take, without drawing it. */
  measure(text: string, opts: TextOpts = {}) {
    return this.lines(text, opts).length * (opts.size ?? SIZE.body) * LINE_HEIGHT;
  }

  /** Draws a wrapped paragraph at the cursor and moves the cursor below it. */
  text(text: string, opts: TextOpts = {}) {
    const size = opts.size ?? SIZE.body;
    const lineHeight = size * LINE_HEIGHT;
    for (const line of this.lines(text, opts)) {
      this.fit(lineHeight);
      this.apply(opts);
      // Baseline sits ~80% down the line box so lines are evenly spaced.
      this.doc.text(line, MARGIN.x + (opts.x ?? 0), this.y + size * 1.05);
      this.y += lineHeight;
    }
  }

  gap(amount: number) {
    this.y += amount;
  }

  get remaining() {
    return PAGE.height - MARGIN.bottom - this.y;
  }

  /** Starts a new page if `height` won't fit; blocks taller than a page simply flow. */
  fit(height: number) {
    if (height > this.remaining && this.y > MARGIN.top) this.newPage();
  }

  newPage() {
    this.doc.addPage();
    this.y = MARGIN.top;
  }

  rule(color: RGB = COLOR.line) {
    this.doc.setDrawColor(...color).setLineWidth(0.6);
    this.doc.line(MARGIN.x, this.y, PAGE.width - MARGIN.x, this.y);
  }

  box(x: number, y: number, w: number, h: number, fill?: RGB, stroke?: RGB) {
    if (fill) this.doc.setFillColor(...fill);
    if (stroke) this.doc.setDrawColor(...stroke).setLineWidth(0.8);
    this.doc.roundedRect(MARGIN.x + x, y, w, h, 6, 6, fill && stroke ? "FD" : fill ? "F" : "S");
  }

  /** Section heading with an accent bar; keeps at least `keepWith` points of content below it. */
  heading(text: string, sub?: string, keepWith = 90) {
    const height = SIZE.heading * LINE_HEIGHT + (sub ? SIZE.small * LINE_HEIGHT + SPACE.xs : 0);
    this.fit(height + SPACE.md + keepWith);
    this.doc.setFillColor(...COLOR.brand);
    this.doc.rect(MARGIN.x, this.y + 3, 4, SIZE.heading + 2, "F");
    this.text(text, { size: SIZE.heading, style: "bold", color: COLOR.ink, x: 14 });
    if (sub) {
      this.gap(SPACE.xs);
      this.text(sub, { size: SIZE.small, color: COLOR.muted, x: 14 });
    }
    this.gap(SPACE.md);
  }

  /** "12." label in the left gutter with a hanging-indent paragraph beside it. */
  numbered(label: string, text: string, opts: TextOpts & { gutter?: number } = {}) {
    const gutter = opts.gutter ?? 26;
    const top = this.y;
    this.apply({ ...opts, color: COLOR.brand, style: "bold" });
    this.doc.text(pdfSafe(label), MARGIN.x + (opts.x ?? 0), top + (opts.size ?? SIZE.body) * 1.05);
    this.text(text, { ...opts, x: (opts.x ?? 0) + gutter });
  }
}

const count = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

/* ---------- multiple choice ---------- */

function mcqQuestions(l: Layout, pack: Pack) {
  const sections = pack.mcq?.sections ?? [];
  let number = 1;
  sections.forEach((section, s) => {
    if (s > 0) l.newPage();
    l.heading(
      sections.length > 1 ? `Multiple choice · Section ${s + 1}` : "Multiple choice",
      `${count(section.questions.length, "question")} · suggested time ${Math.max(1, Math.round(section.timeLimitSec / 60))} min · answers at the end`,
    );
    for (const q of section.questions) {
      const optionHeights = q.options.reduce((h, o) => h + l.measure(o, { x: 48 }) + SPACE.xs, 0);
      l.fit(l.measure(q.question, { style: "bold", x: 26 }) + SPACE.sm + optionHeights);
      l.numbered(`${number}.`, q.question, { style: "bold", color: COLOR.ink });
      l.gap(SPACE.sm);
      q.options.forEach((option, k) => {
        l.numbered(`${LETTERS[k]}`, option, { x: 26, gutter: 22 });
        l.gap(SPACE.xs);
      });
      l.gap(SPACE.lg - SPACE.xs);
      number++;
    }
  });
}

function mcqAnswers(l: Layout, pack: Pack) {
  const sections = pack.mcq?.sections ?? [];
  let number = 1;
  l.newPage();
  l.heading("Answer key · Multiple choice", "Check your answers after you finish each section.");
  sections.forEach((section, s) => {
    if (sections.length > 1) {
      l.fit(60);
      l.text(`Section ${s + 1}`, { size: SIZE.subheading, style: "bold", color: COLOR.ink });
      l.gap(SPACE.sm);
    }
    for (const q of section.questions) {
      const answer = `${LETTERS[q.answerIndex]}. ${q.options[q.answerIndex]}`;
      const height = l.measure(answer, { style: "bold", x: 32 }) + (q.explanation ? l.measure(q.explanation, { size: SIZE.small, x: 32 }) + SPACE.xs : 0);
      l.fit(height);
      l.numbered(`${number}.`, answer, { style: "bold", color: COLOR.success, gutter: 32 });
      if (q.explanation) {
        l.gap(SPACE.xs / 2);
        l.text(q.explanation, { size: SIZE.small, color: COLOR.muted, x: 32 });
      }
      l.gap(SPACE.md);
      number++;
    }
    l.gap(SPACE.sm);
  });
}

/* ---------- flashcards ---------- */

function flashcards(l: Layout, pack: Pack) {
  const cards = pack.flashcards?.decks.flatMap((d) => d.cards) ?? [];
  l.heading("Flashcards", `${count(cards.length, "card")} · cover the answer and test yourself`);
  const pad = 14;
  const inner = { x: pad, width: CONTENT_WIDTH - pad * 2 };
  cards.forEach((card, i) => {
    const frontH = l.measure(card.front, { ...inner, style: "bold" });
    const backH = l.measure(card.back, inner);
    const labelH = SIZE.small * LINE_HEIGHT;
    const height = pad + labelH + SPACE.xs + frontH + SPACE.md + labelH + SPACE.xs + backH + pad;
    l.fit(height);
    const top = l.y;
    l.box(0, top, CONTENT_WIDTH, height, undefined, COLOR.line);
    l.gap(pad);
    l.text(`Card ${i + 1} · Question`, { ...inner, size: SIZE.small, style: "bold", color: COLOR.brand });
    l.gap(SPACE.xs);
    l.text(card.front, { ...inner, style: "bold", color: COLOR.ink });
    l.gap(SPACE.md / 2);
    l.doc.setDrawColor(...COLOR.line).setLineDashPattern([3, 3], 0).line(MARGIN.x + pad, l.y, PAGE.width - MARGIN.x - pad, l.y);
    l.doc.setLineDashPattern([], 0);
    l.gap(SPACE.md / 2);
    l.text("Answer", { ...inner, size: SIZE.small, style: "bold", color: COLOR.success });
    l.gap(SPACE.xs);
    l.text(card.back, inner);
    l.y = top + height + SPACE.md;
  });
}

/* ---------- fill in the gap ---------- */

const BLANK = "_______________";

function fillGapQuestions(l: Layout, pack: Pack) {
  const items = pack.fillGap?.sections.flatMap((s) => s.items) ?? [];
  l.heading("Fill in the gap", `${count(items.length, "sentence")} · write the missing word or phrase · answers at the end`);
  items.forEach((item, i) => {
    const sentence = [item.before, BLANK, item.after].filter(Boolean).join(" ").replace(/ ([.,;:!?])/g, "$1");
    l.fit(l.measure(sentence, { x: 26 }) + SPACE.lg);
    l.numbered(`${i + 1}.`, sentence);
    l.gap(SPACE.lg);
  });
}

function fillGapAnswers(l: Layout, pack: Pack) {
  const items = pack.fillGap?.sections.flatMap((s) => s.items) ?? [];
  l.newPage();
  l.heading("Answer key · Fill in the gap");
  items.forEach((item, i) => {
    const also = item.alternatives.length ? `   (also accepted: ${item.alternatives.join(", ")})` : "";
    l.fit(l.measure(item.answer + also, { x: 26 }) + SPACE.sm);
    l.numbered(`${i + 1}.`, item.answer + also, { style: "bold", color: COLOR.success });
    l.gap(SPACE.sm);
  });
}

/* ---------- key points ---------- */

function keypoints(l: Layout, pack: Pack) {
  const topics = pack.keypoints?.topics ?? [];
  l.heading("Key points", `${count(topics.reduce((n, t) => n + t.points.length, 0), "point")} across ${count(topics.length, "topic")}`);
  const tipPad = 10;
  topics.forEach((topic, t) => {
    l.fit(140);
    if (t > 0) l.gap(SPACE.md);
    l.text(topic.title, { size: SIZE.subheading, style: "bold", color: COLOR.brand });
    l.gap(SPACE.sm);
    topic.points.forEach((point, i) => {
      const tip = point.tip ? `Remember: ${point.tip}` : "";
      const tipOpts = { size: SIZE.small, x: 26 + tipPad, width: CONTENT_WIDTH - 26 - tipPad * 2 };
      const tipH = tip ? l.measure(tip, tipOpts) + tipPad * 2 : 0;
      const height = l.measure(point.title, { style: "bold", x: 26 }) + SPACE.xs + l.measure(point.body, { x: 26 }) + (tip ? SPACE.sm + tipH : 0);
      l.fit(height);
      l.numbered(`${i + 1}.`, point.title, { style: "bold", color: COLOR.ink });
      l.gap(SPACE.xs);
      l.text(point.body, { x: 26 });
      if (tip) {
        l.gap(SPACE.sm);
        l.box(26, l.y, CONTENT_WIDTH - 26, tipH, COLOR.limeSoft);
        l.gap(tipPad);
        l.text(tip, { ...tipOpts, color: COLOR.body });
        l.gap(tipPad);
      }
      l.gap(SPACE.lg);
    });
  });
}

/* ---------- assembly ---------- */

const SECTIONS: Record<GeneratedMode, { body: (l: Layout, p: Pack) => void; answers?: (l: Layout, p: Pack) => void }> = {
  mcq: { body: mcqQuestions, answers: mcqAnswers },
  flashcards: { body: flashcards },
  fillGap: { body: fillGapQuestions, answers: fillGapAnswers },
  keypoints: { body: keypoints },
};

function summary(pack: Pack, modes: GeneratedMode[]): string {
  return modes
    .map((m) => {
      if (m === "mcq") return `${modeInfo(m).name} (${count(pack.mcq!.sections.reduce((n, s) => n + s.questions.length, 0), "question")})`;
      if (m === "flashcards") return `Flashcards (${count(pack.flashcards!.decks.reduce((n, d) => n + d.cards.length, 0), "card")})`;
      if (m === "fillGap") return `Fill in the gap (${count(pack.fillGap!.sections.reduce((n, s) => n + s.items.length, 0), "sentence")})`;
      return "Key points";
    })
    .join("  ·  ");
}

function cover(l: Layout, pack: Pack, modes: GeneratedMode[]) {
  l.doc.setFillColor(...COLOR.brand);
  l.doc.rect(0, 0, PAGE.width, 8, "F");
  l.text("STUTEST STUDY PACK", { size: SIZE.small, style: "bold", color: COLOR.brand });
  l.gap(SPACE.sm);
  l.text(pack.title, { size: SIZE.title, style: "bold", color: COLOR.ink });
  l.gap(SPACE.sm);
  const source = pack.source.type === "document" ? `From ${pack.source.fileName} (pages 1–${pack.source.pagesUsed})` : `Topic: ${pack.source.topic}`;
  const date = new Date(pack.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  l.text(`${source}  ·  Created ${date}`, { size: SIZE.small, color: COLOR.muted });
  l.gap(SPACE.xs);
  l.text(`Contents: ${summary(pack, modes)}`, { size: SIZE.small, color: COLOR.muted });
  l.gap(SPACE.md);
  l.rule();
  l.gap(SPACE.xl);
}

/** Header and "Page x of y" footer on every page, drawn once the page count is known. */
function decorate(doc: JsPDF, title: string) {
  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    doc.setFont("helvetica", "normal").setFontSize(8.5).setTextColor(...COLOR.faint);
    if (p > 1) {
      doc.text(pdfSafe(title), MARGIN.x, 40, { maxWidth: CONTENT_WIDTH - 80 });
      doc.text("Stutest", PAGE.width - MARGIN.x, 40, { align: "right" });
      doc.setDrawColor(...COLOR.line).setLineWidth(0.5).line(MARGIN.x, 48, PAGE.width - MARGIN.x, 48);
    }
    doc.setDrawColor(...COLOR.line).setLineWidth(0.5).line(MARGIN.x, PAGE.height - 44, PAGE.width - MARGIN.x, PAGE.height - 44);
    doc.text("Made with Stutest", MARGIN.x, PAGE.height - 30);
    doc.text(`Page ${p} of ${pages}`, PAGE.width - MARGIN.x, PAGE.height - 30, { align: "right" });
  }
}

/** Fills `doc` with the pack (or just one mode of it). */
export function buildPackPdf(doc: JsPDF, pack: Pack, only?: GeneratedMode) {
  const modes = (only ? [only] : (Object.keys(SECTIONS) as GeneratedMode[])).filter((m) => Boolean(pack[m]));
  const l = new Layout(doc);
  cover(l, pack, modes);
  modes.forEach((mode, i) => {
    if (i > 0) l.newPage();
    SECTIONS[mode].body(l, pack);
  });
  // Answer keys go after all the questions so they can't be seen while practising.
  modes.forEach((mode) => SECTIONS[mode].answers?.(l, pack));
  decorate(doc, pack.title);
  doc.setProperties({ title: pdfSafe(pack.title), creator: "Stutest" });
}

export const packFileName = (pack: Pack, only?: GeneratedMode) =>
  `stutest-${pack.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "pack"}${only ? `-${only}` : ""}.pdf`;
