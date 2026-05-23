import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return Response.json({ user: null }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        username: true,
        displayName: true,
        email: true,
        role: true,
        department: true,
        avatarUrl: true,
      },
    });

    if (!user) {
      return Response.json({ error: "user_not_found" }, { status: 401 });
    }

    return Response.json({ user });
  } catch (error) {
    console.error("Auth me error:", error);
    return Response.json({ error: "internal_error" }, { status: 500 });
  }
}