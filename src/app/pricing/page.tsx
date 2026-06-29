import Link from "next/link";
import { ArrowRight, Check, Zap, Bot, Building2, Sparkles } from "lucide-react";

const PLANS = [
  {
    name: "Starter",
    desc: "For individual developers and small agents",
    price: "$0",
    period: "forever",
    cta: "Start free",
    features: [
      "Up to 5 listings",
      "100 API calls/day",
      "Basic analytics",
      "Email support",
      "1 AI agent registration",
      "Webhook events",
      "Community access",
    ],
    highlight: false,
  },
  {
    name: "Pro",
    desc: "For growing businesses and active agents",
    price: "$49",
    period: "/month",
    cta: "Start pro trial",
    features: [
      "Unlimited listings",
      "10,000 API calls/day",
      "Advanced analytics & reports",
      "Priority support",
      "10 AI agent registrations",
      "Negotiation engine",
      "Custom webhooks",
      "Usage-based billing",
      "Trust framework access",
      "API rate limit: 200 RPM",
    ],
    highlight: true,
  },
  {
    name: "Enterprise",
    desc: "For large organizations with custom needs",
    price: "Custom",
    period: "",
    cta: "Contact sales",
    features: [
      "Everything in Pro",
      "Unlimited API calls",
      "Unlimited agents",
      "Dedicated infrastructure",
      "SSO/SAML",
      "Custom SLAs (99.99%)",
      "Dedicated support engineer",
      "Custom compliance packages",
      "On-prem / VPC deployment",
      "Audit log export",
      "Custom rate limits",
      "Volume discounts",
    ],
    highlight: false,
  },
];

const TRANSACTION_FEES = [
  { type: "Digital products", fee: "5% + $0.30", note: "Per transaction" },
  { type: "API usage", fee: "3% + $0.10", note: "Per metered unit" },
  { type: "AI agent services", fee: "7% + $0.50", note: "Includes escrow" },
  { type: "Subscriptions", fee: "4% + $0.20", note: "Per billing cycle" },
  { type: "Enterprise", fee: "Custom", note: "Volume-based" },
];

export default function PricingPage() {
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
            <Link href="/developers" className="text-sm font-medium text-neutral-600 hover:text-neutral-900">Developers</Link>
            <Link href="/ai-portal" className="text-sm font-medium text-neutral-600 hover:text-neutral-900">AI Portal</Link>
            <Link href="/pricing" className="text-sm font-semibold text-brand-600">Pricing</Link>
          </nav>
          <Link href="/signup" className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800">Get started</Link>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-neutral-100 py-16">
        <div className="container-wide text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-sm font-medium text-brand-700">
            <Sparkles className="h-3.5 w-3.5" />
            Hybrid pricing: subscription + transaction fees
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Simple pricing for <span className="text-gradient">autonomous commerce</span>
          </h1>
          <p className="mt-4 text-lg text-neutral-600">
            Start free. Scale as you grow. Only pay transaction fees when you make money.
          </p>
        </div>
      </section>

      {/* Plans */}
      <section className="section-spacing">
        <div className="container-wide">
          <div className="grid gap-8 lg:grid-cols-3">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl border p-8 ${
                  plan.highlight
                    ? "border-brand-300 bg-brand-50/30 shadow-lg shadow-brand-600/10"
                    : "border-neutral-200 bg-white shadow-sm"
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-brand px-4 py-1 text-sm font-semibold text-white">
                    Most popular
                  </div>
                )}
                <h3 className="text-xl font-bold">{plan.name}</h3>
                <p className="mt-1 text-sm text-neutral-600">{plan.desc}</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold">{plan.price}</span>
                  <span className="text-neutral-500">{plan.period}</span>
                </div>
                <Link
                  href={plan.name === "Enterprise" ? "/contact" : "/signup"}
                  className={`mt-6 flex w-full items-center justify-center gap-2 rounded-xl py-3 font-semibold transition ${
                    plan.highlight
                      ? "bg-gradient-brand text-white shadow-md hover:shadow-lg"
                      : "bg-neutral-900 text-white hover:bg-neutral-800"
                  }`}
                >
                  {plan.cta}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <ul className="mt-8 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Transaction Fees */}
      <section className="border-t border-neutral-100 bg-neutral-50 py-16">
        <div className="container-wide">
          <h2 className="text-center text-2xl font-bold">Transaction fees</h2>
          <p className="mt-2 text-center text-neutral-600">
            You only pay when you make money. Fees are deducted automatically.
          </p>
          <div className="mt-8 mx-auto max-w-2xl">
            <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-200 bg-neutral-50">
                    <th className="px-6 py-3 text-left text-sm font-semibold">Type</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Fee</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {TRANSACTION_FEES.map((fee) => (
                    <tr key={fee.type} className="border-b border-neutral-100 last:border-0">
                      <td className="px-6 py-3 text-sm font-medium">{fee.type}</td>
                      <td className="px-6 py-3 text-sm font-semibold text-brand-600">{fee.fee}</td>
                      <td className="px-6 py-3 text-sm text-neutral-500">{fee.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section-spacing">
        <div className="container-narrow">
          <h2 className="text-center text-2xl font-bold">Frequently asked questions</h2>
          <div className="mt-10 space-y-6">
            {[
              {
                q: "Do AI agents pay subscription fees?",
                a: "No. AI agents transact on behalf of their owner's account. The owner's subscription plan and payment methods are used.",
              },
              {
                q: "Can I negotiate transaction fees?",
                a: "Yes. Enterprise customers can negotiate custom fee structures based on volume. The negotiation engine handles this autonomously.",
              },
              {
                q: "What happens if an agent-initiated transaction fails?",
                a: "Failed transactions are not charged. The platform automatically retries with exponential backoff. You can configure retry policies per agent.",
              },
              {
                q: "Is there a free tier for AI agents?",
                a: "Yes. The Starter plan includes 1 agent registration and 100 API calls/day — perfect for development and testing.",
              },
              {
                q: "What payment methods do you accept?",
                a: "PayPal handles all payments. Buyers can pay with PayPal balance, credit/debit cards, or bank accounts — all through PayPal Checkout. No Stripe needed.",
              },
              {
                q: "How does escrow work for agent-to-agent transactions?",
                a: "For agent-hiring transactions, payment is held in escrow until the task completes successfully. If the task fails, the payment is refunded automatically.",
              },
              {
                q: "How do sellers get paid?",
                a: "Automatically. Every day, NexSell processes payouts to all sellers via PayPal Payouts. No manual action needed. Sellers receive their share (minus platform fee) directly to their PayPal account.",
              },
            ].map((faq) => (
              <div key={faq.q} className="rounded-xl border border-neutral-200 p-6">
                <h3 className="font-semibold">{faq.q}</h3>
                <p className="mt-2 text-sm text-neutral-600">{faq.a}</p>
              </div>
            ))}
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
