import { NextResponse } from "next/server";
import type { ApiError, Provider } from "../types";
import { ProviderError } from "./providers";

const PROVIDERS: Provider[] = ["claude", "openai", "grok"];
/** Rough cap on document text accepted by the API (5 dense pages is well under this). */
export const MAX_SOURCE_CHARS = 60_000;

export const fail = (code: ApiError["code"], message: string, status = 400) =>
  NextResponse.json<ApiError>({ ok: false, code, message }, { status });

export function handleError(err: unknown) {
  if (err instanceof ProviderError) {
    const status = err.code === "INVALID_KEY" ? 401 : err.code === "RATE_LIMITED" ? 429 : 502;
    return fail(err.code, err.message, status);
  }
  console.error("Unexpected API error", err instanceof Error ? err.message : err);
  return fail("PROVIDER_ERROR", "Something went wrong. Please try again.", 500);
}

export interface Credentials {
  provider: Provider;
  apiKey: string;
}

/** Validates the provider/key pair every route needs. Returns an error response or the credentials. */
export function readCredentials(body: Record<string, unknown>): Credentials | NextResponse {
  const provider = body.provider as Provider;
  const apiKey = typeof body.apiKey === "string" ? body.apiKey.trim() : "";
  if (!PROVIDERS.includes(provider)) return fail("BAD_REQUEST", "Choose Claude, ChatGPT or Grok.");
  if (apiKey.length < 12 || apiKey.length > 300) return fail("INVALID_KEY", "That doesn't look like a valid API key.", 401);
  return { provider, apiKey };
}

export async function readJson(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const body = await request.json();
    return body && typeof body === "object" ? body : null;
  } catch {
    return null;
  }
}

export function readSource(body: Record<string, unknown>) {
  const topic = typeof body.topic === "string" ? body.topic.trim().slice(0, 500) : "";
  const text = typeof body.text === "string" ? body.text.slice(0, MAX_SOURCE_CHARS) : "";
  return topic || text ? { topic, text } : null;
}
