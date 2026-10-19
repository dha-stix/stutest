import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site";
import { AppShell } from "@/components/app/AppShell";
import { CreateForm } from "@/components/create/CreateForm";

export const metadata: Metadata = pageMetadata("Create a test", "Turn a topic or your notes into a study pack.", { private: true });

export default function CreatePage() {
  return (
    <AppShell width="max-w-[1120px]">
      <CreateForm />
    </AppShell>
  );
}
