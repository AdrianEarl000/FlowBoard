// src/app/dashboard/boards/new/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Loader2, Layers } from "lucide-react";
import { cn, BOARD_COLORS } from "@/lib/utils";

export default function NewBoardPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [coverColor, setCoverColor] = useState(BOARD_COLORS[0]);
  const [workspaceId, setWorkspaceId] = useState("");
  const [workspaces, setWorkspaces] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetch("/api/workspaces")
      .then((r) => r.json())
      .then((data) => {
        setWorkspaces(data);
        if (data.length > 0) setWorkspaceId(data[0].id);
      });
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !workspaceId) return;
    setIsLoading(true);

    const res = await fetch("/api/boards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description, coverColor, workspaceId }),
    });

    const board = await res.json();
    router.push(`/board/${board.id}`);
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <Link
        href="/dashboard"
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to dashboard
      </Link>

      <h1 className="text-2xl font-bold text-slate-900 mb-1">Create a board</h1>
      <p className="text-slate-500 text-sm mb-8">
        Boards are made up of lists and tasks. Use them to organize projects.
      </p>

      {/* Preview */}
      <div
        className="rounded-2xl p-6 mb-8 flex items-center gap-3"
        style={{ background: `${coverColor}20`, borderColor: `${coverColor}30`, border: "1px solid" }}
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: coverColor }}
        >
          <Layers className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="font-semibold text-slate-900">{name || "Board name"}</p>
          <p className="text-sm text-slate-500">{description || "Board description"}</p>
        </div>
      </div>

      <form onSubmit={handleCreate} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Board name *
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Product Roadmap Q4"
            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What is this board for?"
            rows={2}
            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Board color</label>
          <div className="flex gap-2 flex-wrap">
            {BOARD_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setCoverColor(color)}
                className={cn(
                  "w-8 h-8 rounded-lg transition-all",
                  coverColor === color && "ring-2 ring-offset-2 ring-slate-400 scale-110"
                )}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        {workspaces.length > 1 && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Workspace</label>
            <select
              value={workspaceId}
              onChange={(e) => setWorkspaceId(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
            >
              {workspaces.map((ws) => (
                <option key={ws.id} value={ws.id}>{ws.name}</option>
              ))}
            </select>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Link
            href="/dashboard"
            className="flex-1 px-4 py-3 text-sm text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-center"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={!name || isLoading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium text-sm transition-colors disabled:opacity-50"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            Create board
          </button>
        </div>
      </form>
    </div>
  );
}
