import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    // Only the API is off limits. Signed-in pages stay crawlable so link previews work on
    // platforms that obey robots.txt (e.g. X); their noindex tag keeps them out of search.
    rules: { userAgent: "*", allow: "/", disallow: ["/api/"] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
