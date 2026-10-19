"use client";

import clsx from "clsx";
import { Eye, EyeOff, Lock } from "lucide-react";
import { useState } from "react";
import { ApiClientError, verifyApiKey } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { PROVIDERS, providerInfo } from "@/lib/constants";
import { removeUserSettings, saveUserSettings } from "@/lib/firebase-actions";
import type { Provider } from "@/lib/types";
import { CheckBadge, LockIcon } from "../svg/AnimatedIcons";
import { Button, ButtonLink } from "../ui/Button";
import { Notice } from "../ui/Notice";

type Status =
  | { state: "idle" }
  | { state: "checking" }
  | { state: "valid" }
  | { state: "invalid"; message: string }
  | { state: "saveFailed"; message: string };

export function ApiKeyForm() {
  const { user, settings, setSettings } = useAuth();
  const [provider, setProvider] = useState<Provider>(settings?.provider ?? "claude");
  const [key, setKey] = useState("");
  const [show, setShow] = useState(false);
  const [status, setStatus] = useState<Status>({ state: "idle" });
  const info = providerInfo(provider);
  const isOnboarding = !settings;

  async function verifyAndSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    const apiKey = key.trim();
    if (!apiKey) return setStatus({ state: "invalid", message: `Paste your ${info.name} API key first.` });

    setStatus({ state: "checking" });
    try {
      await verifyApiKey({ provider, apiKey });
    } catch (err) {
      const message =
        err instanceof ApiClientError && err.code !== "INVALID_KEY"
          ? err.message
          : `${info.name} rejected this key — it may be mistyped, expired or out of credit. Check the key, or connect a different provider.`;
      setStatus({ state: "invalid", message });
      return;
    }
    // The key works; saving it is a separate step with its own error message.
    try {
      setSettings(await saveUserSettings(user.uid, { provider, apiKey }));
      setKey("");
      setStatus({ state: "valid" });
    } catch {
      setStatus({ state: "saveFailed", message: "Your key works, but we couldn't save it. Check your connection and try again." });
    }
  }

  async function removeKey() {
    if (!user) return;
    try {
      await removeUserSettings(user.uid);
      setSettings(null);
      setStatus({ state: "idle" });
    } catch {
      setStatus({ state: "saveFailed", message: "We couldn't remove your key. Check your connection and try again." });
    }
  }

  return (
    <div className="mx-auto max-w-[760px]">
      {isOnboarding && (
        <div className="flex items-center gap-2.5 text-sm font-semibold text-muted">
          <span className="flex size-6 items-center justify-center rounded-full bg-brand text-xs text-white">1</span>Connect AI
          <span className="h-0.5 w-8 bg-line-strong" />
          <span className="flex size-6 items-center justify-center rounded-full bg-line text-xs">2</span>Create your first test
        </div>
      )}
      <div className="mb-2 mt-5 flex items-center gap-4">
        <LockIcon />
        <h1 className="font-display text-[clamp(30px,3.6vw,44px)] font-extrabold tracking-[-0.03em]">Connect your AI</h1>
      </div>
      <p className="max-w-[560px] leading-relaxed text-muted">Stutest uses your own key to write your tests. It&apos;s only used for your requests.</p>

      {settings && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-white p-4">
          <div>
            <div className="text-sm text-muted">Current key</div>
            <div className="font-semibold">
              {providerInfo(settings.provider).name} · <span className="font-mono text-sm">••••••••{settings.keyLast4}</span>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={removeKey}>
            Remove key
          </Button>
        </div>
      )}

      <form onSubmit={verifyAndSave}>
        <fieldset className="mt-8">
          <legend className="mb-3 font-bold">{settings ? "Replace with a new key" : "Choose a provider"}</legend>
          <div role="radiogroup" className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,190px),1fr))] gap-3">
            {PROVIDERS.map((p) => {
              const active = p.id === provider;
              return (
                <button
                  key={p.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => {
                    setProvider(p.id);
                    setStatus({ state: "idle" });
                  }}
                  className={clsx(
                    "flex min-h-24 flex-col items-start gap-1 rounded-[18px] border-2 p-5 text-left transition duration-300",
                    active ? "-translate-y-0.5 border-brand bg-brand text-white shadow-[0_16px_32px_-18px_rgba(79,60,240,.8)]" : "border-line bg-white hover:border-brand-line",
                  )}
                >
                  <span className="font-display text-[22px] font-bold">{p.name}</span>
                  <span className="text-[13px] opacity-80">{p.maker}</span>
                </button>
              );
            })}
          </div>
        </fieldset>

        <label htmlFor="api-key" className="mb-2.5 mt-7 block font-bold">
          {info.name} API key
        </label>
        <div className="flex flex-wrap gap-2.5">
          <div className="relative min-w-0 flex-[1_1_320px]">
            <input
              id="api-key"
              type={show ? "text" : "password"}
              autoComplete="off"
              spellCheck={false}
              placeholder={`${info.keyPrefix}…`}
              value={key}
              onChange={(e) => {
                setKey(e.target.value);
                if (status.state !== "checking") setStatus({ state: "idle" });
              }}
              className="min-h-[54px] w-full rounded-[14px] border border-line-strong bg-white py-4 pl-4 pr-14 font-mono text-[15px]"
            />
            <button
              type="button"
              onClick={() => setShow(!show)}
              aria-label={show ? "Hide key" : "Show key"}
              className="absolute right-1.5 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-xl text-muted hover:text-ink"
            >
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <Button type="submit" size="lg" loading={status.state === "checking"} className="min-h-[54px]">
            Verify &amp; save
          </Button>
        </div>
        <p className="mt-2.5 text-[13px] text-muted">
          Get a key at{" "}
          <a href={info.consoleUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand underline-offset-2 hover:underline">
            {new URL(info.consoleUrl).hostname}
          </a>
          .
        </p>
      </form>

      {status.state === "saveFailed" && (
        <Notice tone="error" className="mt-7">
          {status.message}
        </Notice>
      )}

      {status.state === "valid" && (
        <div className="st-pop mt-7 flex flex-wrap items-center justify-between gap-4 rounded-[20px] border border-[#a7dec4] bg-success-soft p-6" role="status">
          <div className="flex items-center gap-3.5">
            <CheckBadge />
            <div>
              <div className="font-bold">Key verified</div>
              <div className="text-sm text-[#2f5e49]">{info.name} is connected. You&apos;re ready to generate.</div>
            </div>
          </div>
          <ButtonLink href="/create">Create a test →</ButtonLink>
        </div>
      )}

      {status.state === "invalid" && (
        <div className="st-pop mt-7 flex flex-col gap-4 rounded-3xl bg-ink p-7 text-paper" role="alert">
          <div className="flex items-start gap-3.5">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-danger font-extrabold text-white">!</span>
            <div>
              <div className="text-lg font-bold">This key didn&apos;t work</div>
              <div className="mt-1 leading-normal text-soft">{status.message}</div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2.5 sm:pl-[54px]">
            <a
              href={info.consoleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center rounded-[14px] bg-lime px-5 font-bold text-ink"
            >
              How to get a key
            </a>
            <Button
              variant="outlineDark"
              size="sm"
              onClick={() => {
                setKey("");
                setStatus({ state: "idle" });
              }}
            >
              Try another key
            </Button>
          </div>
        </div>
      )}

      <div className="mt-10 flex gap-3 rounded-2xl border border-line bg-white px-[18px] py-4 text-sm leading-normal text-muted">
        <Lock size={20} className="shrink-0 text-brand" />
        Your key is saved to your account (readable only by you) and sent to your AI provider only when you generate or chat. Remove it here at any time.
      </div>
    </div>
  );
}
