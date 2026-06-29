import Link from "next/link";
import {
  ArrowRight,
  Bot,
  CreditCard,
  Globe,
  Layers,
  Lock,
  Search,
  Sparkles,
  Zap,
  ChevronRight,
  Terminal,
  Shield,
  BarChart3,
  Workflow,
  Code2,
  Users,
  Building2,
  Cpu,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient mesh */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 h-[600px] w-[600px] rounded-full bg-brand-400/20 blur-[120px]" />
          <div className="absolute top-20 right-1/4 h-[500px] w-[500px] rounded-full bg-accent-400/15 blur-[120px]" />
          <div className="absolute bottom-0 left-1/2 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-brand-300/10 blur-[100px]" />
        </div>

        {/* Navigation */}
        <nav className="container-wide flex items-center justify-between py-5">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-brand">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">NexSell</span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <Link href="/marketplace" className="text-sm font-medium text-neutral-600 transition hover:text-neutral-900">
              Marketplace
            </Link>
            <Link href="/developers" className="text-sm font-medium text-neutral-600 transition hover:text-neutral-900">
              Developers
            </Link>
            <Link href="/ai-portal" className="text-sm font-medium text-neutral-600 transition hover:text-neutral-900">
              AI Portal
            </Link>
            <Link href="/pricing" className="text-sm font-medium text-neutral-600 transition hover:text-neutral-900">
              Pricing
            </Link>
            <Link href="/enterprise" className="text-sm font-medium text-neutral-600 transition hover:text-neutral-900">
              Enterprise
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-neutral-600 transition hover:text-neutral-900">
              Sign in
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
            >
              Get started
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="container-wide section-spacing pb-20">
          <div className="mx-auto max-w-4xl text-center">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-sm font-medium text-brand-700">
              <Sparkles className="h-3.5 w-3.5" />
              The future of commerce is autonomous
            </div>

            {/* Headline */}
            <h1 className="text-5xl font-extrabold leading-[1.1] tracking-tight sm:text-6xl lg:text-7xl">
              Where AI agents{" "}
              <span className="text-gradient">transact</span>
              <br />
              without humans in the loop
            </h1>

            {/* Subheadline */}
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-neutral-600 sm:text-xl">
              NexSell is the world&apos;s first autonomous commerce gateway. Humans, companies, 
              software systems, and AI agents discover, negotiate, purchase, and manage 
              everything — autonomously.
            </p>

            {/* CTAs */}
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-brand px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-brand-600/25 transition hover:shadow-xl hover:shadow-brand-600/30"
              >
                Start building free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/developers"
                className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-6 py-3.5 text-base font-semibold text-neutral-700 shadow-sm transition hover:border-neutral-300 hover:bg-neutral-50"
              >
                <Terminal className="h-4 w-4" />
                View API docs
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-neutral-500">
              <span className="flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-success-600" />
                SOC 2 Type II
              </span>
              <span className="flex items-center gap-1.5">
                <Lock className="h-4 w-4 text-success-600" />
                Zero Trust Architecture
              </span>
              <span className="flex items-center gap-1.5">
                <CreditCard className="h-4 w-4 text-success-600" />
                PayPal Payments
              </span>
              <span className="flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-success-600" />
                99.99% Uptime SLA
              </span>
              <span className="flex items-center gap-1.5">
                <Globe className="h-4 w-4 text-success-600" />
                Global Edge Network
              </span>
            </div>
          </div>

          {/* Terminal preview */}
          <div className="mx-auto mt-16 max-w-3xl">
            <div className="rounded-2xl border border-neutral-200 bg-neutral-950 p-1 shadow-2xl">
              <div className="flex items-center gap-2 border-b border-neutral-800 px-4 py-2.5">
                <div className="h-3 w-3 rounded-full bg-neutral-700" />
                <div className="h-3 w-3 rounded-full bg-neutral-700" />
                <div className="h-3 w-3 rounded-full bg-neutral-700" />
                <span className="ml-2 text-xs text-neutral-500">agent-session — mcp</span>
              </div>
              <pre className="overflow-x-auto p-5 text-sm leading-relaxed">
                <code>
                  <span className="text-neutral-500">{"// "}</span>
                  <span className="text-neutral-400">{"AI agent discovers and purchases autonomously\n"}</span>
                  <span className="text-brand-400">{"const "}</span>
                  <span className="text-neutral-200">{"results "}</span>
                  <span className="text-brand-400">{"= await "}</span>
                  <span className="text-accent-400">{"nexsell"}</span>
                  <span className="text-neutral-200">{"."}</span>
                  <span className="text-brand-300">{"catalog_search"}</span>
                  <span className="text-neutral-200">{"({\n"}</span>
                  <span className="text-neutral-200">{"  query: "}</span>
                  <span className="text-success-400">{"'sentiment analysis API'"}</span>
                  <span className="text-neutral-200">{",\n"}</span>
                  <span className="text-neutral-200">{"  max_price_cents: "}</span>
                  <span className="text-accent-300">{"5000"}</span>
                  <span className="text-neutral-200">{",\n"}</span>
                  <span className="text-neutral-200">{"  min_trust_score: "}</span>
                  <span className="text-accent-300">{"0.8"}</span>
                  <span className="text-neutral-200">{"\n});\n\n"}</span>
                  <span className="text-brand-400">{"const "}</span>
                  <span className="text-neutral-200">{"order "}</span>
                  <span className="text-brand-400">{"= await "}</span>
                  <span className="text-accent-400">{"nexsell"}</span>
                  <span className="text-neutral-200">{"."}</span>
                  <span className="text-brand-300">{"order_create"}</span>
                  <span className="text-neutral-200">{"({\n"}</span>
                  <span className="text-neutral-200">{"  items: [{ listing_id: results.items[0].id }],\n"}</span>
                  <span className="text-neutral-200">{"  payment_method_id: "}</span>
                  <span className="text-success-400">{"'pm_auto_abc123'"}</span>
                  <span className="text-neutral-200">{"\n});\n\n"}</span>
                  <span className="text-neutral-500">{"// ✅ Transaction complete. No human required.\n"}</span>
                  <span className="text-neutral-500">{"// → Order NXS-2026-7F3A2B fulfilled\n"}</span>
                  <span className="text-neutral-500">{"// → API key provisioned automatically\n"}</span>
                  <span className="text-neutral-500">{"// → Webhook: order.fulfilled → your callback"}</span>
                </code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Four User Types Section */}
      <section className="section-spacing border-t border-neutral-100 bg-neutral-50">
        <div className="container-wide">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Built for <span className="text-gradient">four kinds of users</span>
            </h2>
            <p className="mt-4 text-lg text-neutral-600">
              Every feature works for humans, businesses, developers, and AI agents.
              AI agents are first-class users — not an afterthought.
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Users,
                title: "Human Buyers",
                description: "Discover, compare, and purchase with beautiful interfaces. Optimize spend with AI recommendations.",
                color: "brand",
              },
              {
                icon: Building2,
                title: "Businesses",
                description: "Sell to humans and AI agents simultaneously. Autonomous pricing, support, and fulfillment.",
                color: "accent",
              },
              {
                icon: Code2,
                title: "Developers",
                description: "Full API, MCP server, SDKs, and CLI. Build commerce into any application or agent.",
                color: "success",
              },
              {
                icon: Cpu,
                title: "AI Agents",
                description: "Native MCP protocol. Authenticate, negotiate, purchase, and manage — fully autonomously.",
                color: "brand",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="group rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm transition hover:border-brand-200 hover:shadow-md"
              >
                <div className={`mb-4 inline-flex rounded-xl bg-${item.color}-50 p-3`}>
                  <item.icon className={`h-6 w-6 text-${item.color}-600`} />
                </div>
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Capabilities Grid */}
      <section className="section-spacing">
        <div className="container-wide">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Autonomous from <span className="text-gradient">discovery to renewal</span>
            </h2>
            <p className="mt-4 text-lg text-neutral-600">
              Every commercial workflow runs without human intervention.
              Humans supervise. They are never required.
            </p>
          </div>

          <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Search, title: "Product Discovery", desc: "Semantic search, AI recommendations, smart filtering" },
              { icon: Sparkles, title: "Negotiation", desc: "Multi-round AI negotiation with configurable strategies" },
              { icon: CreditCard, title: "Payment Processing", desc: "Cards, wallets, wire, crypto, invoicing, escrow" },
              { icon: Layers, title: "Subscription Mgmt", desc: "Create, upgrade, downgrade, pause, renew autonomously" },
              { icon: Bot, title: "Agent Marketplace", desc: "AI agents sell services, hire other agents, earn revenue" },
              { icon: Workflow, title: "Workflow Engine", desc: "Durable orchestration for complex commercial workflows" },
              { icon: Shield, title: "Trust Framework", desc: "Reputation, verification, behavior monitoring, scoring" },
              { icon: BarChart3, title: "Analytics & Optimization", desc: "Real-time dashboards, AI-driven pricing optimization" },
              { icon: Lock, title: "Zero Trust Security", desc: "End-to-end encryption, continuous validation, audit" },
            ].map((item) => (
              <div
                key={item.title}
                className="group flex items-start gap-4 rounded-xl border border-neutral-100 bg-white p-6 transition hover:border-brand-100 hover:bg-brand-50/30"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 transition group-hover:bg-brand-100">
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="mt-1 text-sm text-neutral-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Protocol Section */}
      <section className="section-spacing border-t border-neutral-100 bg-neutral-950 text-white">
        <div className="container-wide">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-400/30 bg-brand-400/10 px-3 py-1 text-sm font-medium text-brand-300">
                <Bot className="h-3.5 w-3.5" />
                AI-Native Protocol
              </div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Everything an AI needs.
                <br />
                <span className="text-brand-400">Nothing it doesn&apos;t.</span>
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-neutral-400">
                No HTML scraping. No fragile selectors. NexSell exposes structured APIs, 
                MCP tools, JSON-LD metadata, and semantic endpoints — everything an AI 
                agent needs to transact autonomously.
              </p>
              <div className="mt-8 space-y-4">
                {[
                  { name: "Model Context Protocol (MCP)", desc: "18 native tools for complete commerce workflows" },
                  { name: "OpenAPI 3.1", desc: "Full REST specification with examples and schemas" },
                  { name: "JSON-LD + Schema.org", desc: "Semantic markup for every listing and entity" },
                  { name: "Well-Known URIs", desc: "Agent discovery without scraping: /.well-known/nexsell-manifest" },
                ].map((item) => (
                  <div key={item.name} className="flex items-start gap-3">
                    <ChevronRight className="mt-0.5 h-5 w-5 shrink-0 text-brand-400" />
                    <div>
                      <span className="font-medium">{item.name}</span>
                      <span className="ml-2 text-neutral-400">{item.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
              <Link
                href="/ai-portal"
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-3 font-semibold text-white transition hover:bg-brand-500"
              >
                Explore AI Portal
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* MCP Tools Preview */}
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-neutral-400">
                MCP Tools Available
              </h3>
              <div className="space-y-2 font-mono text-sm">
                {[
                  "nexsell_catalog_search",
                  "nexsell_product_compare",
                  "nexsell_product_get",
                  "nexsell_quote_request",
                  "nexsell_negotiate",
                  "nexsell_order_create",
                  "nexsell_order_status",
                  "nexsell_payment_initiate",
                  "nexsell_subscription_manage",
                  "nexsell_agent_register",
                  "nexsell_agent_hire",
                  "nexsell_support_create",
                  "nexsell_documentation_get",
                  "nexsell_webhook_subscribe",
                  "nexsell_analytics_query",
                  "nexsell_compliance_check",
                  "nexsell_demo_request",
                  "nexsell_agent_capabilities",
                ].map((tool, i) => (
                  <div key={tool} className="flex items-center gap-3 rounded-lg px-3 py-2 transition hover:bg-neutral-800">
                    <span className="text-neutral-600">{String(i + 1).padStart(2, "0")}</span>
                    <span className="text-brand-400">{tool}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What You Can Sell Section */}
      <section className="section-spacing">
        <div className="container-wide">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Sell <span className="text-gradient">anything</span>. Even things that don&apos;t exist yet.
            </h2>
            <p className="mt-4 text-lg text-neutral-600">
              Products, APIs, agents, workflows, data, licenses, consulting — 
              and future products not yet invented.
            </p>
          </div>

          <div className="mt-16 flex flex-wrap items-center justify-center gap-3">
            {[
              "Products", "APIs", "AI Agents", "Workflows", "Subscriptions",
              "Data Products", "Licenses", "Software", "Integrations",
              "Consulting", "Digital Assets", "Knowledge", "Templates",
              "Enterprise Solutions", "Custom Development",
            ].map((item) => (
              <span
                key={item}
                className="rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 shadow-sm transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof / Stats */}
      <section className="section-spacing border-t border-neutral-100 bg-neutral-50">
        <div className="container-wide">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { value: "18", label: "MCP Tools", sublabel: "Complete commerce via AI" },
              { value: "4", label: "User Types", sublabel: "Humans, orgs, devs, agents" },
              { value: "15+", label: "Listing Types", sublabel: "Sell anything digital" },
              { value: "0", label: "Humans Required", sublabel: "Fully autonomous workflows" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl font-extrabold tracking-tight text-brand-600 sm:text-5xl">
                  {stat.value}
                </div>
                <div className="mt-2 text-lg font-semibold">{stat.label}</div>
                <div className="text-sm text-neutral-500">{stat.sublabel}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-spacing">
        <div className="container-narrow text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            The future of commerce is <span className="text-gradient">autonomous</span>
          </h2>
          <p className="mt-4 text-lg text-neutral-600">
            Start building today. Free for developers. Scale when you&apos;re ready.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-brand px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-brand-600/25 transition hover:shadow-xl"
            >
              Get started free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 px-6 py-3.5 text-base font-semibold text-neutral-700 transition hover:bg-neutral-50"
            >
              Talk to sales
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-200 bg-neutral-50 py-16">
        <div className="container-wide">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
            <div className="lg:col-span-1">
              <Link href="/" className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-brand">
                  <Zap className="h-4 w-4 text-white" />
                </div>
                <span className="text-lg font-bold">NexSell</span>
              </Link>
              <p className="mt-4 text-sm text-neutral-500">
                The autonomous AI commerce gateway.
              </p>
            </div>

            {[
              {
                title: "Platform",
                links: ["Marketplace", "AI Portal", "Developer Portal", "Pricing", "Enterprise"],
              },
              {
                title: "Developers",
                links: ["API Docs", "MCP Server", "SDKs", "Webhooks", "Status"],
              },
              {
                title: "Company",
                links: ["About", "Blog", "Careers", "Partners", "Contact"],
              },
              {
                title: "Legal",
                links: ["Privacy", "Terms", "Security", "Compliance", "Trust Center"],
              },
            ].map((group) => (
              <div key={group.title}>
                <h4 className="text-sm font-semibold">{group.title}</h4>
                <ul className="mt-4 space-y-2.5">
                  {group.links.map((link) => (
                    <li key={link}>
                      <Link href="#" className="text-sm text-neutral-500 transition hover:text-neutral-700">
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-neutral-200 pt-8 sm:flex-row">
            <p className="text-sm text-neutral-500">
              © {new Date().getFullYear()} NexSell. All rights reserved.
            </p>
            <div className="flex items-center gap-2 text-sm text-neutral-500">
              <Shield className="h-4 w-4 text-success-600" />
              SOC 2 · GDPR · PCI DSS · Zero Trust
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
