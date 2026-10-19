import { readFile } from "node:fs/promises";
import { join } from "node:path";

/** Brand fonts for generated images (share image, app icons). ImageResponse can't use next/font. */
export async function ogFonts() {
  const load = (file: string) => readFile(join(process.cwd(), "assets/fonts", file));
  const [sora, jakarta, space, serif] = await Promise.all([
    load("Sora-700.ttf"),
    load("PlusJakartaSans-500.ttf"),
    load("SpaceGrotesk-700.ttf"),
    load("InstrumentSerif-Italic.ttf"),
  ]);
  return [
    { name: "Sora", data: sora, weight: 700 as const, style: "normal" as const },
    { name: "Plus Jakarta Sans", data: jakarta, weight: 500 as const, style: "normal" as const },
    { name: "Space Grotesk", data: space, weight: 700 as const, style: "normal" as const },
    { name: "Instrument Serif", data: serif, weight: 400 as const, style: "italic" as const },
  ];
}
