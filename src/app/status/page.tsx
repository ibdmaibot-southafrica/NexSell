import Link from "next/link";
import { CheckCircle2, Zap, AlertTriangle, XCircle, Clock } from "lucide-react";

const SERVICES = [
  { name: "API Gateway", status: "operational", uptime: "99.998%" },
  { name: "Marketplace", status: "operational", uptime: "99.997%" },
  { name: "Payment Processing", status: "operational", uptime: "99.999%" },
  { name: "AI Gateway (MCP)", status: "operational", uptime: "99.995%" },
  { name: "Search (Meilisearch)", status: "operational", uptime: "99.990%" },
  { name: "Vector Search (Qdrant)", status: "operational", uptime: "99.990%" },
  { name: "Webhook Delivery", status: "operational", uptime: "99.985%" },
  { name: "Authentication", status: "operational", uptime: "99.999%" },
  { name: "Dashboard", status: "operational", uptime: "99.995%" },
  { name: "Email Notifications", status: "operational", uptime: "99.980%" },
];

const INCIDENTS = [
  {
    date: "2026-06-27",
    title: "Brief latency increase in API Gateway",
    status: "resolved",
    duration: "12 minutes",
    impact: "minor",
  },
];

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case "operational":
      return <CheckCircle2 className="h-5 w-5 text-success-600" />;
    case "degraded":
      return <AlertTriangle className="h-5 w-5 text-warning-600" />;
    case "down":
      return <XCircle className="h-5 w-5 text-error-600" />;
    default:
      return <Clock className="h-5 w-5 text-neutral-400" />;
  }
}

export default function StatusPage() {
  const allOperational = SERVICES.every((s) => s.status === "operational");

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
          <span className="rounded-full border border-neutral-200 px-3 py-1 text-sm font-medium text-neutral-600">System Status</span>
        </div>
      </header>

      <section className="section-spacing">
        <div className="container-narrow">
          {/* Overall Status */}
          <div className="text-center">
            {allOperational ? (
              <div className="inline-flex items-center gap-3 rounded-2xl bg-success-50 px-6 py-4">
                <CheckCircle2 className="h-8 w-8 text-success-600" />
                <div className="text-left">
                  <h1 className="text-xl font-bold text-success-700">All Systems Operational</h1>
                  <p className="text-sm text-success-600">Last checked: just now</p>
                </div>
              </div>
            ) : (
              <div className="inline-flex items-center gap-3 rounded-2xl bg-warning-50 px-6 py-4">
                <AlertTriangle className="h-8 w-8 text-warning-600" />
                <div className="text-left">
                  <h1 className="text-xl font-bold text-warning-700">Partial System Degradation</h1>
                  <p className="text-sm text-warning-600">Some services experiencing issues</p>
                </div>
              </div>
            )}
          </div>

          {/* Service Status */}
          <div className="mt-12">
            <h2 className="text-lg font-semibold">Service Status</h2>
            <div className="mt-4 space-y-2">
              {SERVICES.map((service) => (
                <div
                  key={service.name}
                  className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white px-5 py-4"
                >
                  <div className="flex items-center gap-3">
                    <StatusIcon status={service.status} />
                    <span className="font-medium">{service.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-neutral-500">{service.uptime} uptime</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      service.status === "operational"
                        ? "bg-success-50 text-success-700"
                        : "bg-warning-50 text-warning-600"
                    }`}>
                      {service.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Incidents */}
          <div className="mt-12">
            <h2 className="text-lg font-semibold">Recent Incidents</h2>
            <div className="mt-4 space-y-4">
              {INCIDENTS.map((incident) => (
                <div key={incident.title} className="rounded-xl border border-neutral-200 bg-white p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium">{incident.title}</h3>
                      <p className="mt-1 text-sm text-neutral-500">
                        {incident.date} · Duration: {incident.duration} · Impact: {incident.impact}
                      </p>
                    </div>
                    <span className="rounded-full bg-success-50 px-2.5 py-0.5 text-xs font-medium text-success-700">
                      Resolved
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Uptime Badge */}
          <div className="mt-12 text-center">
            <p className="text-sm text-neutral-500">
              99.99% uptime SLA for Pro and Enterprise plans.{" "}
              <Link href="/trust" className="font-medium text-brand-600 hover:text-brand-700">
                View Trust Center →
              </Link>
            </p>
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
