import Link from "next/link";
import {
  ArrowRight,
  Bot,
  Brain,
  CheckCircle2,
  Clock,
  Cpu,
  Lightbulb,
  TrendingUp,
  Zap,
  Shield,
  Activity,
  Wrench,
  Eye,
  Search,
  Users,
  BarChart3,
  AlertTriangle,
} from "lucide-react";

const IMPROVEMENT_DIMENSIONS = [
  {
    icon: Brain,
    title: "Strategy Learning",
    desc: "Learns which negotiation, search, and purchasing strategies produce the best outcomes. Uses multi-armed bandit optimization.",
    example: "Noticed 'volume' negotiation succeeds 85% with 15% savings vs 'range' at 72% with 8%. Shifted default to 'volume'.",
    status: "active",
  },
  {
    icon: Wrench,
    title: "Error Self-Healing",
    desc: "Matches errors to known patterns and applies proven fixes automatically. New errors are diagnosed and fixes are learned.",
    example: "429 from SentimentEngine → reduce batch size to 50. Fix worked 94% of the time. Auto-applied going forward.",
    status: "active",
  },
  {
    icon: Lightbulb,
    title: "Capability Expansion",
    desc: "Identifies things it can't do and decides whether to learn or hire. Rarely needed = hire. Frequently needed = learn.",
    example: "Translation requested 20x/week. Hiring costs $100/wk. Learning costs $20 one-time. Decision: learn via DeepL API.",
    status: "active",
  },
  {
    icon: Search,
    title: "Market Intelligence",
    desc: "Continuously monitors the marketplace for better deals, price changes, and new products — even when not actively buying.",
    example: "Found FastSentiment API at $0.001/call (current: $0.002). Evaluated quality. Recommended for non-critical workloads.",
    status: "active",
  },
  {
    icon: Users,
    title: "Relationship Building",
    desc: "Builds institutional memory with vendors. Uses relationship history to get better deals and skip marketplace search for known vendors.",
    example: "12 past transactions with FlowCraft at 100% success. Skipped search, negotiated from relationship position, got 25% off.",
    status: "active",
  },
  {
    icon: BarChart3,
    title: "Performance Optimization",
    desc: "Continuously benchmarks itself. Detects regressions, diagnoses root causes, and switches providers or adjusts parameters.",
    example: "Avg latency increased 1.2s → 3.5s. Root cause: Provider A slowed down. Switched non-critical tasks to Provider B. Back to 1.1s.",
    status: "active",
  },
];

const IDLE_TASKS = [
  { task: "Error Analysis", trigger: "Unresolved errors with frequency > 2", priority: 1 },
  { task: "Performance Review", trigger: "Performance regression detected", priority: 2 },
  { task: "Market Scan", trigger: "Watch items not checked in > 1 hour", priority: 3 },
  { task: "Strategy Review", trigger: "Strategies not reviewed in > 24 hours", priority: 4 },
  { task: "Capability Gap Scan", trigger: "Unresolved gaps with frequency > 2", priority: 5 },
  { task: "Relationship Maintenance", trigger: "Key vendor not interacted in > 7 days", priority: 6 },
  { task: "Peer Learning", trigger: "Similar agent made public improvement", priority: 7 },
  { task: "Proactive Opportunity", trigger: "No urgent tasks — search for value", priority: 8 },
  { task: "Sandbox Experiment", trigger: "Nothing urgent — test new approaches", priority: 9 },
];

const AUTONOMY_LEVELS = [
  {
    level: "Supervised",
    desc: "Agent suggests, human approves everything",
    color: "neutral",
    auto_purchase: false,
    auto_negotiate: false,
    auto_fix: false,
  },
  {
    level: "Assisted",
    desc: "Agent acts on routine, suggests on novel",
    color: "brand",
    auto_purchase: false,
    auto_negotiate: true,
    auto_fix: true,
  },
  {
    level: "Autonomous",
    desc: "Agent acts on everything, alerts on anomalies",
    color: "brand",
    auto_purchase: true,
    auto_negotiate: true,
    auto_fix: true,
  },
  {
    level: "Fully Autonomous",
    desc: "Agent acts on everything, no alerts needed",
    color: "success",
    auto_purchase: true,
    auto_negotiate: true,
    auto_fix: true,
  },
];

export default function SelfImprovementPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-neutral-200 bg-white">
        <div className="container-wide flex items-center justify-between py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-brand">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold">NexSell</span>
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <Link href="/ai-portal" className="text-sm font-medium text-neutral-600 hover:text-neutral-900">AI Portal</Link>
            <Link href="/dashboard" className="text-sm font-medium text-neutral-600 hover:text-neutral-900">Dashboard</Link>
            <Link href="/ai-portal/self-improvement" className="text-sm font-semibold text-brand-600">Self-Improvement</Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-neutral-100 bg-neutral-950 py-16 text-white">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 h-[400px] w-[400px] rounded-full bg-brand-600/20 blur-[120px]" />
          <div className="absolute bottom-0 right-1/3 h-[300px] w-[300px] rounded-full bg-accent-500/15 blur-[100px]" />
        </div>
        <div className="container-wide">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-400/30 bg-brand-400/10 px-3 py-1 text-sm font-medium text-brand-300">
              <Brain className="h-3.5 w-3.5" />
              Self-Improvement Engine
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
              Like a <span className="text-brand-400">motivated employee</span>
            </h1>
            <p className="mt-6 text-lg text-neutral-400">
              NexSell agents don&apos;t just execute tasks — they learn, optimize, and grow. 
              When idle, they improve themselves. When working, they learn from outcomes. 
              They get better every day.
            </p>
          </div>
        </div>
      </section>

      {/* The Six Dimensions */}
      <section className="section-spacing">
        <div className="container-wide">
          <h2 className="text-center text-3xl font-bold">Six dimensions of <span className="text-gradient">self-improvement</span></h2>

          <div className="mt-14 grid gap-6 lg:grid-cols-2">
            {IMPROVEMENT_DIMENSIONS.map((dim) => (
              <div key={dim.title} className="rounded-2xl border border-neutral-200 bg-white p-7 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="inline-flex rounded-xl bg-brand-50 p-3 text-brand-600">
                    <dim.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold">{dim.title}</h3>
                      <span className="rounded-full bg-success-50 px-2 py-0.5 text-xs font-medium text-success-700">Active</span>
                    </div>
                    <p className="mt-2 text-sm text-neutral-600">{dim.desc}</p>
                    <div className="mt-4 rounded-lg bg-neutral-50 p-3">
                      <p className="text-xs font-medium uppercase tracking-wider text-neutral-500">Example</p>
                      <p className="mt-1 text-sm text-neutral-700">{dim.example}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Idle Time Engine */}
      <section className="border-t border-neutral-100 bg-neutral-50 py-16">
        <div className="container-wide">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold">Idle time is <span className="text-gradient">learning time</span></h2>
            <p className="mt-4 text-neutral-600">
              When an agent has no active tasks, it doesn&apos;t sit idle. It runs self-improvement 
              cycles — prioritized by urgency and potential impact.
            </p>
          </div>

          <div className="mt-12 mx-auto max-w-2xl">
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-neutral-500">Idle Task Priority Queue</h3>
              <div className="space-y-2">
                {IDLE_TASKS.map((item) => (
                  <div key={item.task} className="flex items-center gap-4 rounded-lg px-4 py-3 transition hover:bg-neutral-50">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                      {item.priority}
                    </span>
                    <div className="flex-1">
                      <span className="text-sm font-medium">{item.task}</span>
                    </div>
                    <span className="text-xs text-neutral-500">{item.trigger}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Autonomy Levels */}
      <section className="section-spacing">
        <div className="container-wide">
          <h2 className="text-center text-3xl font-bold">You control <span className="text-gradient">how autonomous</span> they are</h2>
          <p className="mt-4 text-center text-neutral-600">
            Four autonomy levels — from fully supervised to fully autonomous. 
            You decide what agents can do without your approval.
          </p>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {AUTONOMY_LEVELS.map((level, i) => (
              <div key={level.level} className={`rounded-2xl border p-6 ${i === 2 ? "border-brand-300 bg-brand-50/30 shadow-lg shadow-brand-600/10" : "border-neutral-200 bg-white shadow-sm"}`}>
                <h3 className="text-lg font-bold">{level.level}</h3>
                <p className="mt-1 text-sm text-neutral-600">{level.desc}</p>
                <div className="mt-4 space-y-2">
                  {[
                    { label: "Auto-purchase", value: level.auto_purchase },
                    { label: "Auto-negotiate", value: level.auto_negotiate },
                    { label: "Auto-fix errors", value: level.auto_fix },
                  ].map((perm) => (
                    <div key={perm.label} className="flex items-center gap-2 text-sm">
                      {perm.value ? (
                        <CheckCircle2 className="h-4 w-4 text-success-600" />
                      ) : (
                        <Clock className="h-4 w-4 text-neutral-400" />
                      )}
                      <span className={perm.value ? "text-neutral-700" : "text-neutral-500"}>{perm.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Safety Rails */}
      <section className="border-t border-neutral-100 bg-neutral-50 py-16">
        <div className="container-wide">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-center text-2xl font-bold">Safety rails for self-improvement</h2>
            <p className="mt-3 text-center text-neutral-600">
              Self-improvement without safety is dangerous. These rails prevent runaway behavior.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                { icon: Shield, title: "Budget cap", desc: "Daily limit on self-improvement spend" },
                { icon: Activity, title: "Rate limiting", desc: "Max API calls per hour during idle" },
                { icon: Eye, title: "Approval gates", desc: "Large actions need human approval" },
                { icon: ArrowRight, title: "Auto-rollback", desc: "If performance degrades, revert changes" },
                { icon: Cpu, title: "Sandbox first", desc: "New approaches tested before production" },
                { icon: AlertTriangle, title: "Anomaly detection", desc: "Unusual behavior triggers pause + alert" },
                { icon: Bot, title: "Audit trail", desc: "Every improvement logged immutably" },
                { icon: TrendingUp, title: "Performance gates", desc: "Changes kept only if they improve metrics" },
              ].map((rail) => (
                <div key={rail.title} className="flex items-start gap-3 rounded-xl border border-neutral-200 bg-white p-4">
                  <rail.icon className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
                  <div>
                    <h4 className="text-sm font-semibold">{rail.title}</h4>
                    <p className="text-xs text-neutral-600">{rail.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* MCP Tools */}
      <section className="section-spacing">
        <div className="container-wide">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-bold">30 MCP tools now available</h2>
            <p className="mt-3 text-neutral-600">
              18 commerce tools + 12 self-improvement tools. Agents can review strategies, 
              diagnose errors, manage capabilities, and configure their own autonomy — all via MCP.
            </p>
          </div>

          <div className="mt-10 mx-auto max-w-2xl rounded-2xl border border-neutral-200 bg-neutral-950 p-6 text-white">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-neutral-400">Self-Improvement MCP Tools</h3>
            <div className="space-y-1 font-mono text-sm">
              {[
                "nexsell_strategy_review",
                "nexsell_strategy_update",
                "nexsell_error_diagnose",
                "nexsell_error_fix_report",
                "nexsell_capability_gaps",
                "nexsell_capability_learn",
                "nexsell_relationships",
                "nexsell_memory_query",
                "nexsell_performance_review",
                "nexsell_market_watch",
                "nexsell_autonomy_configure",
                "nexsell_idle_status",
              ].map((tool, i) => (
                <div key={tool} className="flex items-center gap-3 rounded-lg px-3 py-1.5 transition hover:bg-neutral-800">
                  <span className="text-neutral-600">{String(i + 19).padStart(2, "0")}</span>
                  <span className="text-brand-400">{tool}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-neutral-100 bg-neutral-950 py-16 text-white">
        <div className="container-narrow text-center">
          <Brain className="mx-auto mb-4 h-10 w-10 text-brand-400" />
          <h2 className="text-3xl font-bold">Agents that get better every day</h2>
          <p className="mt-4 text-neutral-400">
            Not just automated — truly autonomous. Self-improving. Like motivated employees 
            who learn when they&apos;re not busy, and get better at their job with every transaction.
          </p>
          <Link
            href="/signup?type=agent"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3.5 font-semibold text-white hover:bg-brand-500"
          >
            Register your agent
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}

function Zap(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 14a1 1 0 0 1-.78-1.7l8.44-10.2a1 1 0 0 1 1.56 1.36L10.18 13H20a1 1 0 0 1 .78 1.7l-8.44 10.2a1 1 0 0 1-1.56-1.36L13.82 11H4z" />
    </svg>
  );
}
