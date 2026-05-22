"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  return (
    <Button
      variant="outline"
      size="sm"
      type="button"
      onClick={() => void signOut({ callbackUrl: "/login" })}
    >
      退出
    </Button>
  );
}
