// src/app/api/tasks/[taskId]/route.ts
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

async function getTaskWithAccess(taskId: string, userId: string) {
  return prisma.task.findFirst({
    where: {
      id: taskId,
      list: {
        board: { workspace: { members: { some: { userId } } } },
      },
    },
  });
}

export async function PATCH(
  req: Request,
  { params }: { params: { taskId: string } }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const task = await getTaskWithAccess(params.taskId, session.user.id);
  if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const { title, description, priority, status, dueDate, labels } = body;

  const updated = await prisma.task.update({
    where: { id: params.taskId },
    data: {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(priority !== undefined && { priority }),
      ...(status !== undefined && { status }),
      ...(labels !== undefined && { labels }),
      ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
    },
    include: {
      assignments: { include: { user: true } },
      createdBy: true,
    },
  });

  // Log relevant activities
  if (status && status !== task.status) {
    await prisma.taskActivity.create({
      data: {
        taskId: params.taskId,
        userId: session.user.id,
        action: status === "DONE" ? "TASK_COMPLETED" : "TASK_UPDATED",
        metadata: { from: task.status, to: status },
      },
    });
  }

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  { params }: { params: { taskId: string } }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const task = await getTaskWithAccess(params.taskId, session.user.id);
  if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.task.delete({ where: { id: params.taskId } });
  return NextResponse.json({ success: true });
}
