// src/app/board/[boardId]/page.tsx
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import BoardView from "@/components/board/board-view";

export default async function BoardPage({
  params,
}: {
  params: { boardId: string };
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  const board = await prisma.board.findFirst({
    where: {
      id: params.boardId,
      workspace: { members: { some: { userId: session.user.id } } },
    },
    include: {
      lists: {
        orderBy: { position: "asc" },
        include: {
          tasks: {
            orderBy: { position: "asc" },
            include: {
              assignments: { include: { user: true } },
              createdBy: true,
            },
          },
        },
      },
      createdBy: true,
      workspace: {
        include: {
          members: { include: { user: true } },
        },
      },
    },
  });

  if (!board) notFound();

  return <BoardView board={board as any} currentUserId={session.user.id} />;
}
