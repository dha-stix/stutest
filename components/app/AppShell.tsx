"use client";

import clsx from "clsx";
import { KeyRound, Layers, LayoutDashboard, LogOut, Plus } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useAuth } from "@/lib/auth-context";
import { providerInfo } from "@/lib/constants";
import { signOutUser } from "@/lib/firebase-actions";
import { Logo } from "../ui/Logo";
import { RequireAuth } from "./RequireAuth";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/create", label: "New test", icon: Plus },
  { href: "/packs", label: "My packs", icon: Layers },
  { href: "/settings/api-key", label: "API key", icon: KeyRound },
];

const initials = (name: string) =>
  name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, settings } = useAuth();

  return (
    <aside className="flex flex-[1_1_240px] flex-col gap-7 bg-ink px-4 py-6 text-paper md:sticky md:top-0 md:h-dvh md:max-w-[260px]">
      <Logo href="/dashboard" className="px-2" />
      <nav aria-label="App" className="flex flex-wrap gap-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href === "/packs" && pathname.startsWith("/packs"));
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={clsx(
                "flex min-h-11 flex-[1_1_140px] items-center gap-3 rounded-xl px-3 font-semibold transition",
                active ? "bg-brand text-white" : "text-soft hover:bg-ink-2 hover:text-paper",
              )}
            >
              <Icon size={18} aria-hidden="true" />
              {label}
            </Link>
          );
        })}
      </nav>
      {user && (
        <div className="mt-auto flex items-center gap-3 border-t border-ink-line px-2 pt-4">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-soft text-sm font-bold text-brand">{initials(user.name)}</span>
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
      )}
    </aside>
  );
}

/** Sidebar layout for dashboard-style pages. */
export function AppShell({ children, width = "max-w-[1100px]" }: { children: ReactNode; width?: string }) {
  return (
    <RequireAuth>
      <div className="flex min-h-dvh flex-col md:flex-row">
        <Sidebar />
        <main className="min-w-0 flex-1 px-4 pb-12 pt-8 sm:px-[clamp(16px,4vw,48px)]">
          <div className={clsx("mx-auto", width)}>{children}</div>
        </main>
      </div>
    </RequireAuth>
  );
}
