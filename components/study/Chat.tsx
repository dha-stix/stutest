"use client";

import clsx from "clsx";
import { Send } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { askDocument, type SourcePayload } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { providerInfo } from "@/lib/constants";
import { countWords, formatTokens, wordsToTokens } from "@/lib/usage";
import { getChat, saveChat } from "@/lib/firebase-actions";
import type { ChatMessage, Pack } from "@/lib/types";
import { StudyHeader } from "../app/StudyShell";
import { Notice } from "../ui/Notice";

/** Splits "[Page n]" marked text back into pages for the source viewer. */
function splitPages(text: string) {
  return text
    .split(/\[Page (\d+)\]\n?/)
    .slice(1)
    .reduce<{ n: number; text: string }[]>((pages, part, i, all) => (i % 2 === 0 ? [...pages, { n: Number(part), text: all[i + 1]?.trim() ?? "" }] : pages), []);
}

function SourcePanel({ pack }: { pack: Pack }) {
  const pages = useMemo(() => splitPages(pack.documentText ?? ""), [pack.documentText]);
  const [page, setPage] = useState(0);

  if (!pages.length) {
    return (
      <div className="flex flex-1 flex-col gap-3 rounded-2xl bg-[#fafafb] p-5 text-sm leading-relaxed text-[#3a3f50]">
        <div className="font-bold text-ink">Topic</div>
        <p>{pack.source.topic}</p>
        <p className="text-muted">Answers come from your AI tutor&apos;s general knowledge of this topic.</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex gap-1.5" role="tablist" aria-label="Pages">
        {pages.map((p, i) => (
          <button
            key={p.n}
            type="button"
            role="tab"
            aria-selected={i === page}
            onClick={() => setPage(i)}
            className={clsx(
              "h-10 flex-1 rounded-lg text-[13px]",
              i === page ? "border-2 border-brand bg-brand-soft font-bold text-brand-dark" : "border border-line bg-white hover:border-ink",
            )}
          >
            {p.n}
          </button>
        ))}
      </div>
      <div className="relative max-h-[60vh] flex-1 overflow-y-auto rounded-2xl border border-[#eef0f4] bg-[#fafafb] p-5 text-sm leading-[1.7] text-[#3a3f50]">
        <div aria-hidden="true" className="sv-scan pointer-events-none absolute inset-x-0 h-0.5 bg-brand/50 shadow-[0_0_12px_4px_rgba(79,60,240,.25)]" />
        <p className="whitespace-pre-line">{pages[page].text}</p>
      </div>
    </>
  );
}

export function Chat({ pack }: { pack: Pack }) {
  const { user, settings } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [thinking, setThinking] = useState(false);
  const [error, setError] = useState("");
  const log = useRef<HTMLDivElement>(null);
  const isDoc = pack.source.type === "document";
  const source: SourcePayload = isDoc ? { text: pack.documentText } : { topic: pack.source.topic };

  useEffect(() => {
    getChat(pack.id).then(setMessages, () => undefined);
  }, [pack.id]);

  useEffect(() => {
    log.current?.scrollTo({ top: log.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

  async function ask(question: string) {
    const text = question.trim();
    if (!text || thinking || !settings || !user) return;
    const next: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setDraft("");
    setError("");
    setThinking(true);
    try {
      const reply = await askDocument(settings, source, next);
      const withReply: ChatMessage[] = [...next, { role: "assistant", content: reply }];
      setMessages(withReply);
      saveChat(pack.id, user.uid, withReply).catch(() => undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't get an answer. Please try again.");
    } finally {
      setThinking(false);
    }
  }

  const suggestions = isDoc
    ? ["Summarise this document in 5 bullet points", "What are the most important terms?", "Quiz me on page 1"]
    : [`Explain ${pack.title} simply`, "What are common exam mistakes here?", "Give me a quick quiz question"];

  return (
    <div className="flex min-h-dvh flex-col">
      <StudyHeader
        backHref={`/packs/${pack.id}`}
        title={`Chat · ${isDoc ? pack.source.fileName : pack.title}`}
        subtitle={isDoc ? `Answers come only from pages 1–${pack.source.pagesUsed} of your document` : "Ask anything about this topic"}
        width="max-w-[1240px]"
        actions={settings && <span className="rounded-full bg-brand-soft px-3 py-1.5 text-[13px] font-bold text-brand-dark">{providerInfo(settings.provider).name}</span>}
      />

      <div className="mx-auto flex w-full max-w-[1240px] flex-1 flex-wrap items-stretch gap-5 px-4 py-6 sm:px-10">
        <aside aria-label="Source" className="flex min-w-0 flex-[1_1_300px] flex-col gap-3.5 rounded-3xl border border-line bg-white p-5">
          <h2 className="font-bold">{isDoc ? "Source" : "Topic"}</h2>
          <SourcePanel pack={pack} />
        </aside>

        <section aria-label="Conversation" className="flex min-h-[560px] min-w-0 flex-[2_1_480px] flex-col rounded-3xl border border-line bg-white">
          <div ref={log} role="log" aria-live="polite" className="flex max-h-[65vh] flex-1 flex-col gap-3.5 overflow-y-auto p-6">
            {!messages.length && (
              <div className="m-auto max-w-sm text-center text-muted">
                <p className="font-display text-xl font-bold text-ink">Ask your first question</p>
                <p className="mt-1.5 text-sm">Try one of the suggestions below.</p>
              </div>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={clsx(
                  "st-in max-w-[85%] whitespace-pre-line px-4 py-3 text-[15px] leading-relaxed",
                  m.role === "user" ? "self-end rounded-[18px_18px_4px_18px] bg-brand text-white" : "self-start rounded-[18px_18px_18px_4px] bg-[#f0f1f5]",
                )}
              >
                {m.content}
              </div>
            ))}
            {thinking && (
              <div className="flex gap-1.5 self-start rounded-[18px_18px_18px_4px] bg-[#f0f1f5] px-4 py-3.5" aria-label="Tutor is typing">
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </div>
            )}
          </div>

          <div className="border-t border-[#eef0f4] p-4 sm:px-5 sm:pb-5">
            {!settings && (
              <Notice tone="warn" className="mb-3">
                Connect an AI provider to chat.{" "}
                <Link href="/settings/api-key" className="font-bold underline">
                  Add your API key
                </Link>
              </Notice>
            )}
            {error && (
              <Notice tone="error" className="mb-3">
                {error}
              </Notice>
            )}
            <div className="mb-3 flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => ask(s)}
                  disabled={thinking || !settings}
                  className="min-h-10 rounded-full border border-[#dcd8ff] bg-brand-tint px-3.5 text-sm font-semibold text-brand-dark hover:border-brand disabled:opacity-50"
                >
                  {s}
                </button>
              ))}
            </div>
            <p className="mb-2.5 text-xs text-faint">
              {isDoc
                ? `Each message sends your document (~${formatTokens(wordsToTokens(countWords(pack.documentText ?? "")))} tokens) plus the chat so far to your AI provider.`
                : "Each message sends the chat so far to your AI provider."}
            </p>
            <form
              className="flex gap-2.5"
              onSubmit={(e) => {
                e.preventDefault();
                ask(draft);
              }}
            >
              <label htmlFor="chat-input" className="sr-only">
                Ask a question
              </label>
              <input
                id="chat-input"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={isDoc ? "Ask anything about your document…" : "Ask anything about this topic…"}
                maxLength={2000}
                className="min-h-[52px] min-w-0 flex-1 rounded-[14px] border border-line-strong px-4"
              />
              <button
                type="submit"
                aria-label="Send"
                disabled={!draft.trim() || thinking || !settings}
                className="flex size-[52px] shrink-0 items-center justify-center rounded-[14px] bg-brand text-white transition hover:bg-brand-dark disabled:opacity-50"
              >
                <Send size={20} />
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}
