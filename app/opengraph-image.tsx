import { ImageResponse } from "next/og";
import { ogFonts } from "@/lib/og-fonts";
import { BRAND, SITE_TAGLINE } from "@/lib/site";

// Shared link-preview image (Open Graph); twitter-image.tsx re-uses it.
export const alt = "Stutest — Study smarter. Ace the test.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const MODES = ["Timed MCQ", "Flashcards", "Fill in the gap", "Key points", "Chat"];

export default async function OpenGraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: BRAND.ink, color: BRAND.paper, padding: 72, position: "relative", fontFamily: "Bricolage Grotesque" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 12, background: BRAND.brand, display: "flex" }} />
        <div
          style={{
            position: "absolute",
            right: -90,
            top: 90,
            width: 520,
            height: 520,
            borderRadius: 999,
            border: `3px dashed ${BRAND.ink2}`,
            display: "flex",
          }}
        />
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: 20,
                background: BRAND.lime,
                color: BRAND.ink,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 44,
                fontWeight: 800,
              }}
            >
              S
            </div>
            <div style={{ fontSize: 44, fontWeight: 800, letterSpacing: -1 }}>Stutest</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            <div style={{ display: "flex", fontSize: 84, fontWeight: 800, letterSpacing: -3, lineHeight: 1 }}>
              {SITE_TAGLINE.split(". ")[0]}.&nbsp;<span style={{ color: BRAND.lime }}>{SITE_TAGLINE.split(". ")[1]}</span>
            </div>
            <div style={{ fontSize: 34, fontWeight: 500, color: BRAND.soft, maxWidth: 900 }}>Turn any topic or document into tests, flashcards and more. Free with your own AI key.</div>
          </div>

          <div style={{ display: "flex", gap: 14 }}>
            {MODES.map((m, i) => (
              <div
                key={m}
                style={{
                  display: "flex",
                  padding: "12px 22px",
                  borderRadius: 999,
                  fontSize: 26,
                  fontWeight: 700,
                  background: i === 0 ? BRAND.brand : BRAND.ink2,
                  color: i === 0 ? "#ffffff" : BRAND.soft,
                }}
              >
                {m}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    { ...size, fonts: await ogFonts() },
  );
}
