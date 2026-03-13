// src/app/dashboard/page.tsx
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate, isOverdue } from "@/lib/utils";
import { PRIORITY_CONFIG } from "@/types";
import Link from "next/link";
import {
  Layers,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowRight,
} from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user!.id!;

  const [assignedTasks, recentBoards, workspaces] = await Promise.all([
    prisma.task.findMany({
      where: {
        assignments: { some: { userId } },
        status: { not: "DONE" },
      },
      include: {
        assignments: { include: { user: true } },
        createdBy: true,
        list: { include: { board: true } },
      },
      orderBy: { dueDate: "asc" },
      take: 8,
    }),
    prisma.board.findMany({
      where: {
        workspace: { members: { some: { userId } } },
      },
      include: {
        lists: {
          include: { _count: { select: { tasks: true } } },
        },
      },
      orderBy: { updatedAt: "desc" },
      take: 6,
    }),
    prisma.workspace.findMany({
      where: { members: { some: { userId } } },
      take: 1,
    }),
  ]);

  const overdueTasks = assignedTasks.filter((t) => isOverdue(t.dueDate));
  const upcomingTasks = assignedTasks.filter(
    (t) => t.dueDate && !isOverdue(t.dueDate)
  );

  const firstName = session?.user?.name?.split(" ")[0] ?? "there";

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Good morning, {firstName} 👋
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Here's what needs your attention today
          </p>
        </div>
        <Link
          href="/dashboard/boards/new"
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Board
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          {
            label: "Assigned to me",
            value: assignedTasks.length,
            icon: Layers,
            color: "text-indigo-600",
            bg: "bg-indigo-50",
          },
          {
            label: "Overdue",
            value: overdueTasks.length,
            icon: AlertCircle,
            color: "text-red-600",
            bg: "bg-red-50",
          },
          {
            label: "Due this week",
            value: upcomingTasks.length,
            icon: Clock,
            color: "text-orange-600",
            bg: "bg-orange-50",
          },
          {
            label: "Active boards",
            value: recentBoards.length,
            icon: CheckCircle2,
            color: "text-green-600",
            bg: "bg-green-50",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm"
          >
            <div
              className={`w-9 h-9 ${stat.bg} rounded-xl flex items-center justify-center mb-3`}
            >
              <stat.icon className={`w-4.5 h-4.5 ${stat.color}`} />
            </div>
            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* My Tasks */}
        <div className="col-span-2">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between p-5 border-b border-slate-50">
              <h2 className="font-semibold text-slate-900">My Tasks</h2>
              <Link
                href="/dashboard/tasks"
                className="text-xs text-indigo-600 hover:underline flex items-center gap-1"
              >
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="divide-y divide-slate-50">
              {assignedTasks.length === 0 ? (
                <div className="p-10 text-center text-slate-400">
                  <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-slate-200" />
                  <p className="text-sm">All caught up! No tasks assigned.</p>
                </div>
              ) : (
                assignedTasks.map((task) => {
                  const priority = PRIORITY_CONFIG[task.priority];
                  const overdue = isOverdue(task.dueDate);
                  return (
                    <div
                      key={task.id}
                      className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">
                          {task.title}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {(task as any).list?.board?.name}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${priority.bg} ${priority.color}`}
                      >
                        {priority.label}
                      </span>
                      {task.dueDate && (
                        <span
                          className={`text-xs ${
                            overdue
                              ? "text-red-500 font-medium"
                              : "text-slate-400"
                          }`}
                        >
                          {overdue ? "Overdue · " : ""}
                          {formatDate(task.dueDate)}
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Recent Boards */}
        <div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between p-5 border-b border-slate-50">
              <h2 className="font-semibold text-slate-900">Recent Boards</h2>
              <Link
                href="/dashboard/boards"
                className="text-xs text-indigo-600 hover:underline flex items-center gap-1"
              >
                All <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="p-3 space-y-2">
              {recentBoards.length === 0 ? (
                <div className="p-6 text-center text-slate-400">
                  <p className="text-sm">No boards yet.</p>
                  <Link
                    href="/dashboard/boards/new"
                    className="text-xs text-indigo-600 hover:underline mt-1 block"
                  >
                    Create your first board
                  </Link>
                </div>
              ) : (
                recentBoards.map((board) => {
                  const taskCount = board.lists.reduce(
                    (sum, l) => sum + l._count.tasks,
                    0
                  );
                  return (
                    <Link
                      key={board.id}
                      href={`/board/${board.id}`}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group"
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex-shrink-0"
                        style={{ backgroundColor: board.coverColor }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">
                          {board.name}
                        </p>
                        <p className="text-xs text-slate-400">
                          {taskCount} task{taskCount !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 transition-colors" />
                    </Link>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
