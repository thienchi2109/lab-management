import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Lab Kit Management",
  description: "Laboratory kit, sample, and result management dashboard.",
};

export default function Home() {
  redirect("/dashboard");
}
