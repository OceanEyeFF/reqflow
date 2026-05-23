import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      username: string;
      role: string;
      department: string | null;
      avatarUrl: string | null;
    };
  }

  interface User {
    username: string;
    role: string;
    department: string | null;
    avatarUrl: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    username: string;
    role: string;
    department: string | null;
    avatarUrl: string | null;
  }
}