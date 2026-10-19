"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { isFirebaseConfigured } from "@/lib/firebase";
import { getUserSettings, signInWithGoogle } from "@/lib/firebase-actions";
import { Button } from "../ui/Button";
import { GoogleIcon } from "../ui/GoogleIcon";
import { Notice } from "../ui/Notice";

/** Turns Firebase Auth error codes into something a student (or the site owner) can act on. */
function signInError(code: string): string | null {
  if (code.includes("popup-closed") || code.includes("cancelled-popup")) return null;
  if (code.includes("popup-blocked")) return "Your browser blocked the Google sign-in window. Allow pop-ups for this site and try again.";
  if (code.includes("unauthorized-domain")) return "This domain isn't authorised for sign-in. Add it in Firebase console → Authentication → Settings → Authorized domains.";
  if (code.includes("operation-not-allowed")) return "Google sign-in isn't enabled. Turn it on in Firebase console → Authentication → Sign-in method.";
  if (code.includes("network-request-failed")) return "Network error. Check your connection and try again.";
  return "Google sign-in didn't complete. Please try again.";
}

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
      const message = signInError((err as { code?: string }).code ?? "");
      if (message) setError(message);
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Button variant={variant} size="lg" className="w-full" onClick={handleClick} loading={busy} disabled={!isFirebaseConfigured}>
        {!busy && <GoogleIcon />}
        {label}
      </Button>
      {error && <Notice tone="error">{error}</Notice>}
      {!isFirebaseConfigured && (
        <Notice tone="warn">
          Sign-in isn&apos;t set up yet: add your Firebase web config to <code>.env.local</code> (see README) and restart the dev server.
        </Notice>
      )}
    </div>
  );
}
