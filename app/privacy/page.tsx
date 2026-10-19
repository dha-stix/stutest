import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { Footer } from "@/components/marketing/Footer";
import { Logo } from "@/components/ui/Logo";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata("Privacy", "What Stutest stores, why, and how to remove it.", { path: "/privacy" });

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="font-display text-2xl font-bold">{title}</h2>
      <div className="mt-3 space-y-3 leading-relaxed text-[#3a3f50]">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <div className="overflow-x-clip">
      <header className="bg-ink px-4 pb-14 pt-6 text-paper sm:px-[clamp(16px,4vw,64px)]">
        <div className="mx-auto max-w-[860px]">
          <Logo />
          <h1 className="mt-12 font-display text-[clamp(28px,4vw,44px)] font-bold tracking-[-0.03em]">How Stutest handles <em className="accent text-lime">your data</em></h1>
          <p className="mt-3 text-soft">Plain-language summary of what the app stores and where it goes.</p>
        </div>
      </header>
      <main className="mx-auto max-w-[860px] px-4 pb-6 pt-4 sm:px-[clamp(16px,4vw,64px)]">
        <Section title="What we store">
          <ul className="list-disc space-y-2 pl-5">
            <li>Your Google account name, email address and profile photo, used to sign you in.</li>
            <li>The AI provider you choose and your API key. It is saved to your own account record, which only you can read.</li>
            <li>Your study packs: the topic or the text of the pages you upload (up to 20 pages), and the questions, flashcards and key points generated from them.</li>
            <li>Your test scores and answers, and your chat history for each pack.</li>
          </ul>
        </Section>
        <Section title="Where it goes">
          <p>
            Accounts and data are stored with Google Firebase (Authentication and Cloud Firestore). When you generate a pack or send a chat message, your topic or
            document text and your API key are sent through Stutest&apos;s server to the AI provider you picked (Anthropic, OpenAI or xAI) to produce the answer.
            That provider&apos;s own terms and privacy policy apply to those requests, and usage is billed to your key.
          </p>
          <p>Stutest does not sell your data or use it for advertising.</p>
        </Section>
        <Section title="Your choices">
          <ul className="list-disc space-y-2 pl-5">
            <li>Remove your API key at any time from the API key page.</li>
            <li>Delete any pack, which also deletes its scores and chat.</li>
            <li>Downloaded PDFs are generated in your browser and saved only to your device.</li>
          </ul>
        </Section>
        <Section title="Contact">
          <p>
            Questions about your data? Reach out to the maker,{" "}
            <a href="https://www.linkedin.com/in/david-asaolu234/" target="_blank" rel="noopener noreferrer" className="font-semibold text-brand underline-offset-2 hover:underline">
              David Asaolu
            </a>
            .
          </p>
          <p>
            <Link href="/" className="font-semibold text-brand">
              ← Back to Stutest
            </Link>
          </p>
        </Section>
      </main>
      <Footer />
    </div>
  );
}
