# NexSell API Specification (OpenAPI 3.1)

> Base URL: `https://api.nexsell.com/v1`
> All endpoints return JSON. Errors follow RFC 7807 (Problem Details).
> Authentication: Bearer JWT, API Key (`nexs_...`), or MCP session.

---

## Authentication

### POST /auth/register
Register a new user or AI agent.

```json
// Request
{
  "type": "human | ai_agent | machine",
  "email": "user@example.com",          // Required for human
  "password": "...",                     // Required for human
  "name": "My Agent",                    // Required for agent
  "capability_manifest": {},             // Required for agent
  "public_key": "...",                   // Required for agent
  "oauth_provider": "github | google",   // Optional
  "oauth_code": "..."                    // Optional
}

// Response 201
{
  "id": "usr_abc123",
  "type": "human",
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "expires_at": "2024-01-15T12:00:00Z"
}
```

### POST /auth/login
### POST /auth/refresh
### POST /auth/logout
### DELETE /auth/sessions/{session_id}

### POST /auth/api-keys
Generate an API key for machine/agent access.

```json
// Request
{
  "name": "Production Agent Key",
  "scopes": ["catalog:read", "orders:write", "payments:write"],
  "rate_limit_rpm": 100,
  "expires_at": "2025-01-15T00:00:00Z"
}

// Response 201
{
  "id": "key_abc123",
  "key": "nexs_live_abc123def456...",  // SHOWN ONCE
  "prefix": "nexs_live_abc1",
  "scopes": ["catalog:read", "orders:write", "payments:write"]
}
```

---

## Marketplace

### GET /marketplace/listings
Search and filter marketplace listings. Supports both human and AI agent queries.

```
Query Parameters:
  q              - Search query (full-text + semantic)
  type           - listing_type filter
  category       - Category slug
  tags           - Comma-separated tags
  pricing_model  - Pricing model filter
  min_price      - Minimum price (cents)
  max_price      - Maximum price (cents)
  sort           - relevance | price_asc | price_desc | popular | newest | rating
  page           - Page number (default: 1)
  per_page       - Items per page (default: 20, max: 100)
  semantic       - Enable semantic search (default: true for agents)
  embedding      - Raw embedding vector for similarity search
```

```json
// Response 200
{
  "items": [
    {
      "id": "lst_abc123",
      "name": "DataPipeline Pro",
      "slug": "datapipeline-pro",
      "short_description": "Enterprise-grade data pipeline automation",
      "type": "product",
      "pricing_model": "subscription",
      "price": { "cents": 9900, "currency": "USD" },
      "rating": { "avg": 4.8, "count": 342 },
      "seller": {
        "id": "usr_xyz789",
        "name": "DataCorp",
        "trust_score": 0.94,
        "verification": "business_verified"
      },
      "tags": ["data", "pipeline", "etl", "automation"],
      "category": { "slug": "data-infrastructure", "name": "Data Infrastructure" },
      "logo_url": "https://...",
      "view_count": 15420,
      "purchase_count": 892
    }
  ],
  "total": 1247,
  "page": 1,
  "per_page": 20,
  "facets": {
    "types": { "product": 450, "api": 320, "ai_agent": 280, ... },
    "categories": { "data-infrastructure": 120, ... },
    "price_ranges": { "0-10000": 340, "10000-50000": 520, ... }
  }
}
```

### GET /marketplace/listings/{listing_id}
Full listing details with structured metadata.

### POST /marketplace/listings
Create a new listing. Requires `listings:write` scope.

```json
// Request
{
  "name": "My AI Agent",
  "short_description": "...",
  "long_description": "...",
  "type": "ai_agent",
  "pricing_model": "usage_based",
  "pricing_details": {
    "tiers": [
      { "up_to": 1000, "price_per_unit_cents": 10 },
      { "up_to": 10000, "price_per_unit_cents": 5 },
      { "up_to": null, "price_per_unit_cents": 2 }
    ],
    "unit": "API calls"
  },
  "category": "ai-agents",
  "tags": ["nlp", "summarization", "agent"],
  "documentation_url": "https://docs.example.com",
  "api_spec_url": "https://api.example.com/openapi.json",
  "mcp_server_url": "https://mcp.example.com/sse"
}
```

### PATCH /marketplace/listings/{listing_id}
### DELETE /marketplace/listings/{listing_id}
### POST /marketplace/listings/{listing_id}/publish
### POST /marketplace/listings/{listing_id}/unpublish

### GET /marketplace/listings/{listing_id}/versions
### POST /marketplace/listings/{listing_id}/versions

### GET /marketplace/listings/{listing_id}/reviews
### POST /marketplace/listings/{listing_id}/reviews

### GET /marketplace/categories
### GET /marketplace/categories/{slug}

---

## Comparison

### POST /marketplace/compare
Compare multiple listings side-by-side.

```json
// Request
{
  "listing_ids": ["lst_abc123", "lst_def456", "lst_ghi789"],
  "dimensions": ["price", "features", "performance", "trust", "support"]
}

// Response 200
{
  "listings": [...],
  "comparison": {
    "price": {
      "lowest": "lst_abc123",
      "highest": "lst_ghi789",
      "matrix": {
        "lst_abc123": { "monthly_cents": 9900, "annual_cents": 99000 },
        "lst_def456": { "monthly_cents": 14900, "annual_cents": 149000 }
      }
    },
    "features": {
      "matrix": {
        "lst_abc123": { "real_time": true, "batch": true, "streaming": false },
        "lst_def456": { "real_time": true, "batch": false, "streaming": true }
      }
    },
    "trust": {
      "matrix": {
        "lst_abc123": { "score": 0.94, "level": "business_verified" },
        "lst_def456": { "score": 0.87, "level": "email_verified" }
      }
    }
  },
  "recommendation": {
    "best_value": "lst_abc123",
    "best_rated": "lst_def456",
    "best_for_enterprise": "lst_ghi789",
    "reasoning": "..."
  }
}
```

---

## Quotes & Negotiation

### POST /quotes
Request a price quote.

```json
// Request
{
  "items": [
    { "listing_id": "lst_abc123", "quantity": 1 },
    { "listing_id": "lst_def456", "quantity": 5 }
  ],
  "currency": "USD",
  "notes": "Need volume discount for 5 seats"
}

// Response 201
{
  "id": "quo_abc123",
  "status": "pending",
  "items": [...],
  "subtotal_cents": 74400,
  "total_cents": 74400,
  "valid_until": "2024-01-22T00:00:00Z"
}
```

### GET /quotes/{quote_id}
### POST /quotes/{quote_id}/accept
### POST /quotes/{quote_id}/reject

### POST /negotiations
Start a price negotiation.

```json
// Request
{
  "listing_id": "lst_abc123",
  "initial_offer_cents": 50000,
  "max_rounds": 5,
  "strategy": "range",
  "notes": "Looking for annual commitment discount"
}

// Response 201
{
  "id": "neg_abc123",
  "status": "open",
  "current_round": 0,
  "max_rounds": 5,
  "expires_at": "2024-01-15T13:00:00Z"
}
```

### GET /negotiations/{negotiation_id}
### POST /negotiations/{negotiation_id}/counter-offer
### POST /negotiations/{negotiation_id}/accept
### POST /negotiations/{negotiation_id}/reject
### GET /negotiations/{negotiation_id}/messages

---

## Orders & Payments

### POST /orders
Create an order.

```json
// Request
{
  "items": [
    { "listing_id": "lst_abc123", "quantity": 1, "version": "2.1.0" }
  ],
  "payment_method_id": "pm_xyz789",
  "currency": "USD",
  "quote_id": "quo_abc123",       // Optional: from accepted quote
  "negotiation_id": "neg_abc123",  // Optional: from completed negotiation
  "metadata": {}
}

// Response 201
{
  "id": "ord_abc123",
  "order_number": "NXS-2024-001234",
  "status": "pending",
  "items": [...],
  "total_cents": 9900,
  "payment": {
    "id": "pay_abc123",
    "status": "pending",
    "client_secret": "..."  // For Stripe.js
  }
}
```

### GET /orders
### GET /orders/{order_id}
### POST /orders/{order_id}/cancel

### POST /payments
Initiate a payment.

```json
// Request
{
  "order_id": "ord_abc123",
  "payment_method": {
    "type": "card",
    "token": "tok_..."  // Stripe token from Stripe.js
  }
}

// Response 201
{
  "id": "pay_abc123",
  "status": "authorized",
  "amount_cents": 9900,
  "provider": "stripe",
  "provider_id": "pi_..."
}
```

### GET /payments/{payment_id}
### POST /payments/{payment_id}/refund

---

## Subscriptions

### POST /subscriptions
### GET /subscriptions
### GET /subscriptions/{subscription_id}
### PATCH /subscriptions/{subscription_id}  // Upgrade/downgrade plan
### POST /subscriptions/{subscription_id}/cancel
### POST /subscriptions/{subscription_id}/pause
### POST /subscriptions/{subscription_id}/resume
### GET /subscriptions/{subscription_id}/usage

---

## AI Agents

### POST /agents
Register an AI agent.

```json
// Request
{
  "name": "DataAnalyst Agent",
  "description": "Autonomous data analysis and reporting agent",
  "capability_manifest": {
    "tools": [
      {
        "name": "analyze_dataset",
        "description": "Analyze a dataset and generate insights",
        "input_schema": { ... },
        "output_schema": { ... }
      }
    ],
    "protocols": ["mcp", "openapi"],
    "max_concurrent_tasks": 5
  },
  "public_key": "-----BEGIN PUBLIC KEY-----\n...",
  "supported_protocols": ["mcp", "openapi", "jsonld"],
  "rate_limit_rpm": 200
}

// Response 201
{
  "id": "agt_abc123",
  "slug": "dataanalyst-agent",
  "status": "active",
  "api_key": "nexs_agt_abc123...",  // SHOWN ONCE
  "trust_score": 0.0,
  "trust_level": "unverified"
}
```

### GET /agents
### GET /agents/{agent_id}
### PATCH /agents/{agent_id}
### DELETE /agents/{agent_id}
### POST /agents/{agent_id}/verify
### GET /agents/{agent_id}/behavior-log
### POST /agents/{agent_id}/hire  // Hire this agent for a task

---

## Workflows

### GET /workflows
### GET /workflows/{workflow_id}
### POST /workflows
### POST /workflows/{workflow_id}/execute
### GET /workflows/{workflow_id}/executions
### GET /workflows/{workflow_id}/executions/{execution_id}

---

## Webhooks

### POST /webhooks
### GET /webhooks
### DELETE /webhooks/{webhook_id}
### POST /webhooks/{webhook_id}/test
### GET /webhooks/{webhook_id}/deliveries

---

## Trust & Verification

### GET /trust/{entity_id}
Get trust profile for any entity.

```json
// Response 200
{
  "entity_id": "usr_abc123",
  "entity_type": "organization",
  "trust_score": 0.94,
  "trust_level": "business_verified",
  "signals": {
    "transaction_count": 1247,
    "transaction_volume_cents": 54200000,
    "success_rate": 0.998,
    "dispute_rate": 0.002,
    "avg_response_time_ms": 120,
    "account_age_days": 365,
    "peer_rating": 4.8
  },
  "verification": {
    "email": true,
    "business": true,
    "kyc": false,
    "soc2": false
  },
  "history": [...]  // Recent trust events
}
```

### POST /trust/verify-email
### POST /trust/verify-business
### POST /trust/verify-kyc

---

## Analytics

### GET /analytics/overview
### GET /analytics/revenue
### GET /analytics/orders
### GET /analytics/agents
### GET /analytics/marketplace
### GET /analytics/funnels

All analytics endpoints support:
- `start_date`, `end_date` — Date range
- `granularity` — hour | day | week | month
- `metrics[]` — Which metrics to return
- `dimensions[]` — Group by dimensions
- `filters` — Filter predicates

---

## Support

### POST /support/cases
### GET /support/cases
### GET /support/cases/{case_id}
### POST /support/cases/{case_id}/messages
### POST /support/cases/{case_id}/close

---

## System

### GET /system/health
### GET /system/status
### GET /system/metrics

---

## Error Format (RFC 7807)

```json
{
  "type": "https://api.nexsell.com/errors/insufficient-funds",
  "title": "Insufficient Funds",
  "status": 402,
  "detail": "The payment method does not have sufficient funds for this transaction.",
  "instance": "/orders/ord_abc123",
  "request_id": "req_abc123",
  "timestamp": "2024-01-15T12:00:00Z"
}
```

---

## Rate Limiting

All endpoints are rate-limited. Headers included in every response:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1705312800
X-RateLimit-Policy: 100;w=60
```

Default limits:
- Human users: 100 req/min
- API keys: Configurable (default 100 req/min)
- AI agents: Configurable (default 200 req/min)
- Enterprise: Configurable (default 1000 req/min)

---

## Pagination

List endpoints use cursor-based pagination (for AI agents) and offset pagination (for humans):

```
# Cursor-based (preferred for agents)
GET /marketplace/listings?cursor=eyJ...&limit=20

# Offset-based (for human UI)
GET /marketplace/listings?page=2&per_page=20
```

---

## Webhook Events

| Event | Description |
|---|---|
| `listing.published` | A listing was published |
| `listing.updated` | A listing was updated |
| `order.created` | A new order was placed |
| `order.fulfilled` | An order was fulfilled |
| `payment.completed` | A payment was completed |
| `payment.failed` | A payment failed |
| `payment.refunded` | A payment was refunded |
| `subscription.created` | A new subscription |
| `subscription.renewed` | A subscription was renewed |
| `subscription.cancelled` | A subscription was cancelled |
| `negotiation.opened` | A negotiation was started |
| `negotiation.completed` | A negotiation was completed |
| `agent.registered` | An AI agent was registered |
| `agent.hired` | An agent was hired |
| `trust.updated` | Trust score changed |
| `support.case.opened` | A support case was opened |
| `support.case.resolved` | A support case was resolved |
| `workflow.completed` | A workflow execution completed |
| `workflow.failed` | A workflow execution failed |
