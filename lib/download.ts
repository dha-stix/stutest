"use client";

import { buildPackPdf, packFileName } from "./pdf/pack-pdf";
import type { GeneratedMode, Pack } from "./types";

/** Downloads the pack's questions and answers as a PDF for offline study. */
export async function downloadPack(pack: Pack, only?: GeneratedMode) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  buildPackPdf(doc, pack, only);
  doc.save(packFileName(pack, only));
}
