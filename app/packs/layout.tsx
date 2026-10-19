import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site";

// Pack pages are private to their owner, so previews stay generic and search engines skip them.
export const metadata: Metadata = pageMetadata("Study pack", "Practice tests, flashcards, key points and chat for one study pack on Stutest.", { private: true });

export default function PacksLayout({ children }: LayoutProps<"/packs">) {
  return children;
}
