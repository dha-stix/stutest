import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site";
import { LoginAside } from "@/components/auth/AuthAsides";
import { AuthPage } from "@/components/auth/AuthPage";

export const metadata: Metadata = pageMetadata("Log in", "Log in to Stutest with Google to pick up your study packs, scores and chats.", { path: "/auth/login" });

export default function LoginPage() {
  return <AuthPage mode="login" aside={<LoginAside />} />;
}
