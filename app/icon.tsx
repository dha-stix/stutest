import { ImageResponse } from "next/og";
import { ogFonts } from "@/lib/og-fonts";
import { BRAND } from "@/lib/site";

/*
 * App icons in the sizes browsers and platforms ask for:
 * 32 (browser tab), 192 and 512 (Android / installed app), and a "maskable" 512
 * with safe padding for Android's adaptive icon shapes. Served at /icon/<id>.
 */
const ICONS = [
  { id: "32", px: 32, maskable: false },
  { id: "192", px: 192, maskable: false },
  { id: "512", px: 512, maskable: false },
  { id: "maskable", px: 512, maskable: true },
];

export function generateImageMetadata() {
  return ICONS.map(({ id, px }) => ({ id, size: { width: px, height: px }, contentType: "image/png" }));
}

export default async function Icon({ id }: { id: Promise<string | number> }) {
  const requested = String(await id);
  const icon = ICONS.find((i) => i.id === requested) ?? ICONS[0];
  const { px, maskable } = icon;
  // Maskable icons keep the mark inside the central 60% so any mask shape leaves it intact.
  const mark = maskable ? px * 0.6 : px;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: maskable ? BRAND.ink : "transparent" }}>
        <div
          style={{
            width: mark,
            height: mark,
            borderRadius: mark * 0.24,
            background: BRAND.lime,
            color: BRAND.ink,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: mark * 0.7,
            fontWeight: 800,
            fontFamily: "Bricolage Grotesque",
          }}
        >
          S
        </div>
      </div>
    ),
    { width: px, height: px, fonts: await ogFonts() },
  );
}
