"use client";

import { MAX_DOCUMENT_PAGES, MAX_UPLOAD_BYTES, WORDS_PER_PAGE } from "./constants";

export interface ParsedDocument {
  fileName: string;
  kind: "pdf" | "docx";
  /** Text of the pages we kept, each prefixed with a [Page n] marker. */
  text: string;
  pagesUsed: number;
  totalPages: number;
}

export class DocumentError extends Error {}

const kindOf = (file: File): ParsedDocument["kind"] | null => {
  const name = file.name.toLowerCase();
  if (file.type === "application/pdf" || name.endsWith(".pdf")) return "pdf";
  if (name.endsWith(".docx")) return "docx";
  return null;
};

async function readPdf(file: File) {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerPort ??= new Worker(new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url), {
    type: "module",
  });
  const pdf = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
  const keep = Math.min(pdf.numPages, MAX_DOCUMENT_PAGES);
  const pages: string[] = [];
  for (let n = 1; n <= keep; n++) {
    const page = await pdf.getPage(n);
    const content = await page.getTextContent();
    const text = content.items
      .map((item) => ("str" in item ? item.str + (item.hasEOL ? "\n" : " ") : ""))
      .join("")
      .replace(/[ \t]+/g, " ")
      .trim();
    pages.push(`[Page ${n}]\n${text}`);
  }
  await pdf.cleanup();
  return { pages, totalPages: pdf.numPages };
}

async function readDocx(file: File) {
  const mammoth = await import("mammoth");
  const { value } = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
  const words = value.split(/\s+/).filter(Boolean);
  // DOCX has no fixed pages, so estimate them from word count.
  const totalPages = Math.max(1, Math.ceil(words.length / WORDS_PER_PAGE));
  const pages = Array.from({ length: Math.min(totalPages, MAX_DOCUMENT_PAGES) }, (_, i) => {
    const slice = words.slice(i * WORDS_PER_PAGE, (i + 1) * WORDS_PER_PAGE).join(" ");
    return `[Page ${i + 1}]\n${slice}`;
  });
  return { pages, totalPages };
}

/** Reads a PDF or DOCX in the browser and keeps only the first MAX_DOCUMENT_PAGES pages. */
export async function parseDocument(file: File): Promise<ParsedDocument> {
  const kind = kindOf(file);
  if (!kind) throw new DocumentError("Upload a PDF or Word (.docx) file.");
  if (file.size > MAX_UPLOAD_BYTES) throw new DocumentError("That file is over 10 MB. Try a smaller file.");

  let result: { pages: string[]; totalPages: number };
  try {
    result = kind === "pdf" ? await readPdf(file) : await readDocx(file);
  } catch {
    throw new DocumentError("We couldn't open that file. It may be damaged or password-protected.");
  }

  const text = result.pages.join("\n\n");
  if (text.replace(/\[Page \d+\]/g, "").trim().length < 80) {
    throw new DocumentError("We couldn't find readable text. Scanned PDFs (images of pages) aren't supported yet.");
  }
  return { fileName: file.name, kind, text, pagesUsed: result.pages.length, totalPages: result.totalPages };
}
