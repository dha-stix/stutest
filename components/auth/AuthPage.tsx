import clsx from "clsx";
import { ArrowLeft, Check } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "../ui/Logo";
import { GoogleSignInButton } from "./GoogleSignInButton";

interface AuthPageProps {
  mode: "login" | "register";
  /** The decorative half of the split screen, shown on large screens only. */
  aside: ReactNode;
}

const COPY = {
  login: {
    title: <>Welcome <em className="accent">back</em></>,
    sub: "Log in to Stutest with your Google account.",
    button: "Continue with Google",
    switchText: "New to Stutest?",
    switchLink: { href: "/auth/register", label: "Create an account" },
  },
  register: {
    title: <>Create your <em className="accent">account</em></>,
    sub: "Free forever with your own AI key. Takes about a minute.",
    button: "Sign up with Google",
    switchText: "Already have an account?",
    switchLink: { href: "/auth/login", label: "Log in" },
  },
};

const PERKS = ["Free with your own AI key", "Tests, flashcards and key points", "Works on phone, tablet and desktop"];

/**
 * Split screen on large displays (form + illustrated panel). On phones and tablets the
 * panel is dropped so the form is the first thing on screen.
 */
export function AuthPage({ mode, aside }: AuthPageProps) {
  const copy = COPY[mode];
  return (
    <div className="flex min-h-dvh bg-paper">
      <div className={clsx("hidden min-w-0 flex-1 lg:block", mode === "register" && "lg:order-2")}>{aside}</div>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between px-5 pt-5 sm:px-8 sm:pt-7">
          <Logo tone="light" className={clsx(mode === "login" && "lg:invisible")} />
          <Link href="/" className="flex min-h-11 items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink">
            <ArrowLeft size={16} /> Home
          </Link>
        </header>

        <main className="flex flex-1 items-center justify-center px-5 py-10 sm:px-8">
          <div className="st-in w-full max-w-[400px]">
            <h1 className="font-display text-[clamp(26px,6.5vw,34px)] font-bold leading-tight tracking-[-0.03em]">{copy.title}</h1>
            <p className="mb-8 mt-2.5 leading-normal text-muted">{copy.sub}</p>
            <GoogleSignInButton label={copy.button} variant={mode === "register" ? "ink" : "outline"} />

            <ul className="mt-7 flex flex-col gap-2.5 rounded-2xl border border-line bg-white p-4 text-sm lg:hidden">
              {PERKS.map((p) => (
                <li key={p} className="flex items-center gap-2.5">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-success-soft text-success">
                    <Check size={12} strokeWidth={3} />
                  </span>
                  {p}
                </li>
              ))}
            </ul>

            <p className="mt-7 text-center text-[15px] text-muted">
              {copy.switchText}{" "}
              <Link href={copy.switchLink.href} className="font-bold text-brand hover:text-brand-dark">
                {copy.switchLink.label}
              </Link>
            </p>
          </div>
        </main>

        <footer className="px-5 pb-6 text-center text-[13px] leading-normal text-faint sm:px-8">
          By continuing you agree to how Stutest handles your data, described in the{" "}
          <Link href="/privacy" className="underline underline-offset-2 hover:text-ink">
            privacy page
          </Link>
          .
        </footer>
      </div>
    </div>
  );
}
