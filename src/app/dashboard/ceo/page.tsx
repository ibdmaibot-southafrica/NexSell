import Link from "next/link";
import {
  ArrowRight,
  Brain,
  CheckCircle2,
  Cpu,
  DollarSign,
  Eye,
  Lightbulb,
  Play,
  Shield,
  TrendingUp,
  Zap,
  AlertTriangle,
  BarChart3,
  Clock,
  XCircle,
} from "lucide-react";

const RECENT_DECISIONS = [
  {
    title: "Lower API listing fees from 4% to 3%",
    type: "fee_structure",
    reasoning: "API category has 320 listings but only 12% conversion. Fee reduction should increase volume by 25%+, net positive revenue.",
    risk: "low",
    status: "executed",
    impact: "+$2,100/mo estimated",
    executed_at: "2 hours ago",
  },
  {
    title: "Create 'AI Safety' category",
    type: "market_entry",
    reasoning: "14 products tagged 'safety' with no category. 3 competitors have safety categories. First-mover advantage.",
    risk: "low",
    status: "executed",
    impact: "+$800/mo estimated",
    executed_at: "2 hours ago",
  },
  {
    title: "Allocate $500/mo to developer outreach",
    type: "growth_investment",
    reasoning: "Each developer acquired generates $47/mo average. At 10% conversion, $500 spend → 5 devs → $235/mo revenue. 47% ROI.",
    risk: "medium",
    status: "executed",
    impact: "+$235/mo estimated",
    executed_at: "2 hours ago",
  },
  {
    title: "Increase AI agent fee from 7% to 8%",
    type: "fee_structure",
    reasoning: "AI agent transactions have 94% retention rate and no price sensitivity detected. 1% increase = ~$1,200/mo with <2% churn risk.",
    risk: "medium",
    status: "executed",
    impact: "+$1,200/mo estimated",
    executed_at: "2 hours ago",
  },
  {
    title: "Defer: Enter healthcare market",
    type: "market_entry",
    reasoning: "Healthcare requires HIPAA compliance ($50K+ investment). Current revenue doesn't justify the compliance cost. Revisit at $50K MRR.",
    risk: "high",
    status: "deferred",
    impact: "Deferred — revisit at $50K MRR",
    executed_at: "2 hours ago",
  },
];

const DECISION_TYPES = [
  { type: "Pricing Adjustment", icon: DollarSign, count: 12, success: 10 },
  { type: "Market Entry", icon: TrendingUp, count: 3, success: 2 },
  { type: "Fee Structure", icon: BarChart3, count: 5, success: 4 },
  { type: "Growth Investment", icon: Lightbulb, count: 4, success: 3 },
  { type: "Seller Acquisition", icon: ArrowRight, count: 8, success: 6 },
  { type: "Cost Optimization", icon: Cpu, count: 6, success: 5 },
];

export default function CEOAgentPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="border-b border-neutral-200 bg-white">
        <div className="container-wide flex items-center justify-between py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-brand">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold">NexSell</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-sm font-medium text-brand-700">
              CEO Agent
            </span>
            <div className="h-8 w-8 rounded-full bg-brand-100" />
          </div>
        </div>
      </header>

      <div className="container-wide py-8">
        {/* Hero */}
        <div className="mb-8 rounded-2xl bg-neutral-950 p-8 text-white">
          <div className="flex items-start justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-brand-400/30 bg-brand-400/10 px-3 py-1 text-sm font-medium text-brand-300">
                <Brain className="h-3.5 w-3.5" />
                Autonomous CEO
              </div>
              <h1 className="text-3xl font-bold">CEO Agent</h1>
              <p className="mt-2 max-w-2xl text-neutral-400">
                Researches the market. Analyzes the data. Makes the decision. <strong className="text-white">Executes immediately.</strong> Not a suggestion engine — an autonomous executive that acts.
              </p>
            </div>
            <div className="hidden flex-col items-end gap-2 sm:flex">
              <span className="text-sm text-neutral-500">Next decision cycle</span>
              <span className="text-lg font-semibold text-brand-400">5:00 AM UTC daily</span>
              <span className="mt-2 rounded-full bg-success-600/20 px-3 py-1 text-xs font-medium text-success-400">
                ● Active
              </span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Decisions made (30d)", value: "38", change: "+12 this week", icon: Brain },
            { label: "Actions executed", value: "34", change: "89% execution rate", icon: Play },
            { label: "Revenue impact", value: "+$4,330", change: "Estimated monthly", icon: DollarSign },
            { label: "Prediction accuracy", value: "82%", change: "Improving each cycle", icon: TrendingUp },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-500">{stat.label}</span>
                <stat.icon className="h-4 w-4 text-neutral-400" />
              </div>
              <div className="mt-2 text-2xl font-bold">{stat.value}</div>
              <span className="text-xs text-neutral-500">{stat.change}</span>
            </div>
          ))}
        </div>

        {/* How It Works */}
        <div className="mb-8 rounded-xl border border-neutral-200 bg-white p-6">
          <h2 className="text-lg font-bold">How the CEO Agent works</h2>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-0">
            {[
              { step: 1, label: "Gather data", desc: "Revenue, churn, listings, agents, competitors" },
              { step: 2, label: "Identify decisions", desc: "AI finds strategic questions that need answering" },
              { step: 3, label: "Research", desc: "Deep analysis with platform data + market context" },
              { step: 4, label: "Decide & Execute", desc: "Makes the call and acts immediately" },
              { step: 5, label: "Learn", desc: "Reviews past decisions, improves prediction accuracy" },
            ].map((step, i) => (
              <div key={step.step} className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
                  {step.step}
                </div>
                <div className="sm:min-w-[140px]">
                  <div className="text-sm font-semibold">{step.label}</div>
                  <div className="text-xs text-neutral-500">{step.desc}</div>
                </div>
                {i < 4 && <ArrowRight className="hidden h-4 w-4 shrink-0 text-neutral-300 sm:block" />}
              </div>
            ))}
          </div>
        </div>

        {/* Recent Decisions */}
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-bold">Recent decisions</h2>
          <div className="space-y-4">
            {RECENT_DECISIONS.map((decision) => (
              <div
                key={decision.title}
                className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {decision.status === "executed" ? (
                        <CheckCircle2 className="h-5 w-5 text-success-600" />
                      ) : decision.status === "deferred" ? (
                        <Clock className="h-5 w-5 text-neutral-400" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-warning-600" />
                      )}
                      <h3 className="font-semibold">{decision.title}</h3>
                    </div>
                    <p className="mt-2 text-sm text-neutral-600">{decision.reasoning}</p>
                  </div>
                  <div className="ml-4 flex flex-col items-end gap-1">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      decision.risk === "low" ? "bg-success-50 text-success-700" :
                      decision.risk === "medium" ? "bg-warning-50 text-warning-600" :
                      "bg-error-50 text-error-600"
                    }`}>
                      {decision.risk} risk
                    </span>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      decision.status === "executed" ? "bg-brand-50 text-brand-700" : "bg-neutral-100 text-neutral-600"
                    }`}>
                      {decision.status}
                    </span>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-4 border-t border-neutral-100 pt-3">
                  <span className="text-xs text-neutral-500">{decision.executed_at}</span>
                  <span className="text-xs font-medium text-brand-600">{decision.impact}</span>
                  <span className="rounded bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600">
                    {decision.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Decision Types Breakdown */}
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-bold">Decision types (30 days)</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {DECISION_TYPES.map((dt) => (
              <div key={dt.type} className="flex items-center gap-4 rounded-xl border border-neutral-200 bg-white p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50">
                  <dt.icon className="h-5 w-5 text-brand-600" />
                </div>
                <div>
                  <div className="text-sm font-semibold">{dt.type}</div>
                  <div className="text-xs text-neutral-500">
                    {dt.count} decisions · {dt.success} successful
                  </div>
                </div>
                <div className="ml-auto text-sm font-semibold text-success-600">
                  {Math.round((dt.success / dt.count) * 100)}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Safety: What the CEO CAN'T do */}
        <div className="rounded-xl border border-warning-200 bg-warning-50 p-6">
          <h2 className="flex items-center gap-2 text-lg font-bold text-warning-800">
            <Shield className="h-5 w-5" />
            Safety rails — what the CEO agent cannot do
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {[
              "Cannot spend more than $1,000/day without approval",
              "Cannot change fees by more than 2% in one decision",
              "Cannot delete products or cancel seller accounts",
              "Cannot access or modify user payment methods",
              "Cannot change security or compliance settings",
              "Cannot send communications to all users at once",
              "Cannot modify the CEO agent's own decision rules",
              "Cannot make high-risk decisions without logging for review",
            ].map((rule) => (
              <div key={rule} className="flex items-start gap-2 text-sm text-warning-800">
                <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{rule}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
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
