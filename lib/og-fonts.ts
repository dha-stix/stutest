import { readFile } from "node:fs/promises";
import { join } from "node:path";

/** Brand fonts for generated images (share image, app icons). ImageResponse can't use next/font. */
export async function ogFonts() {
  const load = (weight: number) => readFile(join(process.cwd(), `assets/fonts/BricolageGrotesque-${weight}.ttf`));
  const [medium, extraBold] = await Promise.all([load(500), load(800)]);
  return [
    { name: "Bricolage Grotesque", data: medium, weight: 500 as const, style: "normal" as const },
    { name: "Bricolage Grotesque", data: extraBold, weight: 800 as const, style: "normal" as const },
  ];
}
