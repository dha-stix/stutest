import { NextResponse } from "next/server";
import { chatSystemPrompt } from "@/lib/ai/prompts";
import { callModel } from "@/lib/ai/providers";
import { fail, handleError, readCredentials, readJson, readSource } from "@/lib/ai/route-helpers";
import type { ChatMessage } from "@/lib/types";

export const maxDuration = 120;
const MAX_HISTORY = 20;

function readMessages(value: unknown): ChatMessage[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((m): m is ChatMessage => !!m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .map((m) => ({ role: m.role, content: m.content.slice(0, 4000) }))
    .slice(-MAX_HISTORY);
}

export async function POST(request: Request) {
  const body = await readJson(request);
  if (!body) return fail("BAD_REQUEST", "Invalid request.");
  const creds = readCredentials(body);
  if (creds instanceof NextResponse) return creds;

  const source = readSource(body);
  if (!source) return fail("BAD_REQUEST", "This pack has no document or topic to chat about.");
  const messages = readMessages(body.messages);
  // The conversation must start and end with the student.
  while (messages.length && messages[0].role !== "user") messages.shift();
  if (!messages.length || messages[messages.length - 1].role !== "user") return fail("BAD_REQUEST", "Ask a question first.");

  try {
    const reply = await callModel({ ...creds, system: chatSystemPrompt(source), messages });
    return NextResponse.json({ ok: true, reply: reply.trim() });
  } catch (err) {
    return handleError(err);
  }
}
