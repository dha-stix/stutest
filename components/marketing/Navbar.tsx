"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ButtonLink } from "../ui/Button";
import { Logo } from "../ui/Logo";
import { useAuth } from "@/lib/auth-context";

const LINKS = [
  { href: "#how", label: "How it works" },
  { href: "#modes", label: "Study modes" },
  { href: "#free", label: "Free" },
  { href: "#faq", label: "FAQ" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  return (
    <nav aria-label="Main" className="relative flex items-center justify-between gap-4 py-6">
      <Logo />
      <div className="hidden items-center gap-7 text-[15px] md:flex">
        {LINKS.map((l) => (
          <a key={l.href} href={l.href} className="text-soft transition hover:text-paper">
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

      <button
        type="button"
        className="flex size-11 items-center justify-center rounded-xl border border-ink-line text-paper md:hidden"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {open && (
        <div className="st-pop absolute inset-x-0 top-full z-30 flex flex-col gap-1 rounded-2xl border border-ink-line bg-ink-2 p-3 md:hidden">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="rounded-xl px-4 py-3 font-semibold text-soft hover:bg-ink">
              {l.label}
            </a>
          ))}
          <div className="mt-2 grid grid-cols-2 gap-2">
            <ButtonLink href={user ? "/dashboard" : "/auth/login"} variant="outlineDark" size="sm">
              {user ? "Dashboard" : "Log in"}
            </ButtonLink>
            <ButtonLink href="/auth/register" variant="lime" size="sm">
              Get started
            </ButtonLink>
          </div>
        </div>
      )}
    </nav>
  );
}
