// src/app/api/workspaces/route.ts
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { generateSlug } from "@/lib/utils";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const workspaces = await prisma.workspace.findMany({
    where: { members: { some: { userId: session.user.id } } },
    include: { _count: { select: { boards: true, members: true } } },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(workspaces);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, description } = await req.json();

  const workspace = await prisma.workspace.create({
    data: {
      name,
      description,
      slug: generateSlug(name),
      members: {
        create: {
          userId: session.user.id,
          role: "ADMIN",
        },
      },
    },
    include: { members: { include: { user: true } } },
  });

  return NextResponse.json(workspace, { status: 201 });
}
