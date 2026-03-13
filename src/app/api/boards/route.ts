// src/app/api/boards/route.ts
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, description, coverColor, workspaceId } = await req.json();

  // Verify workspace membership
  const member = await prisma.workspaceMember.findFirst({
    where: { workspaceId, userId: session.user.id },
  });
  if (!member) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const board = await prisma.board.create({
    data: {
      name,
      description,
      coverColor: coverColor ?? "#4F46E5",
      workspaceId,
      createdById: session.user.id,
      lists: {
        createMany: {
          data: [
            { title: "To Do", position: 0 },
            { title: "In Progress", position: 1 },
            { title: "Review", position: 2 },
            { title: "Done", position: 3 },
          ],
        },
      },
    },
    include: {
      lists: { orderBy: { position: "asc" } },
      createdBy: true,
    },
  });

  return NextResponse.json(board, { status: 201 });
}
