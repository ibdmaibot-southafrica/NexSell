import { NextResponse } from "next/server";

// /.well-known/nexsell-manifest
// Platform capabilities manifest for AI agent discovery
export async function GET() {
  const manifest = {
    platform: "NexSell",
    version: "1.0.0",
    description: "Autonomous AI commerce gateway — discover, negotiate, purchase, and manage everything via structured APIs",
    url: "https://nexsell.com",
    capabilities: {
      marketplace: true,
      negotiation: true,
      subscriptions: true,
      agent_registry: true,
      workflow_engine: true,
      trust_framework: true,
      multi_currency: true,
      autonomous_checkout: true,
      usage_billing: true,
      escrow: true,
      compliance: ["soc2", "gdpr", "ccpa", "pci_dss", "iso27001", "eu_ai_act"],
    },
    protocols: {
      mcp: {
        endpoint: "https://mcp.nexsell.com/sse",
        version: "2024-11-05",
        transport: "sse",
        tools_count: 30,
      },
      openapi: {
        endpoint: "https://api.nexsell.com/v1",
        spec: "https://api.nexsell.com/.well-known/openapi",
        version: "3.1.0",
      },
      graphql: {
        endpoint: "https://api.nexsell.com/graphql",
      },
      webhooks: {
        events: [
          "listing.published",
          "order.created",
          "order.fulfilled",
          "payment.completed",
          "payment.failed",
          "subscription.created",
          "subscription.renewed",
          "negotiation.opened",
          "negotiation.completed",
          "agent.registered",
          "agent.hired",
          "trust.updated",
        ],
      },
    },
    authentication: {
      methods: ["jwt", "api_key", "oauth2", "mcp_session", "mtls"],
      documentation: "https://docs.nexsell.com/auth",
    },
    listing_types: [
      "product",
      "api",
      "ai_agent",
      "workflow",
      "data_product",
      "consulting",
      "integration",
      "template",
      "subscription",
      "license",
    ],
    pricing_models: [
      "fixed",
      "range",
      "usage_based",
      "tiered",
      "subscription",
      "freemium",
      "auction",
      "negotiable",
    ],
  };

  return NextResponse.json(manifest, {
    headers: {
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
