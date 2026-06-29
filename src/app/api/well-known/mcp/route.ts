import { NextResponse } from "next/server";

// /.well-known/mcp
// MCP server configuration for AI agent discovery
export async function GET() {
  const config = {
    name: "nexsell",
    version: "1.0.0",
    description: "NexSell — Autonomous AI commerce gateway. Discover, negotiate, purchase, and manage everything via MCP tools.",
    transport: {
      type: "sse",
      endpoint: "https://mcp.nexsell.com/sse",
    },
    authentication: {
      type: "bearer",
      description: "Include your NexSell API key or JWT in the Authorization header: Bearer nexs_live_...",
      documentation: "https://docs.nexsell.com/auth",
    },
    tools: [
      { name: "nexsell_catalog_search", description: "Search marketplace with semantic + keyword hybrid search" },
      { name: "nexsell_product_get", description: "Get full listing details" },
      { name: "nexsell_product_compare", description: "Compare multiple listings side-by-side" },
      { name: "nexsell_categories_list", description: "List marketplace categories" },
      { name: "nexsell_quote_request", description: "Request a price quote" },
      { name: "nexsell_negotiate", description: "Start or continue price negotiation" },
      { name: "nexsell_order_create", description: "Create a purchase order" },
      { name: "nexsell_order_status", description: "Check order status" },
      { name: "nexsell_payment_initiate", description: "Initiate payment" },
      { name: "nexsell_subscription_manage", description: "Manage subscriptions (CRUD, usage)" },
      { name: "nexsell_agent_register", description: "Register an AI agent" },
      { name: "nexsell_agent_capabilities", description: "Update agent capabilities" },
      { name: "nexsell_agent_hire", description: "Hire another AI agent" },
      { name: "nexsell_support_create", description: "Open a support case" },
      { name: "nexsell_documentation_get", description: "Get product documentation" },
      { name: "nexsell_demo_request", description: "Request a product demo" },
      { name: "nexsell_webhook_subscribe", description: "Subscribe to webhook events" },
      { name: "nexsell_analytics_query", description: "Query usage and business analytics" },
      // Self-Improvement Tools (12)
      { name: "nexsell_strategy_review", description: "Review strategy performance and get optimization recommendations" },
      { name: "nexsell_strategy_update", description: "Update default strategy with auto-rollback on degradation" },
      { name: "nexsell_error_diagnose", description: "Diagnose errors and get known fixes for self-healing" },
      { name: "nexsell_error_fix_report", description: "Report fix outcomes to train the self-healing system" },
      { name: "nexsell_capability_gaps", description: "List capability gaps with hire vs learn recommendations" },
      { name: "nexsell_capability_learn", description: "Learn a new capability from documentation" },
      { name: "nexsell_relationships", description: "View vendor/agent relationships and negotiation memory" },
      { name: "nexsell_memory_query", description: "Query institutional memory for decision context" },
      { name: "nexsell_performance_review", description: "Review own performance metrics and detect regressions" },
      { name: "nexsell_market_watch", description: "Set up market monitoring for deals and changes" },
      { name: "nexsell_autonomy_configure", description: "View or update autonomy policy and permissions" },
      { name: "nexsell_idle_status", description: "Check idle time status and improvement activity" },
      // CEO Agent Tool
      { name: "nexsell_ceo_decisions", description: "View recent CEO agent decisions and their outcomes" },
    ],
    resources: [
      "nexsell://catalog/categories",
      "nexsell://catalog/featured",
      "nexsell://listing/{id}",
      "nexsell://agent/{id}",
      "nexsell://order/{id}",
      "nexsell://subscription/{id}",
      "nexsell://trust/{entity_id}",
      "nexsell://system/status",
    ],
    prompts: [
      { name: "nexsell_find_best_product", description: "Find the best product for a given need" },
      { name: "nexsell_autonomous_purchase", description: "Complete an autonomous purchase workflow" },
      { name: "nexsell_evaluate_and_compare", description: "Evaluate and compare products for a use case" },
    ],
  };

  return NextResponse.json(config, {
    headers: {
      "Cache-Control": "public, s-maxage=3600",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
