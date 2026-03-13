// src/app/api/lists/route.ts
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, boardId, position } = await req.json();

  const board = await prisma.board.findFirst({
    where: {
      id: boardId,
      workspace: { members: { some: { userId: session.user.id } } },
    },
  });

  if (!board) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const list = await prisma.list.create({
    data: { title, boardId, position },
  });

  return NextResponse.json(list, { status: 201 });
}
