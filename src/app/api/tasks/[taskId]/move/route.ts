// src/app/api/tasks/[taskId]/move/route.ts
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: { taskId: string } }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { listId, position } = await req.json();

  const task = await prisma.task.findFirst({
    where: {
      id: params.taskId,
      list: {
        board: { workspace: { members: { some: { userId: session.user.id } } } },
      },
    },
  });

  if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const previousListId = task.listId;

  const updated = await prisma.task.update({
    where: { id: params.taskId },
    data: { listId, position },
  });

  // Log the move
  if (previousListId !== listId) {
    await prisma.taskActivity.create({
      data: {
        taskId: params.taskId,
        userId: session.user.id,
        action: "TASK_MOVED",
        metadata: { fromListId: previousListId, toListId: listId },
      },
    });
  }

  return NextResponse.json(updated);
}
