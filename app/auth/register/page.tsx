import type { Metadata } from "next";
import { RegisterAside } from "@/components/auth/AuthAsides";
import { AuthPage } from "@/components/auth/AuthPage";

export const metadata: Metadata = { title: "Sign up" };

export default function RegisterPage() {
  return <AuthPage mode="register" aside={<RegisterAside />} />;
}
