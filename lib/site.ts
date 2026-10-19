import type { Metadata } from "next";

/** Public URL of the site, used for absolute links in previews, sitemap and robots. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
export const SITE_NAME = "Stutest";
export const SITE_TAGLINE = "Study smarter. Ace the test.";
export const SITE_DESCRIPTION =
  "Turn any topic or document into timed multiple-choice tests, flashcards, fill-in-the-gap drills and key points. Free, powered by your own Claude, ChatGPT or Grok key.";

/** Brand colours for places that can't read CSS variables (share images, manifest). */
export const BRAND = { ink: "#0d0f1a", ink2: "#1a1d2b", paper: "#f5f6f8", brand: "#4f3cf0", lime: "#d4f65a", soft: "#c9ccd8" };

/**
 * Share image for every page. Listed explicitly because a page that sets its own
 * openGraph/twitter fields otherwise drops the image inherited from the root.
 * 1200×630 PNG (~75 KB): the size Facebook, LinkedIn, WhatsApp, X, Slack and iMessage all accept.
 */
const SHARE_IMAGE = { url: "/opengraph-image", width: 1200, height: 630, type: "image/png", alt: `${SITE_NAME} — ${SITE_TAGLINE}` };

/**
 * Title, description and link-preview tags for one page. Open Graph and Twitter fields
 * are repeated here because Next.js replaces (not merges) those objects per page.
 * Signed-in app pages pass `private: true` so search engines skip them.
 */
export function pageMetadata(title: string, description: string, options: { path?: string; private?: boolean } = {}): Metadata {
  const url = options.path ? `${SITE_URL}${options.path}` : undefined;
  return {
    title,
    description,
    ...(url ? { alternates: { canonical: url } } : {}),
    openGraph: { type: "website", siteName: SITE_NAME, locale: "en_GB", title: `${title} · ${SITE_NAME}`, description, images: [SHARE_IMAGE], ...(url ? { url } : {}) },
    twitter: { card: "summary_large_image", title: `${title} · ${SITE_NAME}`, description, images: [{ url: "/twitter-image", alt: SHARE_IMAGE.alt }] },
    ...(options.private ? { robots: { index: false, follow: false } } : {}),
  };
}
