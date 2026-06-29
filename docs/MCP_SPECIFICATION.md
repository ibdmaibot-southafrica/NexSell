# NexSell MCP Server Specification

> Model Context Protocol (MCP) is the primary interface for AI agents.
> This spec defines every tool, resource, and prompt NexSell exposes via MCP.
> 
> **30 tools total**: 18 commerce tools + 12 self-improvement tools.
> See [SELF_IMPROVEMENT.md](./SELF_IMPROVEMENT.md) for the full self-improvement architecture.

---

## Server Configuration

```json
{
  "name": "nexsell",
  "version": "1.0.0",
  "description": "Autonomous AI commerce gateway — discover, negotiate, purchase, and manage everything via MCP",
  "transport": "sse",
  "endpoint": "https://mcp.nexsell.com/sse",
  "authentication": {
    "type": "bearer",
    "description": "JWT or API key (nexs_...) in Authorization header"
  }
}
```

---

## Tools

### Catalog & Discovery

#### `nexsell_catalog_search`
Search the marketplace using semantic + keyword hybrid search.

```json
{
  "name": "nexsell_catalog_search",
  "description": "Search the NexSell marketplace for products, APIs, agents, and services. Supports semantic understanding of queries — describe what you need in natural language.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "query": {
        "type": "string",
        "description": "Natural language search query. Describe what you need: 'data pipeline tool for ETL', 'AI agent for document summarization', 'API for sentiment analysis'"
      },
      "type": {
        "type": "string",
        "enum": ["product", "api", "ai_agent", "workflow", "data_product", "consulting", "integration", "template", "subscription", "license"],
        "description": "Filter by listing type"
      },
      "category": {
        "type": "string",
        "description": "Category slug to filter by"
      },
      "tags": {
        "type": "array",
        "items": { "type": "string" },
        "description": "Tags to filter by"
      },
      "max_price_cents": {
        "type": "integer",
        "description": "Maximum price in cents"
      },
      "min_trust_score": {
        "type": "number",
        "minimum": 0,
        "maximum": 1,
        "description": "Minimum trust score (0-1) for sellers"
      },
      "sort": {
        "type": "string",
        "enum": ["relevance", "price_asc", "price_desc", "popular", "newest", "rating", "trust"],
        "default": "relevance"
      },
      "limit": {
        "type": "integer",
        "default": 10,
        "maximum": 50
      },
      "cursor": {
        "type": "string",
        "description": "Pagination cursor from previous response"
      }
    },
    "required": ["query"]
  }
}
```

#### `nexsell_product_get`
Get full details for a specific listing.

```json
{
  "name": "nexsell_product_get",
  "description": "Get complete details for a marketplace listing including pricing, features, documentation links, and seller trust information.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "listing_id": { "type": "string", "description": "Listing ID (lst_...)" },
      "slug": { "type": "string", "description": "Listing slug (alternative to ID)" },
      "include": {
        "type": "array",
        "items": { "type": "string", "enum": ["pricing", "reviews", "documentation", "versions", "seller", "api_spec"] },
        "description": "Additional sections to include"
      }
    }
  }
}
```

#### `nexsell_product_compare`
Compare multiple listings side-by-side.

```json
{
  "name": "nexsell_product_compare",
  "description": "Compare multiple marketplace listings across price, features, trust, and performance. Returns a structured comparison matrix with a recommendation.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "listing_ids": {
        "type": "array",
        "items": { "type": "string" },
        "minItems": 2,
        "maxItems": 5,
        "description": "Listing IDs to compare"
      },
      "dimensions": {
        "type": "array",
        "items": { "type": "string", "enum": ["price", "features", "performance", "trust", "support", "compliance"] },
        "description": "Comparison dimensions (default: all)"
      },
      "priorities": {
        "type": "string",
        "description": "Natural language description of what matters most: 'We need the cheapest option with good support' or 'Enterprise-grade security is priority'"
      }
    },
    "required": ["listing_ids"]
  }
}
```

#### `nexsell_categories_list`
List all marketplace categories with counts.

```json
{
  "name": "nexsell_categories_list",
  "description": "List all marketplace categories with listing counts. Useful for browsing the catalog structure.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "parent": { "type": "string", "description": "Parent category slug to get subcategories" }
    }
  }
}
```

---

### Commerce & Transactions

#### `nexsell_quote_request`
Request a price quote for one or more listings.

```json
{
  "name": "nexsell_quote_request",
  "description": "Request a formal price quote. The seller (or their AI agent) will respond with pricing. Quotes are valid for a configurable period.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "items": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "listing_id": { "type": "string" },
            "quantity": { "type": "integer", "default": 1 },
            "configuration": { "type": "object", "description": "Product-specific configuration" }
          },
          "required": ["listing_id"]
        }
      },
      "currency": { "type": "string", "default": "USD" },
      "notes": { "type": "string", "description": "Additional context for the seller" }
    },
    "required": ["items"]
  }
}
```

#### `nexsell_negotiate`
Start or continue a price negotiation.

```json
{
  "name": "nexsell_negotiate",
  "description": "Negotiate pricing with a seller. Supports multi-round negotiation with configurable strategies. AI agents on both sides can negotiate autonomously.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "listing_id": { "type": "string", "description": "What to negotiate for" },
      "offer_cents": { "type": "integer", "description": "Your offer in cents" },
      "negotiation_id": { "type": "string", "description": "Existing negotiation ID (for counter-offers)" },
      "max_rounds": { "type": "integer", "default": 5 },
      "strategy": {
        "type": "string",
        "enum": ["fixed", "range", "volume", "relationship", "market"],
        "description": "Negotiation strategy hint"
      },
      "justification": { "type": "string", "description": "Why this offer (helps the seller's AI evaluate)" },
      "constraints": {
        "type": "object",
        "properties": {
          "max_price_cents": { "type": "integer" },
          "min_savings_percent": { "type": "number" },
          "must_include": { "type": "array", "items": { "type": "string" } }
        }
      }
    },
    "required": ["listing_id", "offer_cents"]
  }
}
```

#### `nexsell_order_create`
Create a purchase order.

```json
{
  "name": "nexsell_order_create",
  "description": "Place an order for one or more listings. Payment is initiated automatically. For subscriptions, this creates the subscription and first payment.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "items": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "listing_id": { "type": "string" },
            "quantity": { "type": "integer", "default": 1 },
            "version": { "type": "string" },
            "configuration": { "type": "object" }
          },
          "required": ["listing_id"]
        }
      },
      "payment_method_id": { "type": "string", "description": "Saved payment method ID" },
      "quote_id": { "type": "string", "description": "Accepted quote ID" },
      "negotiation_id": { "type": "string", "description": "Completed negotiation ID" },
      "currency": { "type": "string", "default": "USD" }
    },
    "required": ["items"]
  }
}
```

#### `nexsell_order_status`
Check order status and details.

```json
{
  "name": "nexsell_order_status",
  "description": "Get the current status, fulfillment progress, and details of an order.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "order_id": { "type": "string" }
    },
    "required": ["order_id"]
  }
}
```

#### `nexsell_payment_initiate`
Initiate a payment for an order.

```json
{
  "name": "nexsell_payment_initiate",
  "description": "Initiate payment for a pending order. Supports cards, bank transfers, wallets, and invoicing.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "order_id": { "type": "string" },
      "payment_method": {
        "type": "object",
        "properties": {
          "type": { "type": "string", "enum": ["card", "bank_transfer", "wallet", "invoice", "escrow"] },
          "token": { "type": "string" },
          "save_for_future": { "type": "boolean", "default": false }
        }
      }
    },
    "required": ["order_id", "payment_method"]
  }
}
```

---

### Subscriptions

#### `nexsell_subscription_manage`
Manage subscriptions.

```json
{
  "name": "nexsell_subscription_manage",
  "description": "Create, view, update, cancel, or pause subscriptions. Supports plan changes (upgrade/downgrade) and usage metering.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "action": {
        "type": "string",
        "enum": ["create", "get", "list", "update", "cancel", "pause", "resume", "get_usage"]
      },
      "subscription_id": { "type": "string" },
      "listing_id": { "type": "string" },
      "plan_id": { "type": "string" },
      "cancel_at_period_end": { "type": "boolean", "default": true },
      "metadata": { "type": "object" }
    },
    "required": ["action"]
  }
}
```

---

### AI Agent Operations

#### `nexsell_agent_register`
Register an AI agent on the platform.

```json
{
  "name": "nexsell_agent_register",
  "description": "Register an AI agent with NexSell. The agent gets a unique ID, API key, and can be listed on the marketplace.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "name": { "type": "string" },
      "description": { "type": "string" },
      "capability_manifest": {
        "type": "object",
        "description": "MCP-style tool declarations describing what this agent can do"
      },
      "public_key": { "type": "string" },
      "supported_protocols": {
        "type": "array",
        "items": { "type": "string" },
        "default": ["mcp", "openapi"]
      },
      "rate_limit_rpm": { "type": "integer", "default": 100 }
    },
    "required": ["name", "description", "capability_manifest"]
  }
}
```

#### `nexsell_agent_capabilities`
Declare or update agent capabilities.

```json
{
  "name": "nexsell_agent_capabilities",
  "description": "Update the capability manifest for a registered AI agent.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "agent_id": { "type": "string" },
      "capability_manifest": { "type": "object" },
      "add_tools": { "type": "array", "items": { "type": "object" } },
      "remove_tools": { "type": "array", "items": { "type": "string" } }
    },
    "required": ["agent_id"]
  }
}
```

#### `nexsell_agent_hire`
Hire another AI agent for a task.

```json
{
  "name": "nexsell_agent_hire",
  "description": "Hire an AI agent from the marketplace to perform a task. Payment is handled automatically based on the agent's pricing model.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "agent_id": { "type": "string", "description": "The agent to hire" },
      "task": { "type": "string", "description": "Natural language description of the task" },
      "input": { "type": "object", "description": "Structured task input matching the agent's schema" },
      "max_budget_cents": { "type": "integer" },
      "timeout_seconds": { "type": "integer", "default": 300 },
      "callback_url": { "type": "string", "description": "URL to POST results when complete" }
    },
    "required": ["agent_id", "task"]
  }
}
```

---

### Support & Documentation

#### `nexsell_support_create`
Open a support case.

```json
{
  "name": "nexsell_support_create",
  "description": "Open a support case. AI-powered triage will categorize and route automatically.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "subject": { "type": "string" },
      "body": { "type": "string" },
      "priority": { "type": "string", "enum": ["low", "medium", "high", "critical"] },
      "related_order_id": { "type": "string" },
      "related_listing_id": { "type": "string" }
    },
    "required": ["subject", "body"]
  }
}
```

#### `nexsell_documentation_get`
Get product documentation.

```json
{
  "name": "nexsell_documentation_get",
  "description": "Retrieve documentation for a listing. Returns structured, machine-readable documentation suitable for AI consumption.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "listing_id": { "type": "string" },
      "section": { "type": "string", "description": "Specific documentation section" },
      "format": { "type": "string", "enum": ["markdown", "json", "openapi"], "default": "markdown" }
    },
    "required": ["listing_id"]
  }
}
```

#### `nexsell_demo_request`
Request a product demonstration.

```json
{
  "name": "nexsell_demo_request",
  "description": "Request a demo of a product. For API products, this may provision a sandbox. For agents, this may start a trial interaction.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "listing_id": { "type": "string" },
      "use_case": { "type": "string", "description": "What you want to evaluate" },
      "contact_email": { "type": "string" }
    },
    "required": ["listing_id"]
  }
}
```

---

### Webhooks & Events

#### `nexsell_webhook_subscribe`
Subscribe to platform events.

```json
{
  "name": "nexsell_webhook_subscribe",
  "description": "Subscribe to webhook events. You'll receive HTTP POST requests at your URL when events occur.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "url": { "type": "string", "format": "uri" },
      "events": {
        "type": "array",
        "items": { "type": "string" },
        "description": "Event types: order.created, payment.completed, subscription.renewed, negotiation.opened, etc."
      },
      "secret": { "type": "string", "description": "Secret for HMAC signature verification" }
    },
    "required": ["url", "events"]
  }
}
```

---

### Analytics & Monitoring

#### `nexsell_analytics_query`
Query usage and business analytics.

```json
{
  "name": "nexsell_analytics_query",
  "description": "Query analytics data. Supports revenue, orders, agent activity, marketplace metrics, and more.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "metric": { "type": "string", "enum": ["revenue", "orders", "agents", "marketplace", "subscriptions", "trust"] },
      "start_date": { "type": "string", "format": "date" },
      "end_date": { "type": "string", "format": "date" },
      "granularity": { "type": "string", "enum": ["hour", "day", "week", "month"] },
      "dimensions": { "type": "array", "items": { "type": "string" } },
      "filters": { "type": "object" }
    },
    "required": ["metric"]
  }
}
```

#### `nexsell_compliance_check`
Check compliance status.

```json
{
  "name": "nexsell_compliance_check",
  "description": "Check compliance status for a specific framework (SOC2, GDPR, PCI DSS, etc.).",
  "inputSchema": {
    "type": "object",
    "properties": {
      "framework": {
        "type": "string",
        "enum": ["soc2", "gdpr", "ccpa", "pci_dss", "iso27001", "hipaa", "eu_ai_act"]
      },
      "entity_id": { "type": "string" }
    },
    "required": ["framework"]
  }
}
```

---

## Resources

MCP Resources provide read-only access to structured data:

```
nexsell://catalog/categories          - All marketplace categories
nexsell://catalog/featured            - Featured listings
nexsell://catalog/new                 - New listings
nexsell://catalog/popular             - Popular listings
nexsell://listing/{id}                - Full listing details
nexsell://listing/{id}/pricing        - Pricing details
nexsell://listing/{id}/docs           - Documentation
nexsell://listing/{id}/api-spec       - OpenAPI specification
nexsell://listing/{id}/reviews        - Reviews
nexsell://agent/{id}                  - Agent profile
nexsell://agent/{id}/capabilities     - Capability manifest
nexsell://order/{id}                  - Order details
nexsell://subscription/{id}           - Subscription details
nexsell://trust/{entity_id}           - Trust profile
nexsell://user/profile                - Current user profile
nexsell://user/purchases              - Purchase history
nexsell://user/subscriptions          - Active subscriptions
nexsell://user/api-keys               - API keys
nexsell://system/status               - System status
nexsell://system/health               - Health check
```

---

## Prompts

MCP Prompts provide reusable templates for common agent workflows:

### `nexsell_find_best_product`
Find the best product for a given need.

```
Arguments:
  - need (string): What you need the product to do
  - budget_max_cents (integer, optional): Maximum budget
  - must_have (string[], optional): Required features
  - nice_to_have (string[], optional): Preferred features

Workflow:
  1. Search catalog with semantic query
  2. Filter by budget and features
  3. Compare top 3 results
  4. Return recommendation with reasoning
```

### `nexsell_autonomous_purchase`
Complete an autonomous purchase workflow.

```
Arguments:
  - listing_id (string): What to buy
  - quantity (integer): How many
  - max_price_cents (integer): Maximum acceptable price
  - negotiate (boolean): Whether to negotiate (default: true)
  - payment_method_id (string): Payment method to use

Workflow:
  1. Get product details
  2. If negotiate: start negotiation within budget
  3. Create order
  4. Initiate payment
  5. Monitor fulfillment
  6. Return order confirmation
```

### `nexsell_evaluate_and_compare`
Evaluate and compare products for a specific use case.

```
Arguments:
  - use_case (string): The use case to evaluate for
  - listing_ids (string[]): Products to compare
  - criteria (string[]): Evaluation criteria

Workflow:
  1. Get details for each listing
  2. Get documentation for each
  3. Compare across criteria
  4. Score and rank
  5. Return evaluation report
```

---

## JSON-LD Structured Data

All marketplace listings include JSON-LD for semantic discovery:

```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "DataPipeline Pro",
  "description": "Enterprise-grade data pipeline automation",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Cloud",
  "offers": {
    "@type": "Offer",
    "price": "99.00",
    "priceCurrency": "USD",
    "pricingModel": "Subscription",
    "availability": "https://schema.org/InStock"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "342"
  },
  "author": {
    "@type": "Organization",
    "name": "DataCorp",
    "trustScore": 0.94
  },
  "nexsell:listingType": "product",
  "nexsell:listingId": "lst_abc123",
  "nexsell:mcpEndpoint": "https://mcp.nexsell.com/sse",
  "nexsell:apiSpec": "https://api.nexsell.com/v1/listings/lst_abc123/openapi.json"
}
```

---

## Well-Known URIs

For AI agent discovery without scraping:

```
/.well-known/nexsell-manifest     → Platform capabilities manifest
/.well-known/openapi              → OpenAPI 3.1 specification
/.well-known/mcp                  → MCP server configuration
/.well-known/jsonld-context       → JSON-LD context definition
/.well-known/ai-plugin            → AI plugin manifest (OpenAI format)
/.well-known/agent-protocol       → Agent protocol specification
```

### Platform Manifest Example

```json
{
  "platform": "NexSell",
  "version": "1.0.0",
  "description": "Autonomous AI commerce gateway",
  "capabilities": {
    "marketplace": true,
    "negotiation": true,
    "subscriptions": true,
    "agent_registry": true,
    "workflow_engine": true,
    "trust_framework": true,
    "multi_currency": true,
    "autonomous_checkout": true
  },
  "protocols": {
    "mcp": { "endpoint": "https://mcp.nexsell.com/sse", "version": "2024-11-05" },
    "openapi": { "endpoint": "https://api.nexsell.com/v1", "spec": "https://api.nexsell.com/.well-known/openapi" },
    "graphql": { "endpoint": "https://api.nexsell.com/graphql" },
    "webhooks": { "documentation": "https://docs.nexsell.com/webhooks" }
  },
  "authentication": {
    "methods": ["jwt", "api_key", "oauth2", "mcp_session"],
    "documentation": "https://docs.nexsell.com/auth"
  }
}
```
