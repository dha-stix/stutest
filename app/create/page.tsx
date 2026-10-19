import type { Metadata } from "next";
import { AppShell } from "@/components/app/AppShell";
import { CreateForm } from "@/components/create/CreateForm";

export const metadata: Metadata = { title: "Create a test" };

export default function CreatePage() {
  return (
    <AppShell width="max-w-[1120px]">
      <CreateForm />
    </AppShell>
  );
}
