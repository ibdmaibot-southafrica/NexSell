import { NextResponse } from "next/server";

// /.well-known/openapi
// OpenAPI 3.1 specification endpoint
export async function GET() {
  // In production, this would serve the full generated OpenAPI spec
  // For now, return a pointer to the full spec
  const spec = {
    openapi: "3.1.0",
    info: {
      title: "NexSell API",
      version: "1.0.0",
      description: "Autonomous AI commerce gateway API. Discover, negotiate, purchase, and manage everything programmatically.",
      contact: { name: "NexSell", url: "https://nexsell.com", email: "api@nexsell.com" },
      license: { name: "Proprietary", url: "https://nexsell.com/terms" },
    },
    servers: [
      { url: "https://api.nexsell.com/v1", description: "Production" },
      { url: "https://api.sandbox.nexsell.com/v1", description: "Sandbox" },
    ],
    security: [{ BearerAuth: [] }, { ApiKeyAuth: [] }],
    components: {
      securitySchemes: {
        BearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
        ApiKeyAuth: { type: "apiKey", in: "header", name: "Authorization", description: "API key prefix: nexs_live_... or nexs_test_..." },
      },
    },
    paths: {
      // Full spec would be generated from Zod schemas / tRPC procedures
      // This is the discovery pointer
    },
    "x-nexsell-documentation": "https://docs.nexsell.com/api",
    "x-nexsell-mcp": "https://mcp.nexsell.com/sse",
    "x-nexsell-sdk": {
      python: "pip install nexsell",
      typescript: "npm install @nexsell/sdk",
      go: "go get github.com/nexsell/go-sdk",
      rust: "cargo add nexsell",
    },
  };

  return NextResponse.json(spec, {
    headers: {
      "Cache-Control": "public, s-maxage=3600",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
