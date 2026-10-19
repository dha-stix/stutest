import type { Metadata } from "next";
import { LoginAside } from "@/components/auth/AuthAsides";
import { AuthPage } from "@/components/auth/AuthPage";

export const metadata: Metadata = { title: "Log in" };

export default function LoginPage() {
  return <AuthPage mode="login" aside={<LoginAside />} />;
}
