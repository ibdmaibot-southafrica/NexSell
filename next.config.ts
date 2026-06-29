import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
    optimisticClientCache: true,
    ppr: "incremental",
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.nexsell.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "cdn.jsdelivr.net" },
    ],
  },
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      ],
    },
    {
      source: "/api/(.*)",
      headers: [
        { key: "X-RateLimit-Policy", value: "100;w=60" },
      ],
    },
  ],
  rewrites: async () => [
    { source: "/.well-known/nexsell-manifest", destination: "/api/well-known/manifest" },
    { source: "/.well-known/openapi", destination: "/api/well-known/openapi" },
    { source: "/.well-known/mcp", destination: "/api/well-known/mcp" },
    { source: "/.well-known/jsonld-context", destination: "/api/well-known/jsonld-context" },
    { source: "/.well-known/ai-plugin", destination: "/api/well-known/ai-plugin" },
  ],
};

export default nextConfig;
