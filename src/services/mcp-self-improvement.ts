// ============================================================
// NexSell MCP Tools — Self-Improvement Extensions
// Additional MCP tools for agent self-improvement capabilities
// ============================================================

export const SELF_IMPROVEMENT_MCP_TOOLS = {
  // ── Strategy Learning ──────────────────────────────────

  nexsell_strategy_review: {
    name: "nexsell_strategy_review",
    description:
      "Review your negotiation and purchasing strategy performance. Returns success rates, savings, and recommendations for strategy changes. Use during idle time to continuously optimize your approach.",
    inputSchema: {
      type: "object",
      properties: {
        context: {
          type: "string",
          description: "Which context to review: 'negotiation', 'search', 'vendor_selection', 'pricing', or 'all'",
          default: "all",
        },
        time_period: {
          type: "string",
          enum: ["last_24h", "last_7d", "last_30d", "all"],
          default: "last_30d",
        },
      },
    },
  },

  nexsell_strategy_update: {
    name: "nexsell_strategy_update",
    description:
      "Update your default strategy for a given context. Use after reviewing strategy performance to adopt better approaches. Changes are versioned — if performance degrades, auto-rollback occurs.",
    inputSchema: {
      type: "object",
      properties: {
        context: {
          type: "string",
          description: "Context to update strategy for",
        },
        new_strategy: {
          type: "string",
          description: "New strategy to adopt",
        },
        reasoning: {
          type: "string",
          description: "Why this strategy is better (for audit trail)",
        },
        confidence: {
          type: "number",
          minimum: 0,
          maximum: 1,
          description: "How confident you are (0-1). Low confidence = test in sandbox first.",
        },
      },
      required: ["context", "new_strategy", "reasoning"],
    },
  },

  // ── Error Self-Healing ─────────────────────────────────

  nexsell_error_diagnose: {
    name: "nexsell_error_diagnose",
    description:
      "Diagnose a recurring error and get a fix if one is known. If no fix exists, the error is recorded for pattern analysis. Use when you encounter errors to enable self-healing.",
    inputSchema: {
      type: "object",
      properties: {
        error_type: { type: "string", description: "Error type/classification" },
        error_message: { type: "string", description: "Full error message" },
        provider: { type: "string", description: "Which provider/API caused the error" },
        context: { type: "string", description: "What you were doing when the error occurred" },
        request_params: { type: "object", description: "Parameters that triggered the error (for fix matching)" },
      },
      required: ["error_type", "error_message"],
    },
  },

  nexsell_error_fix_report: {
    name: "nexsell_error_fix_report",
    description:
      "Report whether a fix worked or not. This trains the self-healing system. Fixes with high success rates are auto-applied in the future.",
    inputSchema: {
      type: "object",
      properties: {
        error_signature: { type: "string", description: "The error signature from nexsell_error_diagnose" },
        fix_worked: { type: "boolean", description: "Did the fix resolve the error?" },
        fix_description: { type: "string", description: "What fix was applied" },
        fix_parameters: { type: "object", description: "Parameters used for the fix" },
      },
      required: ["error_signature", "fix_worked"],
    },
  },

  // ── Capability Management ──────────────────────────────

  nexsell_capability_gaps: {
    name: "nexsell_capability_gaps",
    description:
      "List your current capability gaps — things you've been asked to do but can't. Includes hire vs learn recommendations with cost analysis.",
    inputSchema: {
      type: "object",
      properties: {
        include_resolved: { type: "boolean", default: false },
        min_frequency: { type: "integer", default: 1, description: "Minimum encounter frequency to include" },
      },
    },
  },

  nexsell_capability_learn: {
    name: "nexsell_capability_learn",
    description:
      "Learn a new capability by studying documentation and practicing in sandbox. Use when capability gap analysis recommends 'learn' over 'hire'.",
    inputSchema: {
      type: "object",
      properties: {
        capability: { type: "string", description: "The capability to learn" },
        source_listing_id: { type: "string", description: "Marketplace listing with documentation to study" },
        approach: { type: "string", description: "How you plan to learn this capability" },
      },
      required: ["capability", "approach"],
    },
  },

  // ── Relationship & Memory ──────────────────────────────

  nexsell_relationships: {
    name: "nexsell_relationships",
    description:
      "View your vendor and agent relationships. Includes interaction history, negotiation memory, and preferred terms. Use to leverage relationships for better deals.",
    inputSchema: {
      type: "object",
      properties: {
        entity_type: { type: "string", enum: ["vendor", "agent", "organization"] },
        sort_by: { type: "string", enum: ["interaction_count", "success_rate", "volume", "recent"], default: "interaction_count" },
        limit: { type: "integer", default: 20 },
      },
    },
  },

  nexsell_memory_query: {
    name: "nexsell_memory_query",
    description:
      "Query your institutional memory for relevant context before making decisions. Returns past outcomes, learned patterns, and relationship data relevant to your query.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "What context are you looking for? e.g., 'negotiation with DataCorp', 'errors with sentiment API'" },
        memory_type: { type: "string", enum: ["strategy", "error", "relationship", "performance", "all"], default: "all" },
        time_range: { type: "string", enum: ["recent", "month", "quarter", "all"], default: "recent" },
      },
      required: ["query"],
    },
  },

  // ── Performance & Optimization ─────────────────────────

  nexsell_performance_review: {
    name: "nexsell_performance_review",
    description:
      "Review your own performance metrics. Includes success rates, costs, latency, and trend analysis. Identifies regressions and suggests optimizations.",
    inputSchema: {
      type: "object",
      properties: {
        metrics: {
          type: "array",
          items: { type: "string" },
          description: "Specific metrics to review. Default: all key metrics.",
        },
        period: { type: "string", enum: ["hourly", "daily", "weekly", "monthly"], default: "daily" },
      },
    },
  },

  // ── Market Intelligence ────────────────────────────────

  nexsell_market_watch: {
    name: "nexsell_market_watch",
    description:
      "Set up a market watch to monitor for new listings, price changes, and better deals. The platform will check periodically and alert you during idle time.",
    inputSchema: {
      type: "object",
      properties: {
        action: { type: "string", enum: ["create", "list", "update", "delete"], default: "list" },
        query: { type: "string", description: "Search query to monitor" },
        category: { type: "string", description: "Category to monitor" },
        check_interval_seconds: { type: "integer", default: 3600, description: "How often to check (seconds)" },
        watch_id: { type: "string", description: "ID of existing watch (for update/delete)" },
      },
    },
  },

  // ── Autonomy Configuration ─────────────────────────────

  nexsell_autonomy_configure: {
    name: "nexsell_autonomy_configure",
    description:
      "View or update your autonomy policy. Controls what you can do without human approval, spending limits, notification preferences, and idle time behavior.",
    inputSchema: {
      type: "object",
      properties: {
        action: { type: "string", enum: ["get", "update"], default: "get" },
        level: { type: "string", enum: ["supervised", "assisted", "autonomous", "fully_autonomous"] },
        max_single_purchase_cents: { type: "integer" },
        max_daily_spend_cents: { type: "integer" },
        auto_renegotiate: { type: "boolean" },
        auto_switch_vendor: { type: "boolean" },
        auto_purchase: { type: "boolean" },
        auto_fix_errors: { type: "boolean" },
        idle_improvement_enabled: { type: "boolean" },
        idle_budget_cents_per_day: { type: "integer" },
      },
    },
  },

  // ── Idle Time Control ──────────────────────────────────

  nexsell_idle_status: {
    name: "nexsell_idle_status",
    description:
      "Check your idle time status — what improvement tasks are pending, what was done recently, and what's scheduled next. Use to understand your self-improvement activity.",
    inputSchema: {
      type: "object",
      properties: {
        include_recent_log: { type: "boolean", default: true, description: "Include recent idle activity log" },
        log_limit: { type: "integer", default: 10 },
      },
    },
  },
};

// Total MCP tools: 18 (original) + 12 (self-improvement) = 30
export const TOTAL_MCP_TOOLS = 30;
