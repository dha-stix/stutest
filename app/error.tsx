"use client";

import { RotateCcw } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";

/** Shown when a page crashes, instead of a blank screen. */
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-ink px-4 text-center text-paper">
      <Logo />
      <h1 className="font-display text-[clamp(26px,4vw,38px)] font-bold">Something went <em className="accent text-lime">wrong</em></h1>
      <p className="max-w-md text-soft">This page hit an unexpected error. Your packs and scores are safe — try again, or head back to your dashboard.</p>
      <div className="flex flex-wrap justify-center gap-3">
        <Button variant="lime" onClick={reset}>
          <RotateCcw size={18} /> Try again
        </Button>
        <ButtonLink href="/dashboard" variant="outlineDark">
          Go to dashboard
        </ButtonLink>
      </div>
    </main>
  );
}
