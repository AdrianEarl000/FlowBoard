// src/components/board/board-view.tsx
"use client";

import { useState, useCallback } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import { Plus, Settings, Users, ChevronLeft } from "lucide-react";
import Link from "next/link";
import BoardList from "./board-list";
import TaskCard from "./task-card";
import CreateListModal from "./create-list-modal";
import TaskModal from "../task/task-modal";
import { BoardWithLists, ListWithTasks, TaskWithDetails } from "@/types";

interface BoardViewProps {
  board: BoardWithLists & {
    workspace: {
      id: string;
      name: string;
      members: { user: { id: string; name: string | null; image: string | null } }[];
    };
  };
  currentUserId: string;
}

export default function BoardView({ board, currentUserId }: BoardViewProps) {
  const [lists, setLists] = useState<ListWithTasks[]>(board.lists);
  const [activeTask, setActiveTask] = useState<TaskWithDetails | null>(null);
  const [showCreateList, setShowCreateList] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskWithDetails | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  function findListByTaskId(taskId: string) {
    return lists.find((list) => list.tasks.some((t) => t.id === taskId));
  }

  function handleDragStart({ active }: DragStartEvent) {
    const sourceList = findListByTaskId(active.id as string);
    if (!sourceList) return;
    const task = sourceList.tasks.find((t) => t.id === active.id);
    if (task) setActiveTask(task);
  }

  function handleDragOver({ active, over }: DragOverEvent) {
    if (!over || active.id === over.id) return;

    const activeList = findListByTaskId(active.id as string);
    const overList =
      findListByTaskId(over.id as string) ??
      lists.find((l) => l.id === over.id);

    if (!activeList || !overList || activeList.id === overList.id) return;

    setLists((prev) => {
      const activeTask = activeList.tasks.find((t) => t.id === active.id)!;
      const overTaskIndex = overList.tasks.findIndex((t) => t.id === over.id);

      return prev.map((list) => {
        if (list.id === activeList.id) {
          return { ...list, tasks: list.tasks.filter((t) => t.id !== active.id) };
        }
        if (list.id === overList.id) {
          const newTasks = [...list.tasks];
          const insertAt = overTaskIndex >= 0 ? overTaskIndex : newTasks.length;
          newTasks.splice(insertAt, 0, activeTask);
          return { ...list, tasks: newTasks };
        }
        return list;
      });
    });
  }

  async function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveTask(null);
    if (!over) return;

    const targetList =
      findListByTaskId(over.id as string) ??
      lists.find((l) => l.id === over.id);

    if (!targetList) return;

    const newIndex = targetList.tasks.findIndex((t) => t.id === active.id);

    // Persist the move
    await fetch(`/api/tasks/${active.id}/move`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        listId: targetList.id,
        position: newIndex,
      }),
    });
  }

  function handleTaskCreated(task: TaskWithDetails, listId: string) {
    setLists((prev) =>
      prev.map((list) =>
        list.id === listId
          ? { ...list, tasks: [...list.tasks, task] }
          : list
      )
    );
  }

  function handleListCreated(list: ListWithTasks) {
    setLists((prev) => [...prev, list]);
  }

  function handleTaskUpdated(updated: TaskWithDetails) {
    setLists((prev) =>
      prev.map((list) => ({
        ...list,
        tasks: list.tasks.map((t) => (t.id === updated.id ? updated : t)),
      }))
    );
    setSelectedTask(updated);
  }

  function handleTaskDeleted(taskId: string) {
    setLists((prev) =>
      prev.map((list) => ({
        ...list,
        tasks: list.tasks.filter((t) => t.id !== taskId),
      }))
    );
    setSelectedTask(null);
  }

  return (
    <div
      className="flex flex-col h-screen"
      style={{ background: `${board.coverColor}15` }}
    >
      {/* Board header */}
      <div className="flex items-center gap-4 px-6 py-4 bg-white/80 backdrop-blur border-b border-slate-100">
        <Link
          href="/dashboard"
          className="text-slate-400 hover:text-slate-600 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>

        <div
          className="w-6 h-6 rounded"
          style={{ backgroundColor: board.coverColor }}
        />
        <h1 className="font-semibold text-slate-900 text-lg">{board.name}</h1>
        {board.description && (
          <span className="text-slate-400 text-sm hidden md:block">
            · {board.description}
          </span>
        )}

        <div className="ml-auto flex items-center gap-2">
          {/* Member avatars */}
          <div className="flex -space-x-1.5">
            {board.workspace.members.slice(0, 4).map(({ user }) => (
              <div
                key={user.id}
                className="w-7 h-7 rounded-full border-2 border-white bg-indigo-500 flex items-center justify-center text-xs text-white font-medium overflow-hidden"
                title={user.name ?? ""}
              >
                {user.image ? (
                  <img src={user.image} alt={user.name ?? ""} className="w-full h-full object-cover" />
                ) : (
                  (user.name?.[0] ?? "?").toUpperCase()
                )}
              </div>
            ))}
          </div>

          <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Invite</span>
          </button>

          <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Board columns */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="flex gap-4 p-6 h-full min-w-max">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={lists.map((l) => l.id)}
              strategy={horizontalListSortingStrategy}
            >
              {lists.map((list) => (
                <BoardList
                  key={list.id}
                  list={list}
                  workspaceMembers={board.workspace.members}
                  currentUserId={currentUserId}
                  onTaskClick={setSelectedTask}
                  onTaskCreated={handleTaskCreated}
                />
              ))}
            </SortableContext>

            <DragOverlay>
              {activeTask && (
                <div className="rotate-2 shadow-2xl">
                  <TaskCard
                    task={activeTask}
                    onClick={() => {}}
                    isDragging
                  />
                </div>
              )}
            </DragOverlay>
          </DndContext>

          {/* Add list */}
          <div className="w-72 flex-shrink-0">
            <button
              onClick={() => setShowCreateList(true)}
              className="w-full flex items-center gap-2 px-4 py-3 bg-white/60 hover:bg-white/80 border border-dashed border-slate-200 hover:border-slate-300 rounded-2xl text-sm text-slate-500 hover:text-slate-700 transition-all"
            >
              <Plus className="w-4 h-4" />
              Add another list
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showCreateList && (
        <CreateListModal
          boardId={board.id}
          currentPosition={lists.length}
          onClose={() => setShowCreateList(false)}
          onCreated={handleListCreated}
        />
      )}

      {selectedTask && (
        <TaskModal
          task={selectedTask}
          workspaceMembers={board.workspace.members}
          onClose={() => setSelectedTask(null)}
          onUpdated={handleTaskUpdated}
          onDeleted={handleTaskDeleted}
        />
      )}
    </div>
  );
}
