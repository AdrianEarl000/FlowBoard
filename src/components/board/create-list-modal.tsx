// src/components/board/create-list-modal.tsx
"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { ListWithTasks } from "@/types";

const DEFAULT_LISTS = ["To Do", "In Progress", "Review", "Done"];

interface CreateListModalProps {
  boardId: string;
  currentPosition: number;
  onClose: () => void;
  onCreated: (list: ListWithTasks) => void;
}

export default function CreateListModal({
  boardId,
  currentPosition,
  onClose,
  onCreated,
}: CreateListModalProps) {
  const [title, setTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setIsLoading(true);

    const res = await fetch("/api/lists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.trim(), boardId, position: currentPosition }),
    });

    const list = await res.json();
    onCreated({ ...list, tasks: [] });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900">Add List</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">List name</label>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. In Progress"
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
            />
          </div>

          <div>
            <p className="text-xs text-slate-400 mb-2">Quick pick:</p>
            <div className="flex flex-wrap gap-1.5">
              {DEFAULT_LISTS.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setTitle(name)}
                  className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors"
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 text-sm text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50">
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim() || isLoading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium disabled:opacity-50"
            >
              {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Create list
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
