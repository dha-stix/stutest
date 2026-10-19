"use client";

import { useEffect, useState } from "react";
import { useAuth } from "./auth-context";
import { listAttemptsForPacks, listPacks } from "./firebase-actions";
import type { Attempt, Pack } from "./types";

/** All of the signed-in user's packs plus their attempts. */
export function usePacks() {
  const { user } = useAuth();
  const [data, setData] = useState<{ packs: Pack[]; attempts: Attempt[] } | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!user) return;
    let active = true;
    (async () => {
      try {
        const packs = await listPacks(user.uid);
        const attempts = await listAttemptsForPacks(user.uid, packs);
        if (active) setData({ packs, attempts });
      } catch {
        if (active) setError(true);
      }
    })();
    return () => {
      active = false;
    };
  }, [user]);

  return { packs: data?.packs ?? [], attempts: data?.attempts ?? [], loading: !data && !error, error };
}
