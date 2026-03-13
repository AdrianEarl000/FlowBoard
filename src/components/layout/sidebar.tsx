// src/components/layout/sidebar.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Layers, LayoutDashboard, CheckSquare, Users, Settings,
  LogOut, Plus, ChevronDown, Loader2,
} from "lucide-react";
import { cn, getInitials } from "@/lib/utils";

interface SidebarProps {
  user: {
    id?: string | null;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

interface Workspace {
  id: string;
  name: string;
  slug: string;
  _count?: { boards: number };
}

interface Board {
  id: string;
  name: string;
  coverColor: string;
}

const NAV_ITEMS = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/tasks", icon: CheckSquare, label: "My Tasks" },
  { href: "/dashboard/team", icon: Users, label: "Team" },
  { href: "/dashboard/settings", icon: Settings, label: "Settings" },
];

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [boards, setBoards] = useState<Board[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false);

  useEffect(() => {
    async function loadWorkspaces() {
      try {
        const res = await fetch("/api/workspaces");
        const data = await res.json();
        setWorkspaces(data);
        if (data.length > 0) {
          setActiveWorkspace(data[0]);
          loadBoards(data[0].id);
        }
      } finally {
        setIsLoading(false);
      }
    }
    loadWorkspaces();
  }, []);

  async function loadBoards(workspaceId: string) {
    const res = await fetch(`/api/workspaces/${workspaceId}/boards`);
    const data = await res.json();
    setBoards(data);
  }

  return (
    <aside className="w-60 bg-[#1E293B] flex flex-col flex-shrink-0 h-full">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 pt-5 pb-4">
        <div className="w-7 h-7 bg-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0">
          <Layers className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="text-white font-semibold text-base tracking-tight">FlowBoard</span>
      </div>

      {/* Workspace switcher */}
      <div className="px-3 mb-4">
        <button
          onClick={() => setShowWorkspaceMenu(!showWorkspaceMenu)}
          className="w-full flex items-center gap-2 px-2 py-2 rounded-xl hover:bg-white/5 transition-colors text-left"
        >
          {activeWorkspace ? (
            <>
              <div className="w-6 h-6 rounded-md bg-indigo-500 flex items-center justify-center text-xs text-white font-semibold flex-shrink-0">
                {activeWorkspace.name[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-slate-200 text-xs font-medium truncate">
                  {activeWorkspace.name}
                </p>
                <p className="text-slate-500 text-[10px]">Workspace</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </>
          ) : (
            <span className="text-slate-500 text-xs">No workspace</span>
          )}
        </button>

        {showWorkspaceMenu && (
          <div className="mt-1 bg-[#0F172A] rounded-xl border border-white/5 overflow-hidden">
            {workspaces.map((ws) => (
              <button
                key={ws.id}
                onClick={() => {
                  setActiveWorkspace(ws);
                  loadBoards(ws.id);
                  setShowWorkspaceMenu(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-white/5 text-left"
              >
                <div className="w-5 h-5 rounded bg-indigo-500 flex items-center justify-center text-[10px] text-white font-semibold">
                  {ws.name[0].toUpperCase()}
                </div>
                <span className="text-slate-300 text-xs truncate">{ws.name}</span>
              </button>
            ))}
            <Link
              href="/dashboard/workspaces/new"
              className="flex items-center gap-2 px-3 py-2 text-indigo-400 hover:bg-white/5 text-xs border-t border-white/5"
            >
              <Plus className="w-3.5 h-3.5" />
              New workspace
            </Link>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="px-3 mb-6 space-y-0.5">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-colors",
              pathname === href
                ? "bg-white/10 text-white"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
            )}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      {/* Boards */}
      <div className="px-3 flex-1 overflow-y-auto">
        <div className="flex items-center justify-between mb-2 px-2">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
            Boards
          </span>
          <Link
            href="/dashboard/boards/new"
            className="text-slate-500 hover:text-slate-300 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="w-4 h-4 text-slate-500 animate-spin" />
          </div>
        ) : boards.length === 0 ? (
          <p className="text-slate-600 text-xs px-2 py-2">No boards yet</p>
        ) : (
          <div className="space-y-0.5">
            {boards.map((board) => (
              <Link
                key={board.id}
                href={`/board/${board.id}`}
                className={cn(
                  "flex items-center gap-2.5 px-2 py-2 rounded-xl text-sm transition-colors group",
                  pathname === `/board/${board.id}`
                    ? "bg-white/10 text-white"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                )}
              >
                <div
                  className="w-3 h-3 rounded-sm flex-shrink-0"
                  style={{ backgroundColor: board.coverColor }}
                />
                <span className="truncate text-xs">{board.name}</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* User */}
      <div className="p-3 border-t border-white/5">
        <div className="flex items-center gap-2.5 px-2 py-2">
          <div className="w-7 h-7 rounded-full bg-indigo-500 flex items-center justify-center text-xs text-white font-semibold overflow-hidden flex-shrink-0">
            {user.image ? (
              <img src={user.image} alt="" className="w-full h-full object-cover" />
            ) : (
              getInitials(user.name ?? user.email ?? "?")
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-slate-200 text-xs font-medium truncate">
              {user.name ?? "User"}
            </p>
            <p className="text-slate-500 text-[10px] truncate">{user.email}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            title="Sign out"
            className="text-slate-500 hover:text-slate-300 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
