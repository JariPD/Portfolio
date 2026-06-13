import type { Metadata } from "next";
import LoginForm from "@/components/LoginForm";

export const metadata: Metadata = {
  title: "Log in — Jari Dijk",
};

export default function LoginPage() {
  return <LoginForm />;
}
