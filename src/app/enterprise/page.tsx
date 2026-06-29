import Link from "next/link";
import {
  ArrowRight,
  Check,
  Shield,
  Zap,
  Building2,
  Lock,
  FileCheck,
  Globe,
  Headphones,
  Server,
  Users,
} from "lucide-react";

export default function EnterprisePage() {
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
            <Link href="/enterprise" className="text-sm font-semibold text-brand-600">Enterprise</Link>
          </nav>
          <Link href="/contact" className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800">Contact sales</Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-neutral-100 py-20">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/3 h-[500px] w-[500px] rounded-full bg-brand-400/10 blur-[120px]" />
        </div>
        <div className="container-wide">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-sm font-medium text-brand-700">
              <Building2 className="h-3.5 w-3.5" />
              Enterprise
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
              Autonomous commerce at <span className="text-gradient">enterprise scale</span>
            </h1>
            <p className="mt-6 text-lg text-neutral-600">
              Dedicated infrastructure, custom SLAs, SSO/SAML, compliance packages, 
              and a dedicated support engineer. Built for organizations that need 
              autonomous commerce without compromise.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-brand px-6 py-3.5 font-semibold text-white shadow-lg hover:shadow-xl"
              >
                Talk to sales
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/enterprise/whitepaper"
                className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 px-6 py-3.5 font-semibold text-neutral-700 hover:bg-neutral-50"
              >
                Read the whitepaper
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise Features */}
      <section className="section-spacing">
        <div className="container-wide">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Shield, title: "SOC 2 Type II", desc: "Annual audit with continuous control monitoring. Compliance reports available on demand." },
              { icon: Lock, title: "SSO / SAML", desc: "Single sign-on with Okta, Azure AD, Ping, and any SAML 2.0 / OIDC provider." },
              { icon: Server, title: "Dedicated Infrastructure", desc: "Isolated compute, database, and storage. Schema-per-tenant or DB-per-tenant isolation." },
              { icon: Globe, title: "Data Residency", desc: "Pin data to specific regions. EU, US, APAC — meet local compliance requirements." },
              { icon: FileCheck, title: "Custom Compliance", desc: "GDPR, CCPA, HIPAA, PCI DSS, ISO 27001, EU AI Act. Pre-built packages or custom." },
              { icon: Headphones, title: "Dedicated Support", desc: "Named support engineer, 1-hour SLA for P1 issues, quarterly business reviews." },
              { icon: Users, title: "Multi-Tenant Teams", desc: "Organization hierarchies, RBAC + ABAC, audit logs, and admin dashboards." },
              { icon: Zap, title: "Custom SLAs", desc: "99.99% uptime guarantee. Custom RPO/RTO. Priority event processing." },
              { icon: Shield, title: "Zero Trust", desc: "Continuous validation, behavioral analysis, mTLS, secrets management via Vault." },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                <div className="mb-4 inline-flex rounded-xl bg-brand-50 p-3 text-brand-600">
                  <item.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-neutral-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-neutral-100 bg-neutral-950 py-16 text-white">
        <div className="container-narrow text-center">
          <h2 className="text-3xl font-bold">Ready to go enterprise?</h2>
          <p className="mt-4 text-neutral-400">
            Our solutions engineers will design a custom architecture for your organization.
          </p>
          <Link
            href="/contact"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3.5 font-semibold text-white hover:bg-brand-500"
          >
            Schedule a demo
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
