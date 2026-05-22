import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "未登录" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const keyword = searchParams.get("keyword");

  const whereClause: Prisma.UserWhereInput = {};
  if (keyword) {
    whereClause.OR = [
      { displayName: { contains: keyword } },
      { username: { contains: keyword } },
    ];
  }

  const users = await prisma.user.findMany({
    where: whereClause,
    select: {
      id: true,
      displayName: true,
      username: true,
      email: true,
      role: true,
      department: true,
      avatarUrl: true,
    },
    orderBy: { displayName: "asc" },
    take: 20,
  });

  return Response.json({ users });
}
