import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site";
import { RegisterAside } from "@/components/auth/AuthAsides";
import { AuthPage } from "@/components/auth/AuthPage";

export const metadata: Metadata = pageMetadata("Sign up", "Create a free Stutest account with Google and turn any topic or document into practice tests in minutes.", { path: "/auth/register" });

export default function RegisterPage() {
  return <AuthPage mode="register" aside={<RegisterAside />} />;
}
