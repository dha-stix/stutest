import { NextResponse } from "next/server";
import { verifyKey } from "@/lib/ai/providers";
import { fail, handleError, readCredentials, readJson } from "@/lib/ai/route-helpers";

export async function POST(request: Request) {
  const body = await readJson(request);
  if (!body) return fail("BAD_REQUEST", "Invalid request.");
  const creds = readCredentials(body);
  if (creds instanceof NextResponse) return creds;

  try {
    await verifyKey(creds.provider, creds.apiKey);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleError(err);
  }
}
