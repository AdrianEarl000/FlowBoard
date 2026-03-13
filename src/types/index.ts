// src/types/index.ts
import type {
  User,
  Workspace,
  WorkspaceMember,
  Board,
  List,
  Task,
  TaskAssignment,
  TaskActivity,
  WorkspaceRole,
  TaskPriority,
  TaskStatus,
  ActivityType,
} from "@prisma/client";

export type {
  User,
  Workspace,
  WorkspaceMember,
  Board,
  List,
  Task,
  TaskAssignment,
  TaskActivity,
  WorkspaceRole,
  TaskPriority,
  TaskStatus,
  ActivityType,
};

export type WorkspaceWithMembers = Workspace & {
  members: (WorkspaceMember & { user: User })[];
};

export type BoardWithLists = Board & {
  lists: ListWithTasks[];
  createdBy: User;
};

export type ListWithTasks = List & {
  tasks: TaskWithDetails[];
};

export type TaskWithDetails = Task & {
  assignments: (TaskAssignment & { user: User })[];
  activities?: TaskActivity[];
  createdBy: User;
};

export type DashboardData = {
  assignedTasks: TaskWithDetails[];
  boards: Board[];
  upcomingDeadlines: TaskWithDetails[];
  recentActivity: TaskActivity[];
};

export const PRIORITY_CONFIG: Record<
  TaskPriority,
  { label: string; color: string; bg: string }
> = {
  LOW: { label: "Low", color: "text-slate-500", bg: "bg-slate-100" },
  MEDIUM: { label: "Medium", color: "text-blue-600", bg: "bg-blue-50" },
  HIGH: { label: "High", color: "text-orange-600", bg: "bg-orange-50" },
  URGENT: { label: "Urgent", color: "text-red-600", bg: "bg-red-50" },
};

export const STATUS_CONFIG: Record<
  TaskStatus,
  { label: string; color: string; bg: string }
> = {
  TODO: { label: "To Do", color: "text-slate-600", bg: "bg-slate-100" },
  IN_PROGRESS: { label: "In Progress", color: "text-blue-600", bg: "bg-blue-50" },
  REVIEW: { label: "Review", color: "text-purple-600", bg: "bg-purple-50" },
  DONE: { label: "Done", color: "text-green-600", bg: "bg-green-50" },
};

export const LABEL_COLORS: Record<string, string> = {
  Design: "bg-pink-100 text-pink-700",
  Frontend: "bg-blue-100 text-blue-700",
  Backend: "bg-purple-100 text-purple-700",
  Bug: "bg-red-100 text-red-700",
  Feature: "bg-green-100 text-green-700",
  Docs: "bg-yellow-100 text-yellow-700",
  DevOps: "bg-orange-100 text-orange-700",
  Testing: "bg-teal-100 text-teal-700",
};
