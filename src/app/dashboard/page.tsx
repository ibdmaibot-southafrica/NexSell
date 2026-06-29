import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Bot,
  CreditCard,
  Layers,
  Settings,
  Shield,
  ShoppingCart,
  TrendingUp,
  Users,
  Zap,
  Activity,
  DollarSign,
  Package,
  Key,
} from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Sidebar + Main */}
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden w-64 shrink-0 border-r border-neutral-200 bg-white lg:block">
          <div className="flex h-16 items-center gap-2.5 border-b border-neutral-200 px-6">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-brand">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold">NexSell</span>
          </div>
          <nav className="p-4">
            <div className="space-y-1">
              {[
                { icon: BarChart3, label: "Overview", active: true },
                { icon: ShoppingCart, label: "Orders" },
                { icon: Layers, label: "Listings" },
                { icon: CreditCard, label: "Payments" },
                { icon: Package, label: "Subscriptions" },
                { icon: Bot, label: "AI Agents" },
                { icon: Key, label: "API Keys" },
                { icon: Activity, label: "Webhooks" },
                { icon: Shield, label: "Trust & Security" },
                { icon: Users, label: "Team" },
                { icon: Settings, label: "Settings" },
              ].map((item) => (
                <button
                  key={item.label}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                    item.active
                      ? "bg-brand-50 text-brand-700"
                      : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </button>
              ))}
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {/* Top Bar */}
          <header className="flex h-16 items-center justify-between border-b border-neutral-200 bg-white px-6">
            <h1 className="text-lg font-semibold">Dashboard</h1>
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-brand-50 px-3 py-1 text-sm font-medium text-brand-700">
                Pro Plan
              </span>
              <div className="h-8 w-8 rounded-full bg-brand-100" />
            </div>
          </header>

          <div className="p-6">
            {/* Stats Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "Total Revenue", value: "$24,580", change: "+12.5%", icon: DollarSign },
                { label: "Orders", value: "1,247", change: "+8.2%", icon: ShoppingCart },
                { label: "Active Agents", value: "23", change: "+3", icon: Bot },
                { label: "Trust Score", value: "94%", change: "+2%", icon: Shield },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-500">{stat.label}</span>
                    <stat.icon className="h-4 w-4 text-neutral-400" />
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-bold">{stat.value}</span>
                    <span className="text-sm font-medium text-success-600">{stat.change}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Charts Placeholder */}
            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                <h3 className="font-semibold">Revenue over time</h3>
                <p className="mt-1 text-sm text-neutral-500">Last 30 days</p>
                <div className="mt-6 flex h-48 items-end justify-between gap-2">
                  {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t-md bg-brand-100 transition hover:bg-brand-200"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                <h3 className="font-semibold">Agent activity</h3>
                <p className="mt-1 text-sm text-neutral-500">Transactions by agent</p>
                <div className="mt-6 space-y-4">
                  {[
                    { name: "DataPipeline Agent", transactions: 342, revenue: "$4,210" },
                    { name: "SentimentEngine", transactions: 287, revenue: "$3,580" },
                    { name: "ComplianceGuard", transactions: 156, revenue: "$8,420" },
                    { name: "CodeReview Bot", transactions: 98, revenue: "$2,180" },
                  ].map((agent) => (
                    <div key={agent.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50">
                          <Bot className="h-4 w-4 text-brand-600" />
                        </div>
                        <div>
                          <span className="text-sm font-medium">{agent.name}</span>
                          <span className="ml-2 text-xs text-neutral-500">{agent.transactions} txns</span>
                        </div>
                      </div>
                      <span className="text-sm font-semibold">{agent.revenue}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="mt-6 rounded-xl border border-neutral-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4">
                <h3 className="font-semibold">Recent orders</h3>
                <Link href="/dashboard/orders" className="text-sm font-medium text-brand-600 hover:text-brand-700">
                  View all →
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-neutral-100">
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-neutral-500">Order</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-neutral-500">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-neutral-500">Buyer</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-neutral-500">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-neutral-500">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-neutral-500">Initiated by</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { id: "NXS-2026-7F3A2B", product: "SentimentEngine Pro", buyer: "Acme Corp", amount: "$99.00", status: "Fulfilled", by: "AI Agent" },
                      { id: "NXS-2026-8B1C4D", product: "DataPipeline Agent", buyer: "TechStart", amount: "$49.00", status: "Processing", by: "Human" },
                      { id: "NXS-2026-2E9F6G", product: "ComplianceGuard", buyer: "FinGroup", amount: "$299.00", status: "Fulfilled", by: "AI Agent" },
                      { id: "NXS-2026-5H7J3K", product: "CodeReview Bot", buyer: "DevShop", amount: "$79.00", status: "Pending", by: "AI Agent" },
                    ].map((order) => (
                      <tr key={order.id} className="border-b border-neutral-50 last:border-0">
                        <td className="px-6 py-3 text-sm font-mono font-medium">{order.id}</td>
                        <td className="px-6 py-3 text-sm">{order.product}</td>
                        <td className="px-6 py-3 text-sm text-neutral-600">{order.buyer}</td>
                        <td className="px-6 py-3 text-sm font-semibold">{order.amount}</td>
                        <td className="px-6 py-3">
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            order.status === "Fulfilled" ? "bg-success-50 text-success-700" :
                            order.status === "Processing" ? "bg-brand-50 text-brand-700" :
                            "bg-warning-50 text-warning-600"
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-3">
                          <span className={`inline-flex items-center gap-1 text-xs font-medium ${
                            order.by === "AI Agent" ? "text-brand-600" : "text-neutral-600"
                          }`}>
                            {order.by === "AI Agent" && <Bot className="h-3 w-3" />}
                            {order.by}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
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
