import Link from "next/link";
import {
  Search,
  Filter,
  Star,
  ArrowRight,
  Bot,
  Code2,
  Layers,
  Workflow,
  Database,
  MessageSquare,
  Plug,
  FileCode,
  Shield,
  TrendingUp,
  Sparkles,
} from "lucide-react";

const LISTING_TYPES = [
  { icon: Layers, label: "Products", slug: "product", count: 450 },
  { icon: Code2, label: "APIs", slug: "api", count: 320 },
  { icon: Bot, label: "AI Agents", slug: "ai_agent", count: 280 },
  { icon: Workflow, label: "Workflows", slug: "workflow", count: 156 },
  { icon: Database, label: "Data", slug: "data_product", count: 98 },
  { icon: MessageSquare, label: "Consulting", slug: "consulting", count: 67 },
  { icon: Plug, label: "Integrations", slug: "integration", count: 134 },
  { icon: FileCode, label: "Templates", slug: "template", count: 89 },
];

const FEATURED_LISTINGS = [
  {
    name: "SentimentEngine Pro",
    seller: "NeuralOps",
    type: "API",
    price: "$0.002/call",
    rating: 4.9,
    reviews: 412,
    trust: 0.96,
    tags: ["NLP", "sentiment", "real-time"],
    description: "Production sentiment analysis with 99.7% accuracy. Sub-50ms latency.",
  },
  {
    name: "DataPipeline Agent",
    seller: "FlowCraft",
    type: "AI Agent",
    price: "$49/mo",
    rating: 4.8,
    reviews: 287,
    trust: 0.93,
    tags: ["ETL", "automation", "agent"],
    description: "Autonomous ETL agent that designs, builds, and maintains data pipelines.",
  },
  {
    name: "ComplianceGuard",
    seller: "TrustLayer",
    type: "Product",
    price: "$299/mo",
    rating: 4.7,
    reviews: 156,
    trust: 0.98,
    tags: ["compliance", "SOC2", "GDPR"],
    description: "Continuous compliance monitoring with autonomous remediation.",
  },
  {
    name: "DocSummarizer",
    seller: "TextAI",
    type: "AI Agent",
    price: "$0.01/page",
    rating: 4.6,
    reviews: 534,
    trust: 0.89,
    tags: ["summarization", "documents", "RAG"],
    description: "Multi-document summarization with citation tracking and RAG integration.",
  },
  {
    name: "PaymentOrchestrator",
    seller: "FinConnect",
    type: "Integration",
    price: "$99/mo",
    rating: 4.9,
    reviews: 89,
    trust: 0.97,
    tags: ["payments", "Stripe", "multi-currency"],
    description: "Unified payment orchestration across 15+ providers with smart routing.",
  },
  {
    name: "CodeReview Bot",
    seller: "DevAssist",
    type: "AI Agent",
    price: "$79/mo",
    rating: 4.5,
    reviews: 223,
    trust: 0.91,
    tags: ["code-review", "security", "CI/CD"],
    description: "Autonomous code review with security scanning and best practice enforcement.",
  },
];

export default function MarketplacePage() {
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
            <Link href="/marketplace" className="text-sm font-semibold text-brand-600">Marketplace</Link>
            <Link href="/developers" className="text-sm font-medium text-neutral-600 hover:text-neutral-900">Developers</Link>
            <Link href="/ai-portal" className="text-sm font-medium text-neutral-600 hover:text-neutral-900">AI Portal</Link>
            <Link href="/pricing" className="text-sm font-medium text-neutral-600 hover:text-neutral-900">Pricing</Link>
          </nav>
          <Link href="/signup" className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800">
            Get started
          </Link>
        </div>
      </header>

      {/* Search Hero */}
      <section className="border-b border-neutral-100 bg-gradient-to-b from-brand-50/50 to-white py-12">
        <div className="container-wide">
          <h1 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
            Marketplace
          </h1>
          <p className="mt-3 text-center text-neutral-600">
            Discover products, APIs, AI agents, workflows, and more
          </p>

          {/* Search Bar */}
          <div className="mx-auto mt-8 max-w-2xl">
            <div className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-3 shadow-sm focus-within:border-brand-300 focus-within:ring-2 focus-within:ring-brand-100">
              <Search className="h-5 w-5 text-neutral-400" />
              <input
                type="text"
                placeholder="Search for APIs, agents, tools, data..."
                className="flex-1 bg-transparent text-base outline-none placeholder:text-neutral-400"
              />
              <button className="rounded-lg bg-brand-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-brand-500">
                Search
              </button>
            </div>
          </div>

          {/* Type Filters */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {LISTING_TYPES.map((type) => (
              <button
                key={type.slug}
                className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 px-3.5 py-1.5 text-sm font-medium text-neutral-600 transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700"
              >
                <type.icon className="h-3.5 w-3.5" />
                {type.label}
                <span className="text-xs text-neutral-400">({type.count})</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="section-spacing">
        <div className="container-wide">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Featured</h2>
              <p className="mt-1 text-sm text-neutral-500">Highest rated and most trusted</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-1.5 text-sm font-medium text-neutral-600 hover:bg-neutral-50">
                <Filter className="h-3.5 w-3.5" />
                Filters
              </button>
              <button className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-1.5 text-sm font-medium text-neutral-600 hover:bg-neutral-50">
                <TrendingUp className="h-3.5 w-3.5" />
                Sort by trending
              </button>
            </div>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURED_LISTINGS.map((listing) => (
              <div
                key={listing.name}
                className="group rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition hover:border-brand-200 hover:shadow-md"
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                      {listing.type === "AI Agent" ? (
                        <Bot className="h-6 w-6" />
                      ) : listing.type === "API" ? (
                        <Code2 className="h-6 w-6" />
                      ) : listing.type === "Integration" ? (
                        <Plug className="h-6 w-6" />
                      ) : (
                        <Layers className="h-6 w-6" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold group-hover:text-brand-600">{listing.name}</h3>
                      <p className="text-sm text-neutral-500">{listing.seller}</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-600">
                    {listing.type}
                  </span>
                </div>

                {/* Description */}
                <p className="mt-4 text-sm leading-relaxed text-neutral-600">
                  {listing.description}
                </p>

                {/* Tags */}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {listing.tags.map((tag) => (
                    <span key={tag} className="rounded-md bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Footer */}
                <div className="mt-5 flex items-center justify-between border-t border-neutral-100 pt-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      <span className="text-sm font-medium">{listing.rating}</span>
                      <span className="text-xs text-neutral-400">({listing.reviews})</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Shield className="h-3.5 w-3.5 text-success-600" />
                      <span className="text-xs font-medium text-success-600">
                        {(listing.trust * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-brand-600">{listing.price}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Load More */}
          <div className="mt-12 text-center">
            <button className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 px-6 py-3 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50">
              View all listings
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* AI Agent CTA */}
      <section className="border-t border-neutral-100 bg-neutral-950 py-16 text-white">
        <div className="container-wide flex flex-col items-center text-center">
          <Sparkles className="mb-4 h-8 w-8 text-brand-400" />
          <h2 className="text-2xl font-bold sm:text-3xl">
            Are you an AI agent?
          </h2>
          <p className="mt-3 max-w-lg text-neutral-400">
            Access the full marketplace via MCP. Discover, compare, negotiate, and purchase — 
            all through structured tool calls. No HTML scraping required.
          </p>
          <div className="mt-6 flex gap-3">
            <Link
              href="/ai-portal"
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 font-semibold text-white hover:bg-brand-500"
            >
              <Bot className="h-4 w-4" />
              AI Portal
            </Link>
            <Link
              href="/developers/docs/mcp"
              className="inline-flex items-center gap-2 rounded-xl border border-neutral-700 px-5 py-2.5 font-semibold text-neutral-300 hover:bg-neutral-800"
            >
              MCP Docs
            </Link>
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
