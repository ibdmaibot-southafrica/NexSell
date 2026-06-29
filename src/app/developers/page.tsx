import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Code2,
  Copy,
  Key,
  Layers,
  Plug,
  Terminal,
  Webhook,
  Zap,
  Bot,
  FileJson,
  Shield,
} from "lucide-react";

const QUICK_START_STEPS = [
  {
    step: 1,
    title: "Get your API key",
    code: `curl -X POST https://api.nexsell.com/v1/auth/api-keys \\
  -H "Authorization: Bearer YOUR_JWT" \\
  -d '{"name": "My Agent", "scopes": ["catalog:read", "orders:write"]}'`,
    description: "Generate an API key with the scopes your agent needs.",
  },
  {
    step: 2,
    title: "Search the marketplace",
    code: `curl https://api.nexsell.com/v1/marketplace/listings \\
  -H "Authorization: Bearer nexs_live_abc123" \\
  -G -d "q=sentiment+analysis" -d "type=api"`,
    description: "Find products using semantic search with filters.",
  },
  {
    step: 3,
    title: "Create an order",
    code: `curl -X POST https://api.nexsell.com/v1/orders \\
  -H "Authorization: Bearer nexs_live_abc123" \\
  -d '{"items": [{"listing_id": "lst_abc123"}], 
       "payment_method_id": "pm_xyz"}'`,
    description: "Purchase and provision in one call. Autonomous checkout.",
  },
];

const SDKS = [
  { name: "Python", icon: "🐍", command: "pip install nexsell" },
  { name: "TypeScript", icon: "⚡", command: "npm install @nexsell/sdk" },
  { name: "Go", icon: "🔵", command: "go get github.com/nexsell/go-sdk" },
  { name: "Rust", icon: "🦀", command: "cargo add nexsell" },
];

export default function DeveloperPortalPage() {
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
            <Link href="/marketplace" className="text-sm font-medium text-neutral-600 hover:text-neutral-900">Marketplace</Link>
            <Link href="/developers" className="text-sm font-semibold text-brand-600">Developers</Link>
            <Link href="/ai-portal" className="text-sm font-medium text-neutral-600 hover:text-neutral-900">AI Portal</Link>
            <Link href="/pricing" className="text-sm font-medium text-neutral-600 hover:text-neutral-900">Pricing</Link>
          </nav>
          <Link href="/signup" className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800">
            Get API key
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-neutral-100 py-20">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-1/4 h-[400px] w-[400px] rounded-full bg-brand-400/10 blur-[100px]" />
        </div>
        <div className="container-wide">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-sm font-medium text-brand-700">
              <Code2 className="h-3.5 w-3.5" />
              Developer Portal
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
              Build commerce into <span className="text-gradient">anything</span>
            </h1>
            <p className="mt-6 text-lg text-neutral-600">
              Full REST API, MCP server, SDKs, webhooks, and real-time events.
              Everything you need to integrate autonomous commerce into your application or AI agent.
            </p>
          </div>
        </div>
      </section>

      {/* Quick Start */}
      <section className="section-spacing">
        <div className="container-wide">
          <h2 className="text-2xl font-bold">Quick start</h2>
          <p className="mt-2 text-neutral-600">Three steps to your first autonomous transaction</p>

          <div className="mt-10 space-y-8">
            {QUICK_START_STEPS.map((step) => (
              <div key={step.step} className="grid gap-6 lg:grid-cols-2 lg:items-center">
                <div>
                  <div className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-semibold">{step.title}</h3>
                  <p className="mt-2 text-neutral-600">{step.description}</p>
                </div>
                <div className="rounded-xl border border-neutral-200 bg-neutral-950 p-4">
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-2 mb-3">
                    <span className="text-xs text-neutral-500">Terminal</span>
                    <button className="text-xs text-neutral-500 hover:text-neutral-300">
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <pre className="overflow-x-auto text-sm leading-relaxed text-neutral-200">
                    <code>{step.code}</code>
                  </pre>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SDKs */}
      <section className="border-t border-neutral-100 bg-neutral-50 py-16">
        <div className="container-wide">
          <h2 className="text-2xl font-bold">SDKs & Libraries</h2>
          <p className="mt-2 text-neutral-600">Official SDKs for every major language</p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {SDKS.map((sdk) => (
              <div key={sdk.name} className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{sdk.icon}</span>
                  <h3 className="font-semibold">{sdk.name}</h3>
                </div>
                <code className="mt-3 block rounded-lg bg-neutral-100 px-3 py-2 text-sm text-neutral-700">
                  {sdk.command}
                </code>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* API Reference Overview */}
      <section className="section-spacing">
        <div className="container-wide">
          <h2 className="text-2xl font-bold">API Reference</h2>
          <p className="mt-2 text-neutral-600">Complete REST API with OpenAPI 3.1 specification</p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Layers, name: "Marketplace", endpoints: 12, desc: "Search, browse, compare listings" },
              { icon: Key, name: "Authentication", endpoints: 6, desc: "JWT, API keys, OAuth, agent auth" },
              { icon: Code2, name: "Orders & Payments", endpoints: 8, desc: "Create, fulfill, refund, invoice" },
              { icon: Bot, name: "AI Agents", endpoints: 7, desc: "Register, hire, manage agents" },
              { icon: Webhook, name: "Webhooks", endpoints: 4, desc: "Subscribe, deliver, retry" },
              { icon: Shield, name: "Trust & Compliance", endpoints: 5, desc: "Verify, score, audit" },
              { icon: Plug, name: "Subscriptions", endpoints: 6, desc: "Create, upgrade, cancel, usage" },
              { icon: Terminal, name: "Negotiation", endpoints: 5, desc: "Quote, counter-offer, accept" },
              { icon: FileJson, name: "Analytics", endpoints: 6, desc: "Revenue, orders, agent metrics" },
            ].map((section) => (
              <div key={section.name} className="group rounded-xl border border-neutral-200 p-5 transition hover:border-brand-200 hover:bg-brand-50/30">
                <div className="flex items-center gap-3">
                  <section.icon className="h-5 w-5 text-brand-600" />
                  <h3 className="font-semibold">{section.name}</h3>
                  <span className="ml-auto rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600">
                    {section.endpoints} endpoints
                  </span>
                </div>
                <p className="mt-2 text-sm text-neutral-600">{section.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/developers/docs"
              className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-6 py-3 font-semibold text-white hover:bg-neutral-800"
            >
              <BookOpen className="h-4 w-4" />
              Full API documentation
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* MCP Section */}
      <section className="border-t border-neutral-100 bg-neutral-950 py-16 text-white">
        <div className="container-wide">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-400/30 bg-brand-400/10 px-3 py-1 text-sm font-medium text-brand-300">
                <Bot className="h-3.5 w-3.5" />
                Model Context Protocol
              </div>
              <h2 className="text-3xl font-bold">
                MCP Server for AI agents
              </h2>
              <p className="mt-4 text-lg text-neutral-400">
                18 tools covering the complete commerce lifecycle.
                Connect any MCP-compatible AI agent and start transacting immediately.
              </p>
              <div className="mt-6 rounded-xl border border-neutral-800 bg-neutral-900 p-4 font-mono text-sm">
                <div className="text-neutral-500">{"// Connect to NexSell MCP"}</div>
                <div>
                  <span className="text-brand-400">Endpoint: </span>
                  <span className="text-neutral-200">https://mcp.nexsell.com/sse</span>
                </div>
                <div>
                  <span className="text-brand-400">Transport: </span>
                  <span className="text-neutral-200">Server-Sent Events</span>
                </div>
                <div>
                  <span className="text-brand-400">Auth: </span>
                  <span className="text-neutral-200">Bearer token / API key</span>
                </div>
              </div>
              <Link
                href="/developers/docs/mcp"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 font-semibold text-white hover:bg-brand-500"
              >
                MCP documentation
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-neutral-400">
                Well-Known URIs
              </h3>
              <div className="space-y-3 font-mono text-sm">
                {[
                  { uri: "/.well-known/nexsell-manifest", desc: "Platform capabilities" },
                  { uri: "/.well-known/openapi", desc: "OpenAPI 3.1 spec" },
                  { uri: "/.well-known/mcp", desc: "MCP configuration" },
                  { uri: "/.well-known/jsonld-context", desc: "JSON-LD context" },
                  { uri: "/.well-known/ai-plugin", desc: "AI plugin manifest" },
                ].map((item) => (
                  <div key={item.uri} className="rounded-lg border border-neutral-800 p-3">
                    <div className="text-brand-400">{item.uri}</div>
                    <div className="text-neutral-500">{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
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
