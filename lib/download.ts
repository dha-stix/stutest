"use client";

import type { jsPDF as JsPDF } from "jspdf";
import type { GeneratedMode, Pack } from "./types";

const MARGIN = 48;
const LETTERS = "ABCDEFGH";

/** Minimal flowing-text writer on top of jsPDF with automatic page breaks. */
class PdfWriter {
  y = MARGIN;
  constructor(private doc: JsPDF) {}

  private get width() {
    return this.doc.internal.pageSize.getWidth() - MARGIN * 2;
  }

  private ensure(height: number) {
    if (this.y + height > this.doc.internal.pageSize.getHeight() - MARGIN) {
      this.doc.addPage();
      this.y = MARGIN;
    }
  }

  text(content: string, opts: { size?: number; bold?: boolean; indent?: number; gap?: number; color?: number } = {}) {
    const { size = 11, bold = false, indent = 0, gap = 4, color = 20 } = opts;
    this.doc.setFont("helvetica", bold ? "bold" : "normal").setFontSize(size).setTextColor(color);
    const lines: string[] = this.doc.splitTextToSize(content, this.width - indent);
    const lineHeight = size * 1.35;
    for (const line of lines) {
      this.ensure(lineHeight);
      this.doc.text(line, MARGIN + indent, this.y + size);
      this.y += lineHeight;
    }
    this.y += gap;
  }

  heading(content: string) {
    this.ensure(60);
    this.y += 10;
    this.text(content, { size: 16, bold: true, gap: 8 });
  }

  newPage() {
    this.doc.addPage();
    this.y = MARGIN;
  }
}

function writeMcq(w: PdfWriter, pack: Pack) {
  for (const section of pack.mcq?.sections ?? []) {
    w.heading(`Multiple choice — Section ${section.index + 1}`);
    section.questions.forEach((q, i) => {
      w.text(`${i + 1}. ${q.question}`, { bold: true, gap: 2 });
      q.options.forEach((o, k) => w.text(`${LETTERS[k]}. ${o}`, { indent: 14, gap: 0 }));
      w.y += 8;
    });
    w.heading(`Answers — Section ${section.index + 1}`);
    section.questions.forEach((q, i) =>
      w.text(`${i + 1}. ${LETTERS[q.answerIndex]} — ${q.explanation}`, { size: 10, gap: 2, color: 60 }),
    );
  }
}

function writeFlashcards(w: PdfWriter, pack: Pack) {
  w.heading("Flashcards");
  pack.flashcards?.decks.flatMap((d) => d.cards).forEach((c, i) => {
    w.text(`${i + 1}. ${c.front}`, { bold: true, gap: 1 });
    w.text(c.back, { indent: 14, gap: 8, color: 60 });
  });
}

function writeFillGap(w: PdfWriter, pack: Pack) {
  const items = pack.fillGap?.sections.flatMap((s) => s.items) ?? [];
  w.heading("Fill in the gap");
  items.forEach((g, i) => w.text(`${i + 1}. ${g.before} ____________ ${g.after}`, { gap: 6 }));
  w.heading("Fill in the gap — Answers");
  items.forEach((g, i) => w.text(`${i + 1}. ${g.answer}`, { size: 10, gap: 2, color: 60 }));
}

function writeKeypoints(w: PdfWriter, pack: Pack) {
  w.heading("Key points");
  for (const topic of pack.keypoints?.topics ?? []) {
    w.text(topic.title, { size: 13, bold: true, gap: 6 });
    topic.points.forEach((p, i) => {
      w.text(`${i + 1}. ${p.title}`, { bold: true, gap: 1 });
      w.text(p.body, { indent: 14, gap: 1 });
      w.text(`Remember: ${p.tip}`, { indent: 14, gap: 8, size: 10, color: 80 });
    });
  }
}

const writers: Record<GeneratedMode, (w: PdfWriter, pack: Pack) => void> = {
  mcq: writeMcq,
  flashcards: writeFlashcards,
  fillGap: writeFillGap,
  keypoints: writeKeypoints,
};

const hasContent = (pack: Pack, mode: GeneratedMode) => Boolean(pack[mode]);

/** Downloads the pack's questions and answers as a PDF for offline study. */
export async function downloadPack(pack: Pack, only?: GeneratedMode) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const w = new PdfWriter(doc);
  w.text(pack.title, { size: 22, bold: true, gap: 2 });
  w.text("Study pack from Stutest", { size: 10, color: 110, gap: 16 });

  const modes = (only ? [only] : (Object.keys(writers) as GeneratedMode[])).filter((m) => hasContent(pack, m));
  modes.forEach((mode, i) => {
    if (i > 0) w.newPage();
    writers[mode](w, pack);
  });

  const slug = pack.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "pack";
  doc.save(`stutest-${slug}${only ? `-${only}` : ""}.pdf`);
}
