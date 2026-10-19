import { ArrowUp } from "lucide-react";
import Link from "next/link";
import { Logo } from "../ui/Logo";
import { sectionX } from "./SectionHeading";

const AUTHOR_URL = "https://www.linkedin.com/in/david-asaolu234/";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { label: "How it works", href: "/#how" },
      { label: "Study modes", href: "/#modes" },
      { label: "FAQ", href: "/#faq" },
      { label: "Get started", href: "/auth/register" },
      { label: "Log in", href: "/auth/login" },
    ],
  },
  {
    title: "Study modes",
    links: ["Multiple choice", "Flashcards", "Fill in the gap", "Key points", "Chat with documents"].map((label) => ({ label, href: "/#modes" })),
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/#how" },
      { label: "Contact", href: AUTHOR_URL },
      { label: "Privacy", href: "/privacy" },
    ],
  },
];

const iconLink = "flex size-11 items-center justify-center rounded-xl border border-ink-line text-paper transition hover:border-lime hover:text-lime";

export function Footer() {
  return (
    <footer className={`mt-20 md:mt-28 bg-ink pb-8 pt-20 text-soft ${sectionX}`}>
      <div className="mx-auto max-w-[1240px]">
        <div className="flex flex-wrap gap-x-10 gap-y-12">
          <div className="min-w-0 flex-[2_1_300px]">
            <Logo markClassName="sv-bob" />
            <p className="mt-4 max-w-[320px] leading-relaxed">Turn any topic or document into tests, flashcards and key points. Free for every student.</p>
            <div className="mt-6 flex gap-2.5">
              <a href={AUTHOR_URL} target="_blank" rel="noopener noreferrer" aria-label="David Asaolu on LinkedIn" className={iconLink}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="3" />
                  <path d="M8 10v7M8 7v.01M12 17v-4a2 2 0 0 1 4 0v4M12 10v7" />
                </svg>
              </a>
            </div>
          </div>
          {COLUMNS.map((col) => (
            <nav key={col.title} aria-label={col.title} className="min-w-0 flex-[1_1_160px]">
              <h3 className="mb-3.5 text-[13px] font-bold font-ui uppercase tracking-[0.1em] text-paper">{col.title}</h3>
              <ul className="flex flex-col gap-1">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="inline-block py-1.5 transition hover:text-lime">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-ink-line pt-6 text-sm text-faint">
          <span>© {new Date().getFullYear()} Stutest. All rights reserved.</span>
          <span>
            Built by{" "}
            <a href={AUTHOR_URL} target="_blank" rel="noopener noreferrer" className="font-semibold text-paper underline-offset-4 hover:text-lime hover:underline">
              David Asaolu
            </a>
          </span>
          <a href="#top" className="inline-flex min-h-11 items-center gap-1.5 font-semibold text-paper hover:text-lime">
            Back to top <ArrowUp size={16} className="sv-bob" />
          </a>
        </div>
      </div>
    </footer>
  );
}
