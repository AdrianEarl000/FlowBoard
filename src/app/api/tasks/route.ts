// src/app/api/tasks/route.ts
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { title, description, priority, dueDate, listId, position, labels } = body;

  // Verify access
  const list = await prisma.list.findFirst({
    where: {
      id: listId,
      board: { workspace: { members: { some: { userId: session.user.id } } } },
    },
  });

  if (!list) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const task = await prisma.task.create({
    data: {
      title,
      description,
      priority: priority ?? "MEDIUM",
      dueDate: dueDate ? new Date(dueDate) : null,
      labels: labels ?? [],
      position: position ?? 0,
      listId,
      createdById: session.user.id,
    },
    include: {
      assignments: { include: { user: true } },
      createdBy: true,
    },
  });

  // Log activity
  await prisma.taskActivity.create({
    data: {
      taskId: task.id,
      userId: session.user.id,
      action: "TASK_CREATED",
    },
  });

  return NextResponse.json(task, { status: 201 });
}
