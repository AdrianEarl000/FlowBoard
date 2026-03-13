// src/components/board/task-card.tsx
"use client";

import { Calendar, AlertCircle } from "lucide-react";
import { TaskWithDetails, PRIORITY_CONFIG, LABEL_COLORS } from "@/types";
import { cn, formatDate, isOverdue, getInitials } from "@/lib/utils";

interface TaskCardProps {
  task: TaskWithDetails;
  onClick: () => void;
  isDragging?: boolean;
}

export default function TaskCard({ task, onClick, isDragging }: TaskCardProps) {
  const priority = PRIORITY_CONFIG[task.priority];
  const overdue = isOverdue(task.dueDate);

  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-white rounded-xl border border-slate-100 p-3.5 cursor-pointer group transition-all select-none",
        "hover:border-indigo-200 hover:shadow-md hover:shadow-indigo-50",
        isDragging && "opacity-40 scale-95"
      )}
    >
      {/* Labels */}
      {task.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2.5">
          {task.labels.slice(0, 3).map((label) => (
            <span
              key={label}
              className={cn(
                "px-2 py-0.5 rounded-full text-[10px] font-medium",
                LABEL_COLORS[label] ?? "bg-slate-100 text-slate-600"
              )}
            >
              {label}
            </span>
          ))}
        </div>
      )}

      {/* Title */}
      <p className="text-sm font-medium text-slate-800 leading-snug mb-3 group-hover:text-indigo-900 transition-colors">
        {task.title}
      </p>

      {/* Footer */}
      <div className="flex items-center gap-2">
        {/* Priority badge */}
        <span
          className={cn(
            "px-2 py-0.5 rounded-full text-[10px] font-medium",
            priority.bg,
            priority.color
          )}
        >
          {priority.label}
        </span>

        <div className="flex-1" />

        {/* Due date */}
        {task.dueDate && (
          <div
            className={cn(
              "flex items-center gap-1 text-[10px] font-medium",
              overdue ? "text-red-500" : "text-slate-400"
            )}
          >
            {overdue ? (
              <AlertCircle className="w-3 h-3" />
            ) : (
              <Calendar className="w-3 h-3" />
            )}
            {formatDate(task.dueDate)}
          </div>
        )}

        {/* Assignees */}
        {task.assignments.length > 0 && (
          <div className="flex -space-x-1">
            {task.assignments.slice(0, 2).map(({ user }) => (
              <div
                key={user.id}
                title={user.name ?? ""}
                className="w-5 h-5 rounded-full border border-white bg-indigo-500 text-white text-[9px] font-medium flex items-center justify-center overflow-hidden"
              >
                {user.image ? (
                  <img
                    src={user.image}
                    alt={user.name ?? ""}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  getInitials(user.name ?? "?")
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
