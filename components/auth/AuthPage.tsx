import clsx from "clsx";
import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "../ui/Logo";
import { GoogleSignInButton } from "./GoogleSignInButton";

interface AuthPageProps {
  mode: "login" | "register";
  /** The decorative half of the split screen. */
  aside: ReactNode;
}

const COPY = {
  login: {
    title: "Welcome back",
    sub: "Log in to Stutest with your Google account.",
    button: "Continue with Google",
    switchText: "New to Stutest?",
    switchLink: { href: "/auth/register", label: "Create an account" },
  },
  register: {
    title: "Create your account",
    sub: "Free forever with your own AI key. Takes about a minute.",
    button: "Sign up with Google",
    switchText: "Already have an account?",
    switchLink: { href: "/auth/login", label: "Log in" },
  },
};

export function AuthPage({ mode, aside }: AuthPageProps) {
  const copy = COPY[mode];
  return (
    <div className="flex min-h-dvh flex-wrap bg-paper">
      <div className={clsx("min-w-0 flex-[1_1_520px]", mode === "register" && "md:order-2")}>{aside}</div>
      <main className="flex min-w-0 flex-[1_1_480px] items-center justify-center px-4 py-[clamp(40px,6vw,80px)]">
        <div className="st-in w-full max-w-[400px]">
          {mode === "register" && <Logo tone="light" className="mb-12" />}
          <h1 className="font-display text-[40px] font-extrabold leading-tight tracking-[-0.03em]">{copy.title}</h1>
          <p className="mb-9 mt-2.5 leading-normal text-muted">{copy.sub}</p>
          <GoogleSignInButton label={copy.button} variant={mode === "register" ? "ink" : "outline"} />
          <p className="mt-7 text-center text-[15px] text-muted">
            {copy.switchText}{" "}
            <Link href={copy.switchLink.href} className="font-bold text-brand hover:text-brand-dark">
              {copy.switchLink.label}
            </Link>
          </p>
          <p className="mt-12 text-center text-[13px] leading-normal text-faint">
            By continuing you agree to how Stutest handles your data, described in the{" "}
            <Link href="/privacy" className="underline underline-offset-2 hover:text-ink">
              privacy page
            </Link>
            .
          </p>
        </div>
      </main>
    </div>
  );
}
