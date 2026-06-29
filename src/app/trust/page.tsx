import Link from "next/link";
import { Shield, Zap, CheckCircle2, Lock, FileText, Scale, Eye, Clock } from "lucide-react";

export default function TrustCenterPage() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-neutral-200 bg-white">
        <div className="container-wide flex items-center justify-between py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-brand">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold">NexSell</span>
          </Link>
          <span className="rounded-full border border-neutral-200 px-3 py-1 text-sm font-medium text-neutral-600">Trust Center</span>
        </div>
      </header>

      <section className="section-spacing">
        <div className="container-wide">
          <div className="mx-auto max-w-3xl">
            <h1 className="text-4xl font-extrabold tracking-tight">Trust Center</h1>
            <p className="mt-4 text-lg text-neutral-600">
              Security, compliance, and trust information for NexSell. 
              We believe transparency builds trust.
            </p>

            {/* Security Overview */}
            <div className="mt-12 space-y-8">
              <div>
                <h2 className="flex items-center gap-2 text-2xl font-bold">
                  <Shield className="h-6 w-6 text-brand-600" />
                  Security
                </h2>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {[
                    { title: "Zero Trust Architecture", desc: "Every request authenticated and authorized. Continuous validation, not just login-time." },
                    { title: "End-to-End Encryption", desc: "TLS 1.3 in transit, AES-256 at rest. All PII encrypted before storage." },
                    { title: "SOC 2 Type II", desc: "Annual audit with continuous control monitoring. Reports available under NDA." },
                    { title: "PCI DSS Level 1", desc: "Via Stripe SAQ-A. We never touch raw card data. All payment processing tokenized." },
                    { title: "Penetration Testing", desc: "Annual third-party pen tests. Critical findings remediated within 24 hours." },
                    { title: "Bug Bounty", desc: "Responsible disclosure program. Rewards for security vulnerabilities." },
                  ].map((item) => (
                    <div key={item.title} className="rounded-xl border border-neutral-200 p-5">
                      <h3 className="font-semibold">{item.title}</h3>
                      <p className="mt-1 text-sm text-neutral-600">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Compliance */}
              <div>
                <h2 className="flex items-center gap-2 text-2xl font-bold">
                  <Scale className="h-6 w-6 text-brand-600" />
                  Compliance
                </h2>
                <div className="mt-6 space-y-3">
                  {[
                    { framework: "SOC 2 Type II", status: "In Progress", icon: Clock },
                    { framework: "GDPR", status: "Compliant", icon: CheckCircle2 },
                    { framework: "CCPA", status: "Compliant", icon: CheckCircle2 },
                    { framework: "PCI DSS Level 1", status: "Compliant (via Stripe)", icon: CheckCircle2 },
                    { framework: "ISO 27001", status: "Planned (Q3 2026)", icon: Clock },
                    { framework: "EU AI Act", status: "Monitoring", icon: Eye },
                  ].map((item) => (
                    <div key={item.framework} className="flex items-center justify-between rounded-xl border border-neutral-200 p-4">
                      <div className="flex items-center gap-3">
                        <item.icon className={`h-5 w-5 ${item.status === "Compliant" || item.status.includes("Compliant") ? "text-success-600" : "text-neutral-400"}`} />
                        <span className="font-medium">{item.framework}</span>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                        item.status === "Compliant" || item.status.includes("Compliant")
                          ? "bg-success-50 text-success-700"
                          : "bg-neutral-100 text-neutral-600"
                      }`}>
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Data Practices */}
              <div>
                <h2 className="flex items-center gap-2 text-2xl font-bold">
                  <Lock className="h-6 w-6 text-brand-600" />
                  Data Practices
                </h2>
                <div className="mt-6 space-y-4 text-neutral-600">
                  <p>We collect the minimum data necessary to operate the platform. Our data practices:</p>
                  <ul className="ml-4 list-disc space-y-2">
                    <li>PII is encrypted at rest using AES-256 via pgcrypto</li>
                    <li>API keys are stored as SHA-256 hashes — we cannot recover the original key</li>
                    <li>Payment card data never touches our servers (Stripe handles all card data)</li>
                    <li>Audit logs are immutable and append-only</li>
                    <li>Data retention policies are enforced automatically per data class</li>
                    <li>Right to erasure (GDPR Article 17) supported via self-service or API</li>
                    <li>Data portability (GDPR Article 20) via JSON export</li>
                    <li>No data sold to third parties, ever</li>
                  </ul>
                </div>
              </div>

              {/* Documents */}
              <div>
                <h2 className="flex items-center gap-2 text-2xl font-bold">
                  <FileText className="h-6 w-6 text-brand-600" />
                  Documents
                </h2>
                <div className="mt-6 space-y-3">
                  {[
                    { name: "Privacy Policy", url: "/privacy" },
                    { name: "Terms of Service", url: "/terms" },
                    { name: "Data Processing Agreement (DPA)", url: "/legal/dpa" },
                    { name: "Subprocessor List", url: "/legal/subprocessors" },
                    { name: "Security Whitepaper", url: "/trust/security-whitepaper" },
                    { name: "SOC 2 Report (under NDA)", url: "/trust/soc2" },
                  ].map((doc) => (
                    <Link
                      key={doc.name}
                      href={doc.url}
                      className="flex items-center justify-between rounded-xl border border-neutral-200 p-4 transition hover:bg-neutral-50"
                    >
                      <span className="font-medium">{doc.name}</span>
                      <span className="text-sm text-brand-600">View →</span>
                    </Link>
                  ))}
                </div>
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
