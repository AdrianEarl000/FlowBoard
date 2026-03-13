// src/app/api/workspaces/[workspaceId]/boards/route.ts
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: { workspaceId: string } }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const member = await prisma.workspaceMember.findFirst({
    where: { workspaceId: params.workspaceId, userId: session.user.id },
  });

  if (!member) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const boards = await prisma.board.findMany({
    where: { workspaceId: params.workspaceId },
    orderBy: { updatedAt: "desc" },
    select: { id: true, name: true, coverColor: true, description: true, updatedAt: true },
  });

  return NextResponse.json(boards);
}
