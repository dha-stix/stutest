"use client";

import clsx from "clsx";
import { Upload } from "lucide-react";
import { useRef, useState } from "react";
import { MAX_DOCUMENT_PAGES, MAX_DOCUMENT_WORDS } from "@/lib/constants";
import { formatTokens, wordsToTokens } from "@/lib/usage";
import { DocumentError, parseDocument, type ParsedDocument } from "@/lib/documents";
import { Notice } from "../ui/Notice";
import { Spinner } from "../ui/Spinner";

interface DocumentDropProps {
  doc: ParsedDocument | null;
  onChange: (doc: ParsedDocument | null) => void;
}

/** Drag-and-drop/browse upload that parses the file in the browser and shows which pages are kept. */
export function DocumentDrop({ doc, onChange }: DocumentDropProps) {
  const input = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError("");
    setParsing(true);
    try {
      onChange(await parseDocument(file));
    } catch (err) {
      onChange(null);
      setError(err instanceof DocumentError ? err.message : "We couldn't read that file.");
    } finally {
      setParsing(false);
      if (input.current) input.current.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFile(e.dataTransfer.files[0]);
        }}
        className={clsx(
          "flex cursor-pointer flex-col items-center gap-2 rounded-[20px] border-2 border-dashed p-7 text-center transition",
          dragging ? "scale-[1.01] border-brand bg-brand-soft" : "border-brand-line bg-brand-tint hover:border-brand",
        )}
      >
        {parsing ? <Spinner className="size-8 text-brand" /> : <Upload className="sv-bob text-brand" size={36} strokeWidth={1.8} />}
        <span className="font-bold">{parsing ? "Reading your document…" : "Drop a PDF or DOCX, or browse"}</span>
        <span className="text-sm text-muted">
          Up to {MAX_DOCUMENT_PAGES} pages or {MAX_DOCUMENT_WORDS.toLocaleString()} words are used · files up to 10 MB
        </span>
        <input
          ref={input}
          type="file"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="sr-only"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </label>

      {error && <Notice tone="error">{error}</Notice>}

      {doc && (
        <div className="st-pop rounded-[18px] border border-line p-[18px]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-12 w-10 shrink-0 items-center justify-center rounded-lg bg-danger-soft text-[11px] font-extrabold font-ui uppercase text-danger-ink">
                {doc.kind}
              </span>
              <div className="min-w-0">
                <div className="truncate font-bold">{doc.fileName}</div>
                <div className="text-[13px] text-muted">
                  {doc.totalPages} page{doc.totalPages > 1 ? "s" : ""}
                  {doc.kind === "docx" && " (estimated)"} · {doc.words.toLocaleString()} words used
                </div>
              </div>
            </div>
            <button type="button" onClick={() => onChange(null)} className="min-h-11 px-2 text-muted hover:text-ink">
              Remove
            </button>
          </div>
          {doc.limitedBy && (
            <Notice tone="warn" className="mt-3.5">
              {doc.limitedBy === "pages"
                ? `This file has ${doc.totalPages} pages. Only pages 1–${doc.pagesUsed} will be used; the rest are cut.`
                : `Stutest reads up to ${MAX_DOCUMENT_WORDS.toLocaleString()} words, so it will use pages 1–${doc.pagesUsed}${doc.pagesUsed < doc.totalPages ? ` (page ${doc.pagesUsed} partly)` : ""} of ${doc.totalPages}.`}
            </Notice>
          )}
          <Notice tone="info" className="mt-3.5">
            <strong>Token use:</strong> this document is about {formatTokens(wordsToTokens(doc.words))} tokens, and it is sent to your AI provider with
            every generation request and every chat message. More pages means more tokens charged to your API key.
          </Notice>
          <div className="mt-3.5 grid grid-cols-[repeat(auto-fill,minmax(44px,1fr))] gap-2" aria-label="Pages used">
            {Array.from({ length: Math.min(doc.totalPages, 30) }, (_, i) => {
              const kept = i < doc.pagesUsed;
              return (
                <div
                  key={i}
                  className={clsx(
                    "flex h-14 items-end justify-center rounded-lg pb-1.5 text-xs",
                    kept
                      ? "border border-brand-line bg-brand-soft font-bold text-brand-dark"
                      : "bg-[repeating-linear-gradient(135deg,#f0f1f5_0_6px,#e4e6ec_6px_8px)] text-faint line-through",
                  )}
                >
                  {i + 1}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
