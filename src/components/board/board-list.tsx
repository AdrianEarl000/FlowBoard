// src/components/board/board-list.tsx
"use client";

import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { MoreHorizontal, Plus } from "lucide-react";
import SortableTaskCard from "./sortable-task-card";
import CreateTaskModal from "./create-task-modal";
import { ListWithTasks, TaskWithDetails } from "@/types";

const LIST_HEADER_COLORS: Record<string, string> = {
  "To Do": "bg-slate-400",
  "In Progress": "bg-blue-500",
  Review: "bg-purple-500",
  Done: "bg-green-500",
};

function getHeaderColor(title: string): string {
  return LIST_HEADER_COLORS[title] ?? "bg-indigo-500";
}

interface BoardListProps {
  list: ListWithTasks;
  workspaceMembers: { user: { id: string; name: string | null; image: string | null } }[];
  currentUserId: string;
  onTaskClick: (task: TaskWithDetails) => void;
  onTaskCreated: (task: TaskWithDetails, listId: string) => void;
}

export default function BoardList({
  list,
  workspaceMembers,
  currentUserId,
  onTaskClick,
  onTaskCreated,
}: BoardListProps) {
  const [showCreateTask, setShowCreateTask] = useState(false);

  const { setNodeRef, isOver } = useDroppable({ id: list.id });

  const dotColor = getHeaderColor(list.title);

  return (
    <div className="w-72 flex-shrink-0 flex flex-col max-h-full">
      {/* List header */}
      <div className="flex items-center gap-2.5 mb-3 px-1">
        <div className={`w-2.5 h-2.5 rounded-full ${dotColor} flex-shrink-0`} />
        <span className="font-semibold text-slate-700 text-sm flex-1">
          {list.title}
        </span>
        <span className="text-xs text-slate-400 bg-slate-100 rounded-full px-2 py-0.5">
          {list.tasks.length}
        </span>
        <button className="text-slate-400 hover:text-slate-600 p-0.5 rounded transition-colors">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Task list */}
      <div
        ref={setNodeRef}
        className={`flex-1 overflow-y-auto overflow-x-hidden space-y-2.5 p-2 rounded-2xl transition-colors min-h-[60px] ${
          isOver ? "bg-indigo-50/80 ring-2 ring-indigo-200" : "bg-slate-100/50"
        }`}
      >
        <SortableContext
          items={list.tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {list.tasks.map((task) => (
            <SortableTaskCard
              key={task.id}
              task={task}
              onClick={() => onTaskClick(task)}
            />
          ))}
        </SortableContext>

        {list.tasks.length === 0 && !isOver && (
          <div className="text-center py-6 text-xs text-slate-400">
            Drop tasks here
          </div>
        )}
      </div>

      {/* Add task button */}
      <button
        onClick={() => setShowCreateTask(true)}
        className="flex items-center gap-2 mt-2.5 px-3 py-2.5 text-sm text-slate-500 hover:text-slate-700 hover:bg-white rounded-xl transition-all group"
      >
        <Plus className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
        Add a task
      </button>

      {showCreateTask && (
        <CreateTaskModal
          listId={list.id}
          position={list.tasks.length}
          workspaceMembers={workspaceMembers}
          currentUserId={currentUserId}
          onClose={() => setShowCreateTask(false)}
          onCreated={(task) => {
            onTaskCreated(task, list.id);
            setShowCreateTask(false);
          }}
        />
      )}
    </div>
  );
}
