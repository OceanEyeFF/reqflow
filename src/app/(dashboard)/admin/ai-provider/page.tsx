import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { AdminAiProviderForm } from "./provider-config-form";

export default async function AdminAiProviderPage() {
  const session = await auth();
  if (session?.user.role !== "admin") {
    notFound();
  }

  return <AdminAiProviderForm />;
}
