import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site";
import { AppShell } from "@/components/app/AppShell";
import { ApiKeyForm } from "@/components/settings/ApiKeyForm";

export const metadata: Metadata = pageMetadata("Connect your AI", "Connect your Claude, ChatGPT or Grok API key.", { private: true });

export default function ApiKeyPage() {
  return (
    <AppShell>
      <ApiKeyForm />
    </AppShell>
  );
}
