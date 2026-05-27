import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { AdminKnowledgeBase } from "./knowledge-base";

export default async function AdminKnowledgePage() {
  const session = await auth();
  if (session?.user.role !== "admin") {
    notFound();
  }

  return <AdminKnowledgeBase />;
}
