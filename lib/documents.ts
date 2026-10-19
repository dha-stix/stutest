"use client";

import { MAX_DOCUMENT_PAGES, MAX_DOCUMENT_WORDS, MAX_UPLOAD_BYTES, WORDS_PER_PAGE } from "./constants";

export interface ParsedDocument {
  fileName: string;
  kind: "pdf" | "docx";
  /** Text of the pages we kept, each prefixed with a [Page n] marker. */
  text: string;
  /** Pages included (the last one may be partial when the word limit is hit). */
  pagesUsed: number;
  totalPages: number;
  words: number;
  /** Which limit trimmed the document, if any. */
  limitedBy: "pages" | "words" | null;
}

export class DocumentError extends Error {}

const kindOf = (file: File): ParsedDocument["kind"] | null => {
  const name = file.name.toLowerCase();
  if (file.type === "application/pdf" || name.endsWith(".pdf")) return "pdf";
  if (name.endsWith(".docx")) return "docx";
  return null;
};

const splitWords = (text: string) => text.split(/\s+/).filter(Boolean);

/** Reads up to MAX_DOCUMENT_PAGES pages of text, stopping early once the word limit is passed. */
async function readPdf(file: File) {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerPort ??= new Worker(new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url), {
    type: "module",
  });
  const pdf = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
  const pages: string[] = [];
  let words = 0;
  for (let n = 1; n <= Math.min(pdf.numPages, MAX_DOCUMENT_PAGES) && words <= MAX_DOCUMENT_WORDS; n++) {
    const page = await pdf.getPage(n);
    const content = await page.getTextContent();
    const text = content.items
      .map((item) => ("str" in item ? item.str + (item.hasEOL ? "\n" : " ") : ""))
      .join("")
      .replace(/[ \t]+/g, " ")
      .trim();
    pages.push(text);
    words += splitWords(text).length;
  }
  await pdf.cleanup();
  return { pages, totalPages: pdf.numPages };
}

async function readDocx(file: File) {
  const mammoth = await import("mammoth");
  const { value } = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
  const words = splitWords(value);
  // DOCX has no fixed pages, so estimate them from word count.
  const totalPages = Math.max(1, Math.ceil(words.length / WORDS_PER_PAGE));
  const pages = Array.from({ length: totalPages }, (_, i) => words.slice(i * WORDS_PER_PAGE, (i + 1) * WORDS_PER_PAGE).join(" "));
  return { pages, totalPages };
}

/** Keeps whole pages until either limit is reached; the page that crosses the word limit is cut mid-way. */
export function applyLimits(pages: string[], totalPages: number) {
  const kept: string[] = [];
  let words = 0;
  let limitedBy: ParsedDocument["limitedBy"] = null;
  for (const [i, page] of pages.entries()) {
    if (i >= MAX_DOCUMENT_PAGES) {
      limitedBy = "pages";
      break;
    }
    const pageWords = splitWords(page);
    const room = MAX_DOCUMENT_WORDS - words;
    if (pageWords.length > room) {
      if (room > 0) kept.push(`[Page ${i + 1}]\n${pageWords.slice(0, room).join(" ")}`);
      words += Math.max(0, room);
      limitedBy = "words";
      break;
    }
    kept.push(`[Page ${i + 1}]\n${page}`);
    words += pageWords.length;
  }
  if (!limitedBy && totalPages > kept.length) limitedBy = totalPages > MAX_DOCUMENT_PAGES ? "pages" : "words";
  return { text: kept.join("\n\n"), pagesUsed: kept.length, words, limitedBy };
}

/** Reads a PDF or DOCX in the browser and keeps the first MAX_DOCUMENT_PAGES pages / MAX_DOCUMENT_WORDS words. */
export async function parseDocument(file: File): Promise<ParsedDocument> {
  const kind = kindOf(file);
  if (!kind) throw new DocumentError("Upload a PDF or Word (.docx) file.");
  if (file.size > MAX_UPLOAD_BYTES) throw new DocumentError("That file is over 10 MB. Try a smaller file.");

  let raw: { pages: string[]; totalPages: number };
  try {
    raw = kind === "pdf" ? await readPdf(file) : await readDocx(file);
  } catch {
    throw new DocumentError("We couldn't open that file. It may be damaged or password-protected.");
  }

  const limited = applyLimits(raw.pages, raw.totalPages);
  if (limited.words < 15) {
    throw new DocumentError("We couldn't find readable text. Scanned PDFs (images of pages) aren't supported yet.");
  }
  return { fileName: file.name, kind, totalPages: raw.totalPages, ...limited };
}
