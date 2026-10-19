"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useCallback, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useOverlay } from "@/lib/use-overlay";
import { ButtonLink } from "../ui/Button";
import { GoogleIcon } from "../ui/GoogleIcon";
import { Logo } from "../ui/Logo";
import { MenuButton } from "../ui/MenuButton";

const LINKS = [
  { href: "#how", label: "How it works" },
  { href: "#modes", label: "Study modes" },
  { href: "#free", label: "Free" },
  { href: "#faq", label: "FAQ" },
];

const EASE = [0.2, 0.8, 0.2, 1] as const;

export function Navbar() {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const { user } = useAuth();
  useOverlay(open, close);

  return (
    <nav aria-label="Main" className="relative flex items-center justify-between gap-4 py-5 md:py-6">
      <Logo className="relative z-50" />

      <div className="hidden items-center gap-7 text-[15px] md:flex">
        {LINKS.map((l) => (
          <a key={l.href} href={l.href} className="font-ui font-medium text-soft transition hover:text-paper">
            {l.label}
          </a>
        ))}
      </div>
      <div className="hidden items-center gap-2 md:flex">
        {user ? (
          <ButtonLink href="/dashboard" variant="lime" size="sm" className="rounded-full">
            Go to dashboard
          </ButtonLink>
        ) : (
          <>
            <Link href="/auth/login" className="flex min-h-11 items-center rounded-full px-4 font-semibold text-paper hover:text-lime">
              Log in
            </Link>
            <ButtonLink href="/auth/register" variant="lime" size="sm" className="rounded-full">
              Get started
            </ButtonLink>
          </>
        )}
      </div>

      <MenuButton open={open} onClick={() => setOpen(!open)} controls="mobile-menu" className="md:hidden" />

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={{ clipPath: "circle(0% at calc(100% - 38px) 42px)" }}
            animate={{ clipPath: "circle(150% at calc(100% - 38px) 42px)" }}
            exit={{ clipPath: "circle(0% at calc(100% - 38px) 42px)" }}
            transition={{ duration: 0.55, ease: EASE }}
            className="fixed inset-0 z-40 flex flex-col bg-ink px-4 pb-8 pt-24 md:hidden"
          >
            <ul className="flex flex-col">
              {LINKS.map((l, i) => (
                <motion.li
                  key={l.href}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 12 }}
                  transition={{ duration: 0.4, delay: 0.12 + i * 0.06, ease: EASE }}
                  className="border-b border-ink-line"
                >
                  <a href={l.href} onClick={close} className="group flex items-center justify-between py-5 font-display text-[32px] font-bold text-paper">
                    {l.label}
                    <ArrowRight className="text-faint transition group-hover:translate-x-1 group-hover:text-lime" />
                  </a>
                </motion.li>
              ))}
            </ul>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, delay: 0.4, ease: EASE }}
              className="mt-auto flex flex-col gap-3"
            >
              {user ? (
                <ButtonLink href="/dashboard" variant="lime" size="lg" className="w-full">
                  Go to dashboard
                </ButtonLink>
              ) : (
                <>
                  <ButtonLink href="/auth/register" variant="lime" size="lg" className="w-full">
                    <GoogleIcon /> Get started free
                  </ButtonLink>
                  <ButtonLink href="/auth/login" variant="outlineDark" size="lg" className="w-full">
                    Log in
                  </ButtonLink>
                </>
              )}
              <p className="mt-2 text-center text-sm text-faint">Works with Claude, ChatGPT and Grok</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
