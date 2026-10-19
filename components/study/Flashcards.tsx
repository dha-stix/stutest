"use client";

import clsx from "clsx";
import { ArrowLeft, ArrowRight, Check, RotateCcw, Shuffle } from "lucide-react";
import { motion, type PanInfo } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { shuffle } from "@/lib/study";
import type { Flashcard, Pack } from "@/lib/types";
import { MissingPack, StudyHeader } from "../app/StudyShell";
import { DownloadButton } from "../packs/DownloadButton";
import { TapRipple } from "../svg/AnimatedIcons";
import { Button } from "../ui/Button";
import { SectionTabs } from "./SectionTabs";

type Mark = "known" | "again";
const marksKey = (packId: string) => `stutest:cards:${packId}`;

function loadMarks(packId: string): Record<string, Mark> {
  try {
    return JSON.parse(localStorage.getItem(marksKey(packId)) ?? "{}");
  } catch {
    return {};
  }
}


export function Flashcards({ pack }: { pack: Pack }) {
  const decks = pack.flashcards?.decks ?? [];
  const [deck, setDeck] = useState(0);
  const [order, setOrder] = useState<Flashcard[]>(decks[0]?.cards ?? []);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [marks, setMarks] = useState<Record<string, Mark>>(() => loadMarks(pack.id));
  // A swipe ends with a click on the card; this stops that click from flipping it.
  const dragged = useRef(false);

  useEffect(() => {
    try {
      localStorage.setItem(marksKey(pack.id), JSON.stringify(marks));
    } catch {
      // ignore
    }
  }, [marks, pack.id]);

  const go = useCallback(
    (delta: number) => {
      setFlipped(false);
      setIndex((i) => (i + delta + order.length) % order.length);
    },
    [order.length],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Focused buttons already handle Space/Enter themselves.
      if ((e.key === " " || e.key === "Enter") && !(e.target instanceof HTMLButtonElement)) {
        e.preventDefault();
        setFlipped((f) => !f);
      }
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  if (!decks.length) return <MissingPack message="This pack has no flashcards." />;

  const card = order[index];
  const deckCards = decks[deck].cards;
  const known = deckCards.filter((c) => marks[c.id] === "known").length;
  const toReview = deckCards.filter((c) => marks[c.id] === "again").length;

  const switchDeck = (d: number) => {
    setDeck(d);
    setOrder(decks[d].cards);
    setIndex(0);
    setFlipped(false);
  };
  const mark = (m: Mark) => {
    setMarks((cur) => ({ ...cur, [card.id]: m }));
    go(1);
  };
  const onDragEnd = (_: unknown, info: PanInfo) => {
    dragged.current = Math.abs(info.offset.x) > 6;
    if (Math.abs(info.offset.x) > 80) go(info.offset.x < 0 ? 1 : -1);
  };

  return (
    <>
      <StudyHeader
        backHref={`/packs/${pack.id}`}
        title={`${pack.title} · Flashcards`}
        subtitle={`Deck ${deck + 1} of ${decks.length} · ${deckCards.length} cards`}
        width="max-w-[1000px]"
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => (setOrder(shuffle(deckCards)), setIndex(0), setFlipped(false))}>
              <Shuffle size={16} /> Shuffle
            </Button>
            <DownloadButton pack={pack} mode="flashcards" label="Download" size="sm" />
          </>
        }
      />

      <main className="mx-auto max-w-[760px] px-4 py-10 sm:px-10">
        <SectionTabs count={decks.length} value={deck} onChange={switchDeck} noun="Deck" />
        <div className="flex items-center justify-between text-sm font-semibold text-muted">
          <span>
            Card {index + 1} of {order.length}
          </span>
          <span>
            <span className="text-success-ink">{known} known</span> · <span className="text-warn-ink">{toReview} to review</span>
          </span>
        </div>
        <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-line">
          <div className="h-1.5 bg-brand transition-[width] duration-500" style={{ width: `${((index + 1) / order.length) * 100}%` }} />
        </div>

        <motion.div drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.6} onDragEnd={onDragEnd} className="flip-scene mt-7 touch-pan-y">
          <button
            type="button"
            onClick={() => {
              if (dragged.current) return void (dragged.current = false);
              setFlipped(!flipped);
            }}
            aria-label={flipped ? "Show question" : "Show answer"}
            className="block h-[clamp(320px,52vw,420px)] w-full text-left"
          >
            <div className={clsx("flip-card", flipped && "is-flipped")}>
              <div className="flip-face flex flex-col justify-between rounded-[32px] bg-ink p-[clamp(24px,4vw,44px)] text-paper shadow-[0_40px_80px_-40px_rgba(13,15,26,.6)]">
                <span className="text-[13px] font-bold font-ui uppercase tracking-[0.1em] text-lime">Question</span>
                <span className="font-display text-[clamp(20px,2.8vw,30px)] font-bold leading-[1.15] tracking-[-0.02em]">{card.front}</span>
                <span className="flex items-center gap-2.5 text-sm text-faint">
                  <TapRipple />
                  Tap card or press Space to flip · swipe to move
                </span>
              </div>
              <div className="flip-face flip-back flex flex-col justify-between overflow-y-auto rounded-[32px] bg-lime p-[clamp(24px,4vw,44px)] text-ink shadow-[0_40px_80px_-40px_rgba(13,15,26,.6)]">
                <span className="text-[13px] font-bold font-ui uppercase tracking-[0.1em]">Answer</span>
                <span className="text-[clamp(16px,2vw,21px)] font-semibold leading-normal">{card.back}</span>
                <span className="text-sm text-lime-ink">Tap to see the question again</span>
              </div>
            </div>
          </button>
        </motion.div>

        <div className="mt-7 flex flex-wrap justify-center gap-2.5">
          <button type="button" onClick={() => go(-1)} aria-label="Previous card" className="flex size-[52px] items-center justify-center rounded-full border border-line-strong bg-white hover:border-ink">
            <ArrowLeft size={20} />
          </button>
          <Button className="rounded-full bg-warn-soft text-warn-ink hover:bg-[#ffe2bf]" onClick={() => mark("again")}>
            <RotateCcw size={16} /> Review again
          </Button>
          <Button className="rounded-full" onClick={() => mark("known")}>
            Got it <Check size={16} strokeWidth={3} />
          </Button>
          <button type="button" onClick={() => go(1)} aria-label="Next card" className="flex size-[52px] items-center justify-center rounded-full border border-line-strong bg-white hover:border-ink">
            <ArrowRight size={20} />
          </button>
        </div>
      </main>
    </>
  );
}
