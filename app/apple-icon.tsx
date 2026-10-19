import { ImageResponse } from "next/og";
import { ogFonts } from "@/lib/og-fonts";
import { BRAND } from "@/lib/site";

// Home-screen icon on iOS (no transparency, so the dark ground fills the corners).
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: BRAND.ink }}>
        <div
          style={{
            width: 132,
            height: 132,
            borderRadius: 34,
            background: BRAND.lime,
            color: BRAND.ink,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 96,
            fontWeight: 700,
            fontFamily: "Sora",
          }}
        >
          S
        </div>
      </div>
    ),
    { ...size, fonts: await ogFonts() },
  );
}
