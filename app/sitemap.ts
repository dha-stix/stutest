import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Only public pages; everything behind sign-in is excluded (see robots.ts).
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/auth/register`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/auth/login`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/privacy`, changeFrequency: "yearly", priority: 0.3 },
  ];
}
