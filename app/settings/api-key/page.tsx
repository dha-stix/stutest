import type { Metadata } from "next";
import { AppShell } from "@/components/app/AppShell";
import { ApiKeyForm } from "@/components/settings/ApiKeyForm";

export const metadata: Metadata = { title: "Connect your AI" };

export default function ApiKeyPage() {
  return (
    <AppShell>
      <ApiKeyForm />
    </AppShell>
  );
}
