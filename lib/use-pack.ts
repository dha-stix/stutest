"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "./auth-context";
import { getPack } from "./firebase-actions";
import type { Pack } from "./types";

/** Loads the pack named in the URL for the signed-in user. */
export function usePack() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [pack, setPack] = useState<Pack | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "missing">("loading");

  useEffect(() => {
    if (!user) return;
    let active = true;
    getPack(id, user.uid)
      .then((p) => {
        if (!active) return;
        setPack(p);
        setStatus(p ? "ready" : "missing");
        if (p) document.title = `${p.title} · Stutest`;
      })
      .catch(() => active && setStatus("missing"));
    return () => {
      active = false;
    };
  }, [id, user]);

  return { packId: id, pack, status };
}
