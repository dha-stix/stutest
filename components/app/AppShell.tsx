"use client";

import clsx from "clsx";
import { KeyRound, Layers, LayoutDashboard, LogOut, Plus } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useState, type ReactNode } from "react";
import { useAuth } from "@/lib/auth-context";
import { providerInfo } from "@/lib/constants";
import { signOutUser } from "@/lib/firebase-actions";
import { useOverlay } from "@/lib/use-overlay";
import { Logo } from "../ui/Logo";
import { MenuButton } from "../ui/MenuButton";
import { RequireAuth } from "./RequireAuth";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/create", label: "New test", icon: Plus },
  { href: "/packs", label: "My packs", icon: Layers },
  { href: "/settings/api-key", label: "API key", icon: KeyRound },
];

const EASE = [0.2, 0.8, 0.2, 1] as const;

const initials = (name: string) =>
  name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

function NavLinks({ onNavigate, animated }: { onNavigate?: () => void; animated?: boolean }) {
  const pathname = usePathname();
  return (
    <nav aria-label="App" className="flex flex-col gap-1">
      {NAV.map(({ href, label, icon: Icon }, i) => {
        const active = pathname === href || (href === "/packs" && pathname.startsWith("/packs"));
        const link = (
          <Link
            href={href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={clsx(
              "flex min-h-12 items-center gap-3 rounded-xl px-3 font-ui font-semibold transition",
              active ? "bg-brand text-white" : "text-soft hover:bg-ink-2 hover:text-paper",
            )}
          >
            <Icon size={18} aria-hidden="true" />
            {label}
          </Link>
        );
        return animated ? (
          <motion.div key={href} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35, delay: 0.1 + i * 0.05, ease: EASE }}>
            {link}
          </motion.div>
        ) : (
          <div key={href}>{link}</div>
        );
      })}
    </nav>
  );
}

function UserCard() {
  const router = useRouter();
  const { user, settings } = useAuth();
  if (!user) return null;
  return (
    <div className="mt-auto flex items-center gap-3 border-t border-ink-line px-2 pt-4">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-soft text-sm font-bold text-brand">{initials(user.name)}</span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold">{user.name}</div>
        <div className="truncate text-xs text-faint">{settings ? `${providerInfo(settings.provider).name} key · active` : "No AI key yet"}</div>
      </div>
      <button
        type="button"
        aria-label="Sign out"
        onClick={() => signOutUser().then(() => router.replace("/"))}
        className="flex size-11 shrink-0 items-center justify-center rounded-xl text-soft hover:bg-ink-2 hover:text-paper"
      >
        <LogOut size={18} />
      </button>
    </div>
  );
}

/** Fixed sidebar from tablet width up. */
function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-dvh w-[248px] shrink-0 flex-col gap-8 bg-ink px-4 py-6 text-paper md:flex">
      <Logo href="/dashboard" className="px-2" />
      <NavLinks />
      <UserCard />
    </aside>
  );
}

/** Phone layout: slim top bar plus a drawer that slides in from the right. */
function MobileNav() {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  useOverlay(open, close);

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between gap-3 bg-ink/95 px-4 py-3 text-paper backdrop-blur md:hidden">
        <Logo href="/dashboard" size="sm" />
        <div className="flex items-center gap-2">
          <Link href="/create" aria-label="New test" className="flex size-11 items-center justify-center rounded-xl bg-lime text-ink">
            <Plus size={20} strokeWidth={2.6} />
          </Link>
          <MenuButton open={open} onClick={() => setOpen(!open)} controls="app-drawer" />
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <>
            <motion.button
              type="button"
              aria-label="Close menu"
              onClick={close}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-ink/60 backdrop-blur-sm md:hidden"
            />
            <motion.aside
              id="app-drawer"
              aria-label="Menu"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.4, ease: EASE }}
              className="fixed inset-y-0 right-0 z-40 flex w-[min(320px,86vw)] flex-col gap-6 bg-ink px-4 pb-6 pt-20 text-paper shadow-2xl md:hidden"
            >
              <NavLinks onNavigate={close} animated />
              <UserCard />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

/** Layout for dashboard-style pages: sidebar on tablet/desktop, top bar + drawer on phones. */
export function AppShell({ children, width = "max-w-[1100px]" }: { children: ReactNode; width?: string }) {
  return (
    <RequireAuth>
      <div className="flex min-h-dvh flex-col md:flex-row">
        <Sidebar />
        <MobileNav />
        <main className="min-w-0 flex-1 px-4 pb-12 pt-6 sm:px-[clamp(16px,4vw,48px)] md:pt-8">
          <div className={clsx("mx-auto", width)}>{children}</div>
        </main>
      </div>
    </RequireAuth>
  );
}
