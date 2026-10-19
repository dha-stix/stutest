import { NextResponse } from "next/server";
import { extractJson, itemKey, normalize } from "@/lib/ai/normalize";
import { generationPrompt } from "@/lib/ai/prompts";
import { callModel, ProviderError } from "@/lib/ai/providers";
import { fail, handleError, readCredentials, readJson, readSource } from "@/lib/ai/route-helpers";
import { GENERATION_SCHEMAS } from "@/lib/ai/schemas";
import { GENERATED_MODES, MCQ_SECTION_SIZE } from "@/lib/constants";
import type { GeneratedMode } from "@/lib/types";

// Large question sets can take a while to write.
export const maxDuration = 300;

/** One initial call plus one top-up/retry keeps a full section within the time limit. */
const MAX_CALLS = 2;

export async function POST(request: Request) {
  const body = await readJson(request);
  if (!body) return fail("BAD_REQUEST", "Invalid request.");
  const creds = readCredentials(body);
  if (creds instanceof NextResponse) return creds;

  const mode = body.mode as GeneratedMode;
  if (!GENERATED_MODES.includes(mode)) return fail("BAD_REQUEST", "Unknown study mode.");
  const source = readSource(body);
  if (!source) return fail("BAD_REQUEST", "Enter a topic or upload a document.");

  // One call never writes more than a section's worth of items.
  const count = Math.min(Math.max(Number(body.count) || 10, 1), MCQ_SECTION_SIZE);
  const avoid = Array.isArray(body.avoid) ? body.avoid.filter((q): q is string => typeof q === "string").slice(-80) : [];
  const schema = { name: `stutest_${mode}`, schema: GENERATION_SCHEMAS[mode] };

  try {
    const items: unknown[] = [];
    let lastError: ProviderError | null = null;

    for (let call = 0; call < MAX_CALLS; call++) {
      const need = mode === "keypoints" ? 1 : count - items.length;
      const existing = [...avoid, ...items.map((i) => itemKey(mode, i))];
      const prompt = generationPrompt(mode, source, need, existing);
      const reply = await callModel({ ...creds, system: prompt.system, messages: [{ role: "user", content: prompt.user }], schema });

      try {
        items.push(...normalize(mode, extractJson(reply), existing).slice(0, mode === "keypoints" ? undefined : need));
      } catch {
        lastError = new ProviderError("BAD_OUTPUT", "The AI returned something we couldn't read. Please try again.");
        continue;
      }
      // Key points come back whole; for counted modes, top up only a real shortfall (>10%).
      if (mode === "keypoints" ? items.length > 0 : count - items.length <= Math.floor(count * 0.1)) break;
    }

    if (!items.length) throw lastError ?? new ProviderError("BAD_OUTPUT", "The AI didn't return any usable items. Please try again.");
    return NextResponse.json({ ok: true, items });
  } catch (err) {
    return handleError(err);
  }
}
