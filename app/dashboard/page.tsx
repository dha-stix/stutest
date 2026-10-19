import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site";
import { AppShell } from "@/components/app/AppShell";
import { Dashboard } from "@/components/dashboard/Dashboard";

export const metadata: Metadata = pageMetadata("Dashboard", "Your study packs, scores and streak.", { private: true });

export default function DashboardPage() {
  return (
    <AppShell>
      <Dashboard />
    </AppShell>
  );
}
