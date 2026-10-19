"use client";

import { AppShell } from "@/components/app/AppShell";
import { PackGrid } from "@/components/packs/PackGrid";
import { PageLoader } from "@/components/ui/Spinner";
import { usePacks } from "@/lib/use-packs";

function AllPacks() {
  const { packs, loading } = usePacks();
  if (loading) return <PageLoader label="Loading your packs" />;
  return <PackGrid packs={packs} title={`All packs (${packs.length})`} />;
}

export default function PacksPage() {
  return (
    <AppShell>
      <AllPacks />
    </AppShell>
  );
}
