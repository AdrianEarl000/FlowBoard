// src/app/page.tsx
import Link from "next/link";
import { ArrowRight, Layers, Users, Zap, CheckCircle2, BarChart3 } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0F172A] text-white overflow-hidden">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
            <Layers className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-semibold tracking-tight">FlowBoard</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/auth/login"
            className="px-4 py-2 text-sm text-slate-300 hover:text-white transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/auth/register"
            className="px-4 py-2 text-sm bg-indigo-500 hover:bg-indigo-600 rounded-lg transition-colors font-medium"
          >
            Get started free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative flex flex-col items-center text-center px-6 pt-28 pb-20">
        {/* Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-medium mb-8">
          <Zap className="w-3 h-3" />
          Now in public beta · Free for teams
        </div>

        <h1 className="relative text-5xl md:text-7xl font-bold tracking-tight leading-[1.05] mb-6 max-w-4xl">
          Ship faster with{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
            visual workflows
          </span>
        </h1>

        <p className="text-slate-400 text-lg md:text-xl max-w-xl mb-10 leading-relaxed">
          FlowBoard gives your team a shared, real-time view of every project.
          Drag, drop, and deliver — without the chaos.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/auth/register"
            className="flex items-center gap-2 px-6 py-3 bg-indigo-500 hover:bg-indigo-600 rounded-xl font-semibold transition-all hover:gap-3"
          >
            Start for free <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/auth/login"
            className="px-6 py-3 rounded-xl border border-white/10 hover:border-white/20 text-slate-300 hover:text-white transition-all font-medium"
          >
            View demo
          </Link>
        </div>

        {/* Mock Board Preview */}
        <div className="relative mt-20 w-full max-w-5xl mx-auto">
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 shadow-2xl">
            <div className="flex gap-4 overflow-hidden">
              {[
                { title: "To Do", count: 3, color: "bg-slate-500" },
                { title: "In Progress", count: 2, color: "bg-blue-500" },
                { title: "Review", count: 1, color: "bg-purple-500" },
                { title: "Done", count: 4, color: "bg-green-500" },
              ].map((col) => (
                <div key={col.title} className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-2 h-2 rounded-full ${col.color}`} />
                    <span className="text-xs font-medium text-slate-400">
                      {col.title}
                    </span>
                    <span className="ml-auto text-xs text-slate-600">
                      {col.count}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {Array.from({ length: col.count }).map((_, i) => (
                      <div
                        key={i}
                        className="bg-white/5 border border-white/5 rounded-lg p-3 text-left"
                      >
                        <div
                          className={`h-2 rounded bg-white/10 mb-2`}
                          style={{ width: `${60 + Math.random() * 40}%` }}
                        />
                        <div className="h-1.5 rounded bg-white/5 w-1/2" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Bottom fade */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#0F172A] to-transparent rounded-b-2xl" />
        </div>
      </section>

      {/* Features */}
      <section className="px-8 pb-24 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: Layers,
              title: "Visual Kanban Boards",
              desc: "Organize work into flexible columns. Drag cards across stages in real-time.",
              color: "text-indigo-400",
              bg: "bg-indigo-500/10",
            },
            {
              icon: Users,
              title: "Team Workspaces",
              desc: "Invite teammates, assign roles, and collaborate without losing context.",
              color: "text-green-400",
              bg: "bg-green-500/10",
            },
            {
              icon: BarChart3,
              title: "Activity Tracking",
              desc: "Full audit trail of every move, assignment, and update across your project.",
              color: "text-purple-400",
              bg: "bg-purple-500/10",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="p-6 rounded-2xl border border-white/5 bg-white/3 hover:bg-white/5 transition-all"
            >
              <div className={`w-10 h-10 ${f.bg} rounded-xl flex items-center justify-center mb-4`}>
                <f.icon className={`w-5 h-5 ${f.color}`} />
              </div>
              <h3 className="font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <div className="flex items-center justify-center gap-6 text-sm text-slate-500">
            {["No credit card required", "Free for up to 3 boards", "Cancel anytime"].map(
              (item) => (
                <div key={item} className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  {item}
                </div>
              )
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
