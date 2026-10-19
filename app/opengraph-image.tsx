import { ImageResponse } from "next/og";
import { ogFonts } from "@/lib/og-fonts";
import { BRAND } from "@/lib/site";

// Shared link-preview image (Open Graph); twitter-image.tsx re-uses it.
export const alt = "Stutest — Study smarter. Ace the test.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const MODES = ["Timed MCQ", "Flashcards", "Fill in the gap", "Key points", "Chat"];

export default async function OpenGraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: BRAND.ink, color: BRAND.paper, padding: 72, position: "relative", fontFamily: "Plus Jakarta Sans" }}>
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
                fontFamily: "Sora",
                fontSize: 44,
                fontWeight: 700,
              }}
            >
              S
            </div>
            <div style={{ fontFamily: "Sora", fontSize: 44, fontWeight: 700, letterSpacing: -1 }}>Stutest</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            <div style={{ display: "flex", alignItems: "baseline", fontFamily: "Sora", fontSize: 78, fontWeight: 700, letterSpacing: -2.5, lineHeight: 1 }}>
              Study smarter.&nbsp;<span style={{ color: BRAND.lime }}>Ace&nbsp;</span>
              <span style={{ color: BRAND.lime, fontFamily: "Instrument Serif", fontStyle: "italic", fontWeight: 400, fontSize: 88, letterSpacing: -1 }}>the test.</span>
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
                  fontFamily: "Space Grotesk",
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
