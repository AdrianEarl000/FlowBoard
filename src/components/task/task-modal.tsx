// src/components/task/task-modal.tsx
"use client";

import { useState } from "react";
import {
  X, Calendar, Flag, Tag, User2, Trash2, CheckCircle2, Clock,
  AlignLeft, Loader2,
} from "lucide-react";
import {
  TaskWithDetails,
  TaskPriority,
  TaskStatus,
  PRIORITY_CONFIG,
  STATUS_CONFIG,
  LABEL_COLORS,
} from "@/types";
import { cn, formatDate, getInitials } from "@/lib/utils";

interface TaskModalProps {
  task: TaskWithDetails;
  workspaceMembers: { user: { id: string; name: string | null; image: string | null } }[];
  onClose: () => void;
  onUpdated: (task: TaskWithDetails) => void;
  onDeleted: (taskId: string) => void;
}

export default function TaskModal({
  task,
  workspaceMembers,
  onClose,
  onUpdated,
  onDeleted,
}: TaskModalProps) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");
  const [priority, setPriority] = useState<TaskPriority>(task.priority);
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [dueDate, setDueDate] = useState(
    task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : ""
  );
  const [labels, setLabels] = useState<string[]>(task.labels);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleSave() {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          priority,
          status,
          dueDate: dueDate || null,
          labels,
        }),
      });
      const updated = await res.json();
      onUpdated({ ...task, ...updated });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this task? This action cannot be undone.")) return;
    setIsDeleting(true);
    await fetch(`/api/tasks/${task.id}`, { method: "DELETE" });
    onDeleted(task.id);
  }

  function toggleLabel(label: string) {
    setLabels((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  }

  const priorityConfig = PRIORITY_CONFIG[priority];
  const statusConfig = STATUS_CONFIG[status];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start gap-3 p-6 border-b border-slate-100">
          <div className="flex-1">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-xl font-semibold text-slate-900 w-full bg-transparent border-none outline-none focus:text-indigo-900 transition-colors"
            />
            <p className="text-xs text-slate-400 mt-1">
              Created by {task.createdBy.name} · {formatDate(task.createdAt)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 grid grid-cols-3 gap-6">
          {/* Main content */}
          <div className="col-span-2 space-y-5">
            {/* Description */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                <AlignLeft className="w-3.5 h-3.5" />
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a description..."
                rows={4}
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
              />
            </div>

            {/* Labels */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                <Tag className="w-3.5 h-3.5" />
                Labels
              </label>
              <div className="flex flex-wrap gap-1.5">
                {Object.keys(LABEL_COLORS).map((label) => (
                  <button
                    key={label}
                    onClick={() => toggleLabel(label)}
                    className={cn(
                      "px-2.5 py-1 rounded-full text-xs font-medium transition-all border",
                      labels.includes(label)
                        ? `${LABEL_COLORS[label]} border-transparent`
                        : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Assignees */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                <User2 className="w-3.5 h-3.5" />
                Assignees
              </label>
              <div className="flex flex-wrap gap-2">
                {workspaceMembers.map(({ user }) => {
                  const isAssigned = task.assignments.some(
                    (a) => a.user.id === user.id
                  );
                  return (
                    <button
                      key={user.id}
                      className={cn(
                        "flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs transition-all border",
                        isAssigned
                          ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                          : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                      )}
                    >
                      <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center text-white text-[9px] font-medium overflow-hidden">
                        {user.image ? (
                          <img src={user.image} alt="" className="w-full h-full object-cover" />
                        ) : (
                          getInitials(user.name ?? "?")
                        )}
                      </div>
                      {user.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Status */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
              >
                {Object.entries(STATUS_CONFIG).map(([value, cfg]) => (
                  <option key={value} value={value}>
                    {cfg.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                <Flag className="w-3.5 h-3.5" />
                Priority
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {(Object.keys(PRIORITY_CONFIG) as TaskPriority[]).map((p) => {
                  const cfg = PRIORITY_CONFIG[p];
                  return (
                    <button
                      key={p}
                      onClick={() => setPriority(p)}
                      className={cn(
                        "px-2 py-1.5 rounded-lg text-xs font-medium transition-all border",
                        priority === p
                          ? `${cfg.bg} ${cfg.color} border-transparent`
                          : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                      )}
                    >
                      {cfg.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Due date */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                <Clock className="w-3.5 h-3.5" />
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors"
          >
            {isDeleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            Delete task
          </button>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
            >
              {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Save changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
