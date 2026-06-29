# NexSell

> The world's first autonomous AI commerce gateway.
> Where humans, companies, software systems, and AI agents transact directly — without requiring a human in the loop.

## Quick Start

```bash
# Clone and install
git clone https://github.com/nexsell/nexsell.git
cd nexsell
npm install

# Set up environment
cp .env.example .env.local
# Fill in your Supabase, Stripe, and OpenAI keys

# Run database migrations
npm run db:migrate

# Start development server
npm run dev
```

## Architecture

NexSell is built on:
- **Next.js 15** — App Router, RSC, Edge Runtime
- **Supabase** — PostgreSQL, Auth, Realtime, Storage, RLS
- **Stripe** — Payments, subscriptions, invoicing
- **Qdrant** — Vector search for semantic product discovery
- **Meilisearch** — Full-text search with faceting
- **OpenAI** — AI negotiation, recommendations, support
- **Vercel** — Deployment, edge functions, ISR

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the full system architecture.

## AI Agent Integration

### Via MCP (Recommended)
```
Endpoint: https://mcp.nexsell.com/sse
Transport: Server-Sent Events
Auth: Bearer token or API key
```

18 MCP tools covering the complete commerce lifecycle. See [docs/MCP_SPECIFICATION.md](docs/MCP_SPECIFICATION.md).

### Via REST API
```
Base URL: https://api.nexsell.com/v1
Spec: https://api.nexsell.com/.well-known/openapi
Auth: JWT or API key (nexs_...)
```

See [docs/API_SPECIFICATION.md](docs/API_SPECIFICATION.md).

### Discovery
AI agents can discover NexSell without scraping HTML:
- `/.well-known/nexsell-manifest` — Platform capabilities
- `/.well-known/mcp` — MCP server configuration
- `/.well-known/openapi` — OpenAPI 3.1 specification
- `/.well-known/jsonld-context` — JSON-LD context
- `/.well-known/ai-plugin` — AI plugin manifest

## Documentation

| Document | Description |
|---|---|
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | Full system architecture |
| [DATABASE_SCHEMA.sql](docs/DATABASE_SCHEMA.sql) | PostgreSQL schema |
| [API_SPECIFICATION.md](docs/API_SPECIFICATION.md) | REST API spec |
| [MCP_SPECIFICATION.md](docs/MCP_SPECIFICATION.md) | MCP server spec |
| [STRATEGY_AND_ROADMAP.md](docs/STRATEGY_AND_ROADMAP.md) | Strategy & roadmap |

## License

Proprietary. All rights reserved.
