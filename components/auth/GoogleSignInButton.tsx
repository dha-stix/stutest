"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { getUserSettings, isDemoMode, signInWithGoogle } from "@/lib/firebase-actions";
import { Button } from "../ui/Button";
import { GoogleIcon } from "../ui/GoogleIcon";
import { Notice } from "../ui/Notice";

/** New users go to set up their AI key first; returning users go to the dashboard. */
async function destinationFor(uid: string) {
  const settings = await getUserSettings(uid).catch(() => null);
  return settings ? "/dashboard" : "/settings/api-key";
}

export function GoogleSignInButton({ label, variant }: { label: string; variant: "ink" | "outline" }) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // Already signed in: skip the auth page.
  useEffect(() => {
    if (!loading && user && !busy) destinationFor(user.uid).then((path) => router.replace(path));
  }, [loading, user, busy, router]);

  async function handleClick() {
    setBusy(true);
    setError("");
    try {
      const signedIn = await signInWithGoogle();
      router.replace(await destinationFor(signedIn.uid));
    } catch (err) {
      const code = (err as { code?: string }).code ?? "";
      if (!code.includes("popup-closed") && !code.includes("cancelled-popup")) {
        setError("Google sign-in didn't complete. Please try again.");
      }
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Button variant={variant} size="lg" className="w-full" onClick={handleClick} loading={busy}>
        {!busy && <GoogleIcon />}
        {label}
      </Button>
      {error && <Notice tone="error">{error}</Notice>}
      {isDemoMode && (
        <Notice tone="info">
          Demo mode: Firebase isn&apos;t configured yet, so you&apos;ll sign in as a demo student and data stays in this browser.
        </Notice>
      )}
    </div>
  );
}
