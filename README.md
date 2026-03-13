# FlowBoard 🧩

A modern collaborative task management platform built with Next.js, TypeScript, Prisma, and Supabase. Similar to Trello with drag-and-drop Kanban boards, team workspaces, and real-time activity tracking.

## ✨ Features

- 🔐 **Authentication** — Email/password + Google OAuth via NextAuth v5
- 🏢 **Workspaces** — Team workspaces with role-based access (Admin / Member)
- 🗂️ **Boards** — Multiple boards per workspace with custom colors
- 📋 **Lists** — Flexible columns (To Do, In Progress, Review, Done)
- 🃏 **Tasks** — Cards with title, description, priority, labels, due date, assignees
- 🖱️ **Drag & Drop** — Smooth card movement between columns via dnd-kit
- 📊 **Dashboard** — Overview of tasks, boards, and upcoming deadlines
- 📝 **Activity Log** — Track every action on tasks

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 App Router |
| Language | TypeScript |
| Styling | Tailwind CSS |
| ORM | Prisma |
| Database | PostgreSQL (Supabase) |
| Auth | NextAuth v5 |
| Drag & Drop | dnd-kit |
| Deployment | Vercel |

## 🚀 Getting Started

### 1. Clone & install dependencies

```bash
git clone https://github.com/your-org/flowboard.git
cd flowboard
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in the values in `.env.local`:

```env
# Supabase PostgreSQL (get from Supabase Dashboard > Settings > Database)
DATABASE_URL="postgresql://..."      # Use the "connection pooling" URL (port 6543)
DIRECT_URL="postgresql://..."        # Use the "direct connection" URL (port 5432)

# NextAuth
AUTH_SECRET="your-secret-here"       # Generate with: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth (create at console.cloud.google.com)
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
```

### 3. Set up the database

```bash
# Push schema to Supabase
npm run db:push

# (Optional) Seed with demo data
npm run db:seed
```

### 4. Start the dev server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

Demo credentials (if seeded): `demo@flowboard.app` / `password123`

## 📁 Project Structure

```
flowboard/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Seed data
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/          # NextAuth + register routes
│   │   │   ├── boards/        # Board CRUD
│   │   │   ├── lists/         # List CRUD
│   │   │   ├── tasks/         # Task CRUD + move endpoint
│   │   │   └── workspaces/    # Workspace CRUD
│   │   ├── auth/              # Login + register pages
│   │   ├── board/[boardId]/   # Board view with D&D
│   │   ├── dashboard/         # User dashboard + settings
│   │   └── layout.tsx         # Root layout
│   ├── components/
│   │   ├── board/             # BoardView, BoardList, TaskCard, etc.
│   │   ├── layout/            # Sidebar
│   │   ├── task/              # TaskModal
│   │   └── ui/                # Toaster, shared primitives
│   ├── lib/
│   │   ├── auth.ts            # NextAuth config
│   │   ├── prisma.ts          # Prisma client singleton
│   │   └── utils.ts           # Helper functions
│   ├── middleware.ts           # Route protection
│   └── types/
│       └── index.ts           # TypeScript types & constants
├── .env.example
├── next.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

## 🗄️ Database Schema

```
User ──┬──< WorkspaceMember >──── Workspace ──< Board ──< List ──< Task
       │                                                            │
       └──< TaskAssignment >──────────────────────────────────────┘
       └──< TaskActivity >─────────────────────────────────────────┘
```

Key models: `User`, `Workspace`, `WorkspaceMember`, `Board`, `List`, `Task`, `TaskAssignment`, `TaskActivity`

## 🚢 Deployment (Vercel)

1. Push repo to GitHub
2. Import project to [vercel.com](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy — Vercel auto-runs `npm run build` which includes `prisma generate`

**Important**: Add `DATABASE_URL` and `DIRECT_URL` to Vercel env vars using your Supabase connection strings.

## 🔧 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run db:push` | Push Prisma schema to DB |
| `npm run db:migrate` | Run migrations |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:seed` | Seed the database |

## 📝 License

MIT
