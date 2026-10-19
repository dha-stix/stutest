"use client";

import { Download } from "lucide-react";
import { useState } from "react";
import { downloadPack } from "@/lib/download";
import type { GeneratedMode, Pack } from "@/lib/types";
import { Button } from "../ui/Button";

export function DownloadButton({ pack, mode, label = "Download Q&A (PDF)", size = "md" }: { pack: Pack; mode?: GeneratedMode; label?: string; size?: "sm" | "md" }) {
  const [busy, setBusy] = useState(false);
  return (
    <Button
      variant="outline"
      size={size}
      loading={busy}
      onClick={async () => {
        setBusy(true);
        try {
          await downloadPack(pack, mode);
        } finally {
          setBusy(false);
        }
      }}
    >
      {!busy && <Download size={18} />}
      {label}
    </Button>
  );
}
