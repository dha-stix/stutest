"use client";

import type { ApiErrorCode, ChatMessage, GeneratedMode, UserSettings } from "./types";

export class ApiClientError extends Error {
  constructor(
    public code: ApiErrorCode,
    message: string,
  ) {
    super(message);
  }
}

async function post<T>(url: string, body: object): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  } catch {
    throw new ApiClientError("PROVIDER_ERROR", "You appear to be offline. Check your connection and try again.");
  }
  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.ok) {
    throw new ApiClientError(data?.code ?? "PROVIDER_ERROR", data?.message ?? "Something went wrong. Please try again.");
  }
  return data as T;
}

type Key = Pick<UserSettings, "provider" | "apiKey">;
export interface SourcePayload {
  topic?: string;
  text?: string;
}

export const verifyApiKey = (key: Key) => post<{ ok: true }>("/api/verify-key", key);

export const generateItems = <T>(key: Key, mode: GeneratedMode, source: SourcePayload, count: number, avoid: string[] = []) =>
  post<{ items: T[] }>("/api/generate", { ...key, ...source, mode, count, avoid }).then((r) => r.items);

export const askDocument = (key: Key, source: SourcePayload, messages: ChatMessage[]) =>
  post<{ reply: string }>("/api/chat", { ...key, ...source, messages }).then((r) => r.reply);
