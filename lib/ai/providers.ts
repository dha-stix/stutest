import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import type { ApiErrorCode, ChatMessage, Provider } from "../types";

/*
 * Server-side calls to the user's own AI provider. Keys arrive with each request
 * from the signed-in user's settings and are never stored or logged here.
 */

const CLAUDE_MODEL = process.env.CLAUDE_MODEL ?? "claude-opus-5-5";
const OPENAI_MODEL = process.env.OPENAI_MODEL ?? "gpt-5";
const GROK_MODEL = process.env.GROK_MODEL ?? "grok-4";
const XAI_BASE_URL = "https://api.x.ai/v1";

export class ProviderError extends Error {
  constructor(
    public code: ApiErrorCode,
    message: string,
  ) {
    super(message);
  }
}

interface CallOptions {
  provider: Provider;
  apiKey: string;
  system: string;
  messages: ChatMessage[];
  /** JSON schema the reply must follow (structured outputs). Omit for free text. */
  schema?: { name: string; schema: Record<string, unknown> };
}

const openAiClient = (provider: Provider, apiKey: string) =>
  new OpenAI({ apiKey, maxRetries: 1, ...(provider === "grok" ? { baseURL: XAI_BASE_URL } : {}) });

/** Maps SDK errors to the small set of codes the UI knows how to explain. */
function toProviderError(err: unknown): ProviderError {
  if (err instanceof ProviderError) return err;
  const status = err instanceof Anthropic.APIError || err instanceof OpenAI.APIError ? err.status : undefined;
  if (status === 401 || status === 403) {
    return new ProviderError("INVALID_KEY", "Your API key was rejected. Check it in Settings or connect another provider.");
  }
  if (status === 429) {
    return new ProviderError("RATE_LIMITED", "Your AI provider is rate-limiting this key or it is out of credit. Try again shortly.");
  }
  if (status === 400) {
    return new ProviderError("PROVIDER_ERROR", "Your AI provider couldn't process this request. Try a shorter document or fewer questions.");
  }
  return new ProviderError("PROVIDER_ERROR", "Couldn't reach your AI provider. Please try again.");
}

async function callClaude({ apiKey, system, messages, schema }: CallOptions): Promise<string> {
  const client = new Anthropic({ apiKey, maxRetries: 1 });
  const stream = client.beta.messages.stream({
    model: CLAUDE_MODEL,
    max_tokens: 64000,
    system,
    messages,
    output_config: {
      effort: "medium",
      ...(schema ? { format: { type: "json_schema" as const, schema: schema.schema } } : {}),
    },
    // If a safety classifier declines, the API retries on a suitable fallback model.
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
  });
  const message = await stream.finalMessage();
  if (message.stop_reason === "refusal") {
    throw new ProviderError("BAD_OUTPUT", "The AI declined to answer this request. Try rephrasing your topic.");
  }
  if (message.stop_reason === "max_tokens") {
    throw new ProviderError("BAD_OUTPUT", "The answer was too long and got cut off. Try fewer questions per pack.");
  }
  return message.content.map((block) => (block.type === "text" ? block.text : "")).join("");
}

async function callOpenAiCompatible({ provider, apiKey, system, messages, schema }: CallOptions): Promise<string> {
  const client = openAiClient(provider, apiKey);
  const request = (responseFormat?: OpenAI.ChatCompletionCreateParams["response_format"]) =>
    client.chat.completions.create({
      model: provider === "grok" ? GROK_MODEL : OPENAI_MODEL,
      max_completion_tokens: 32000,
      messages: [{ role: "system", content: system }, ...messages],
      ...(responseFormat ? { response_format: responseFormat } : {}),
    });

  let completion;
  if (!schema) {
    completion = await request();
  } else {
    try {
      completion = await request({ type: "json_schema", json_schema: { name: schema.name, schema: schema.schema, strict: true } });
    } catch (err) {
      // Some models don't support strict schemas; fall back to plain JSON mode.
      if (!(err instanceof OpenAI.APIError && err.status === 400)) throw err;
      completion = await request({ type: "json_object" });
    }
  }
  const choice = completion.choices[0];
  if (choice?.finish_reason === "length") {
    throw new ProviderError("BAD_OUTPUT", "The answer was too long and got cut off. Try fewer questions per pack.");
  }
  return choice?.message?.content ?? "";
}

export async function callModel(options: CallOptions): Promise<string> {
  try {
    const text = options.provider === "claude" ? await callClaude(options) : await callOpenAiCompatible(options);
    if (!text.trim()) throw new ProviderError("BAD_OUTPUT", "The AI returned an empty answer. Please try again.");
    return text;
  } catch (err) {
    throw toProviderError(err);
  }
}

/** Cheap authenticated call used to check a key before saving it. */
export async function verifyKey(provider: Provider, apiKey: string): Promise<void> {
  try {
    if (provider === "claude") {
      await new Anthropic({ apiKey, maxRetries: 0 }).models.list({ limit: 1 });
    } else {
      await openAiClient(provider, apiKey).models.list();
    }
  } catch (err) {
    throw toProviderError(err);
  }
}
