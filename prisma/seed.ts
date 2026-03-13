// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create demo user
  const password = await bcrypt.hash("password123", 12);
  const user = await prisma.user.upsert({
    where: { email: "demo@flowboard.app" },
    update: {},
    create: {
      name: "Demo User",
      email: "demo@flowboard.app",
      password,
    },
  });

  // Create workspace
  const workspace = await prisma.workspace.upsert({
    where: { slug: "demo-workspace" },
    update: {},
    create: {
      name: "Demo Workspace",
      slug: "demo-workspace",
      members: { create: { userId: user.id, role: "ADMIN" } },
    },
  });

  // Create board
  const board = await prisma.board.create({
    data: {
      name: "Product Roadmap",
      description: "Q4 2024 features and improvements",
      coverColor: "#4F46E5",
      workspaceId: workspace.id,
      createdById: user.id,
    },
  });

  // Create lists with tasks
  const lists = [
    {
      title: "To Do",
      position: 0,
      tasks: [
        { title: "Design onboarding flow", priority: "HIGH" as const, labels: ["Design", "Frontend"] },
        { title: "Set up CI/CD pipeline", priority: "MEDIUM" as const, labels: ["DevOps"] },
        { title: "Write API documentation", priority: "LOW" as const, labels: ["Docs"] },
      ],
    },
    {
      title: "In Progress",
      position: 1,
      tasks: [
        { title: "Build authentication system", priority: "URGENT" as const, labels: ["Backend", "Frontend"] },
        { title: "Implement drag and drop", priority: "HIGH" as const, labels: ["Frontend"] },
      ],
    },
    {
      title: "Review",
      position: 2,
      tasks: [
        { title: "Database schema optimization", priority: "MEDIUM" as const, labels: ["Backend"] },
      ],
    },
    {
      title: "Done",
      position: 3,
      tasks: [
        { title: "Project setup & configuration", priority: "LOW" as const, labels: ["DevOps"] },
        { title: "Define tech stack", priority: "LOW" as const, labels: [] },
      ],
    },
  ];

  for (const listData of lists) {
    const list = await prisma.list.create({
      data: {
        title: listData.title,
        position: listData.position,
        boardId: board.id,
      },
    });

    for (let i = 0; i < listData.tasks.length; i++) {
      const task = listData.tasks[i];
      const created = await prisma.task.create({
        data: {
          title: task.title,
          priority: task.priority,
          labels: task.labels,
          position: i,
          listId: list.id,
          createdById: user.id,
          status: listData.title === "Done" ? "DONE" : listData.title === "In Progress" ? "IN_PROGRESS" : listData.title === "Review" ? "REVIEW" : "TODO",
        },
      });

      await prisma.taskAssignment.create({
        data: { taskId: created.id, userId: user.id },
      });

      await prisma.taskActivity.create({
        data: {
          taskId: created.id,
          userId: user.id,
          action: "TASK_CREATED",
        },
      });
    }
  }

  console.log("✅ Seed complete!");
  console.log("📧 Demo login: demo@flowboard.app / password123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
