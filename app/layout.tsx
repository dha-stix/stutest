import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Figtree, JetBrains_Mono } from "next/font/google";
import { AuthProvider } from "@/lib/auth-context";
import "./globals.css";

const figtree = Figtree({ variable: "--font-figtree", subsets: ["latin"] });
const bricolage = Bricolage_Grotesque({ variable: "--font-bricolage", subsets: ["latin"], weight: ["500", "700", "800"] });
const jetbrains = JetBrains_Mono({ variable: "--font-jetbrains", subsets: ["latin"], weight: ["500", "700"] });

export const metadata: Metadata = {
  title: { default: "Stutest — Study smarter. Ace the test.", template: "%s · Stutest" },
  description:
    "Turn any topic or document into timed multiple-choice tests, flashcards, fill-in-the-gap drills and key points. Free, powered by your own Claude, ChatGPT or Grok key.",
};

export const viewport: Viewport = { themeColor: "#0d0f1a" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${figtree.variable} ${bricolage.variable} ${jetbrains.variable}`}>
      <body className="min-h-dvh">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
