import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { APP_DESCRIPTION, APP_NAME } from "@/lib/branding";

export const metadata: Metadata = {
  title: APP_NAME,
  description: APP_DESCRIPTION,
};

export default function Home() {
  redirect("/dashboard/samples");
}
