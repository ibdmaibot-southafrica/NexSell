// ============================================================
// NexSell Agent Learning Engine
// The self-improvement brain for every AI agent
// ============================================================

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

// ── Types ──────────────────────────────────────────────────

export type AutonomyLevel =
  | "supervised"      // Agent suggests, human approves everything
  | "assisted"        // Agent acts on routine, suggests on novel
  | "autonomous"      // Agent acts on everything, alerts on anomalies
  | "fully_autonomous"; // Agent acts on everything, no alerts needed

export interface AutonomyPolicy {
  level: AutonomyLevel;
  max_single_purchase_cents: number;
  max_daily_spend_cents: number;
  max_monthly_spend_cents: number;
  auto_renegotiate: boolean;
  auto_switch_vendor: boolean;
  auto_purchase: boolean;
  auto_hire_agent: boolean;
  auto_fix_errors: boolean;
  auto_expand_capabilities: boolean;
  auto_accept_deals: boolean;
  notify_on_purchase: boolean;
  notify_on_negotiation: boolean;
  notify_on_error: boolean;
  notify_on_improvement: boolean;
  notify_on_anomaly: boolean;
  idle_improvement_enabled: boolean;
  idle_budget_cents_per_day: number;
}

export interface IdleTimeConfig {
  idle_threshold_seconds: number;
  idle_tasks: IdleTask[];
  max_idle_improvement_cost_cents: number;
  max_idle_api_calls: number;
  require_approval_for: string[];
  deep_review_interval: string;
  market_scan_interval: string;
  capability_scan_interval: string;
}

export type IdleTask =
  | "strategy_review"
  | "market_scan"
  | "error_analysis"
  | "capability_gap_scan"
  | "relationship_maintenance"
  | "performance_review"
  | "peer_learning"
  | "knowledge_update"
  | "proactive_opportunity"
  | "sandbox_experiment";

// ── Learning Record Types ──────────────────────────────────

export interface StrategyPerformance {
  agent_id: string;
  context: string;           // e.g., "negotiation", "search", "vendor_selection"
  strategy: string;          // e.g., "volume_discount", "range_negotiation"
  success_rate: number;      // 0-1
  avg_savings_percent: number;
  avg_completion_time_ms: number;
  sample_count: number;
  last_used_at: string;
  created_at: string;
}

export interface CapabilityGap {
  agent_id: string;
  missing_capability: string;
  frequency: number;         // How often this gap is hit
  last_encountered_at: string;
  hire_cost_cents: number;
  learn_cost_cents: number;
  decision: "hire" | "learn" | "ignore" | "pending";
  decision_reasoning: string;
  resolved: boolean;
}

export interface ErrorPattern {
  agent_id: string;
  error_signature: string;   // Hash of error type + provider + context
  error_type: string;
  provider?: string;
  frequency: number;
  root_cause: string;
  fix_description: string;
  fix_parameters: Record<string, unknown>;
  success_rate: number;      // How often the fix works
  last_seen_at: string;
  auto_applied: boolean;
}

export interface RelationshipRecord {
  agent_id: string;
  entity_id: string;         // Vendor, agent, or organization ID
  entity_type: "vendor" | "agent" | "organization";
  interaction_count: number;
  success_rate: number;
  total_volume_cents: number;
  preferred_terms: Record<string, unknown>;
  negotiation_history: NegotiationMemory[];
  last_interaction_at: string;
  trust_score: number;
}

export interface NegotiationMemory {
  listing_id: string;
  initial_ask_cents: number;
  final_price_cents: number;
  savings_percent: number;
  rounds: number;
  strategy: string;
  outcome: "accepted" | "rejected" | "expired";
  key_learnings: string;
}

export interface PerformanceMetric {
  agent_id: string;
  metric: string;            // "task_success_rate", "avg_cost_per_task", "avg_latency_ms"
  period: "hourly" | "daily" | "weekly" | "monthly";
  value: number;
  previous_value: number;
  trend: "improving" | "stable" | "degrading";
  baseline: number;
  is_anomaly: boolean;
  recorded_at: string;
}

export interface MarketWatch {
  agent_id: string;
  query: string;
  category?: string;
  last_checked_at: string;
  new_results_count: number;
  price_changes: PriceChange[];
  better_deals_found: BetterDeal[];
}

export interface PriceChange {
  listing_id: string;
  listing_name: string;
  old_price_cents: number;
  new_price_cents: number;
  change_percent: number;
  detected_at: string;
}

export interface BetterDeal {
  current_listing_id: string;
  alternative_listing_id: string;
  alternative_name: string;
  savings_percent: number;
  quality_comparison: "equivalent" | "slightly_worse" | "better";
  recommendation: string;
}

// ── Learning Engine ────────────────────────────────────────

export class AgentLearningEngine {
  private agentId: string;
  private supabase: Awaited<ReturnType<typeof createClient>>;

  constructor(agentId: string) {
    this.agentId = agentId;
  }

  async init() {
    this.supabase = await createClient();
  }

  // ── Strategy Learning ──────────────────────────────────

  /**
   * Record the outcome of a strategy application.
   * Called after every negotiation, search, or vendor selection.
   */
  async recordStrategyOutcome(params: {
    context: string;
    strategy: string;
    success: boolean;
    savings_percent?: number;
    completion_time_ms: number;
    metadata?: Record<string, unknown>;
  }): Promise<void> {
    const { context, strategy, success, savings_percent = 0, completion_time_ms } = params;

    // Get existing performance record
    const { data: existing } = await this.supabase
      .from("agent_strategy_performance")
      .select("*")
      .eq("agent_id", this.agentId)
      .eq("context", context)
      .eq("strategy", strategy)
      .single();

    if (existing) {
      // Update with exponential moving average
      const alpha = 0.1; // Learning rate
      const newSuccessRate = existing.success_rate * (1 - alpha) + (success ? 1 : 0) * alpha;
      const newSavings = existing.avg_savings_percent * (1 - alpha) + savings_percent * alpha;
      const newTime = existing.avg_completion_time_ms * (1 - alpha) + completion_time_ms * alpha;

      await this.supabase
        .from("agent_strategy_performance")
        .update({
          success_rate: newSuccessRate,
          avg_savings_percent: newSavings,
          avg_completion_time_ms: newTime,
          sample_count: existing.sample_count + 1,
          last_used_at: new Date().toISOString(),
        })
        .eq("id", existing.id);
    } else {
      // Create new record
      await this.supabase.from("agent_strategy_performance").insert({
        agent_id: this.agentId,
        context,
        strategy,
        success_rate: success ? 1 : 0,
        avg_savings_percent: savings_percent,
        avg_completion_time_ms: completion_time_ms,
        sample_count: 1,
        last_used_at: new Date().toISOString(),
      });
    }
  }

  /**
   * Get the best strategy for a given context.
   * Uses multi-armed bandit: mostly exploit best, sometimes explore.
   */
  async getBestStrategy(context: string): Promise<{
    strategy: string;
    confidence: number;
    alternatives: StrategyPerformance[];
  }> {
    const { data: strategies } = await this.supabase
      .from("agent_strategy_performance")
      .select("*")
      .eq("agent_id", this.agentId)
      .eq("context", context)
      .order("success_rate", { ascending: false });

    if (!strategies || strategies.length === 0) {
      return { strategy: "default", confidence: 0, alternatives: [] };
    }

    // UCB1 (Upper Confidence Bound) for exploration vs exploitation
    const totalSamples = strategies.reduce((sum, s) => sum + s.sample_count, 0);
    const scored = strategies.map((s) => ({
      ...s,
      ucb_score:
        s.success_rate +
        Math.sqrt((2 * Math.log(totalSamples)) / s.sample_count),
    }));

    scored.sort((a, b) => b.ucb_score - a.ucb_score);

    return {
      strategy: scored[0].strategy,
      confidence: Math.min(scored[0].sample_count / 100, 1), // Confidence increases with samples
      alternatives: scored.slice(1),
    };
  }

  // ── Error Self-Healing ─────────────────────────────────

  /**
   * Record an error and attempt to match it to a known pattern.
   * Returns a fix if one is known, otherwise records the new pattern.
   */
  async recordAndDiagnoseError(params: {
    error_type: string;
    error_message: string;
    provider?: string;
    context?: string;
    request_params?: Record<string, unknown>;
  }): Promise<{
    known_pattern: boolean;
    fix?: ErrorPattern;
    should_retry: boolean;
    retry_params?: Record<string, unknown>;
  }> {
    const signature = this.computeErrorSignature(params);

    const { data: pattern } = await this.supabase
      .from("agent_error_patterns")
      .select("*")
      .eq("agent_id", this.agentId)
      .eq("error_signature", signature)
      .single();

    if (pattern && pattern.success_rate > 0.7) {
      // Known pattern with reliable fix
      return {
        known_pattern: true,
        fix: pattern,
        should_retry: true,
        retry_params: pattern.fix_parameters,
      };
    }

    // New or unreliable pattern — record it
    await this.supabase.from("agent_error_patterns").insert({
      agent_id: this.agentId,
      error_signature: signature,
      error_type: params.error_type,
      provider: params.provider,
      frequency: 1,
      root_cause: "under_investigation",
      fix_description: "none",
      fix_parameters: {},
      success_rate: 0,
      auto_applied: false,
    });

    return { known_pattern: false, should_retry: params.error_type === "transient" };
  }

  /**
   * Record that a fix was applied and whether it worked.
   */
  async recordFixOutcome(params: {
    error_signature: string;
    fix_worked: boolean;
    fix_description?: string;
    fix_parameters?: Record<string, unknown>;
  }): Promise<void> {
    const { data: pattern } = await this.supabase
      .from("agent_error_patterns")
      .select("*")
      .eq("agent_id", this.agentId)
      .eq("error_signature", params.error_signature)
      .single();

    if (pattern) {
      const alpha = 0.2;
      const newSuccessRate = pattern.success_rate * (1 - alpha) + (params.fix_worked ? 1 : 0) * alpha;

      await this.supabase
        .from("agent_error_patterns")
        .update({
          success_rate: newSuccessRate,
          frequency: pattern.frequency + 1,
          ...(params.fix_worked && params.fix_description
            ? {
                fix_description: params.fix_description,
                fix_parameters: params.fix_parameters || {},
                root_cause: "identified",
                auto_applied: newSuccessRate > 0.8,
              }
            : {}),
        })
        .eq("id", pattern.id);
    }
  }

  // ── Capability Gap Detection ───────────────────────────

  /**
   * Record a capability gap (task the agent can't perform).
   */
  async recordCapabilityGap(params: {
    missing_capability: string;
    task_description: string;
    urgency: "low" | "medium" | "high";
  }): Promise<CapabilityGap> {
    const { data: existing } = await this.supabase
      .from("agent_capability_gaps")
      .select("*")
      .eq("agent_id", this.agentId)
      .eq("missing_capability", params.missing_capability)
      .eq("resolved", false)
      .single();

    if (existing) {
      // Increment frequency
      await this.supabase
        .from("agent_capability_gaps")
        .update({
          frequency: existing.frequency + 1,
          last_encountered_at: new Date().toISOString(),
        })
        .eq("id", existing.id);

      return existing;
    }

    // New gap
    const { data: gap } = await this.supabase
      .from("agent_capability_gaps")
      .insert({
        agent_id: this.agentId,
        missing_capability: params.missing_capability,
        frequency: 1,
        last_encountered_at: new Date().toISOString(),
        hire_cost_cents: 0,
        learn_cost_cents: 0,
        decision: "pending",
        decision_reasoning: "",
        resolved: false,
      })
      .select()
      .single();

    return gap;
  }

  /**
   * Evaluate whether to hire or learn for a capability gap.
   */
  async evaluateCapabilityGap(gapId: string): Promise<{
    decision: "hire" | "learn" | "ignore";
    reasoning: string;
    estimated_cost_cents: number;
    estimated_time_hours: number;
  }> {
    const { data: gap } = await this.supabase
      .from("agent_capability_gaps")
      .select("*")
      .eq("id", gapId)
      .single();

    if (!gap) throw new Error("Gap not found");

    // Search marketplace for agents with this capability
    const { data: agents } = await this.supabase
      .from("marketplace_listings")
      .select("id, name, price_cents, pricing_model")
      .eq("listing_type", "ai_agent")
      .eq("status", "published")
      .contains("tags", [gap.missing_capability])
      .limit(5);

    const hireCostPerUse = agents?.[0]?.price_cents || Infinity;
    const monthlyUsageEstimate = gap.frequency * 30; // Rough monthly estimate
    const hireCostMonthly = hireCostPerUse * monthlyUsageEstimate;

    // Learning cost is harder to estimate — use a heuristic
    const learnCostEstimate = 2000; // $20 for API access + training
    const learnTimeEstimate = 4; // hours

    // Decision logic
    if (gap.frequency < 3) {
      // Rarely needed — hire is better
      return {
        decision: "hire",
        reasoning: `This capability is needed infrequently (${gap.frequency} times). Hiring per-use is more cost-effective than learning.`,
        estimated_cost_cents: hireCostMonthly,
        estimated_time_hours: 0.5, // Setup time
      };
    }

    if (hireCostMonthly > learnCostEstimate * 3) {
      // Hiring is expensive long-term — learn
      return {
        decision: "learn",
        reasoning: `At ${monthlyUsageEstimate} uses/month, hiring costs ~$${hireCostMonthly / 100}/mo. Learning costs ~$${learnCostEstimate / 100} one-time. Learning is 3x+ cheaper over time.`,
        estimated_cost_cents: learnCostEstimate,
        estimated_time_hours: learnTimeEstimate,
      };
    }

    // Moderate frequency, reasonable hire cost — hire for now, consider learning later
    return {
      decision: "hire",
      reasoning: `Moderate frequency with reasonable hire cost. Will re-evaluate if usage increases.`,
      estimated_cost_cents: hireCostMonthly,
      estimated_time_hours: 0.5,
    };
  }

  // ── Relationship Management ────────────────────────────

  /**
   * Record an interaction with a vendor/agent.
   */
  async recordInteraction(params: {
    entity_id: string;
    entity_type: "vendor" | "agent" | "organization";
    success: boolean;
    volume_cents?: number;
    negotiation_outcome?: NegotiationMemory;
  }): Promise<void> {
    const { data: existing } = await this.supabase
      .from("agent_relationships")
      .select("*")
      .eq("agent_id", this.agentId)
      .eq("entity_id", params.entity_id)
      .single();

    if (existing) {
      const alpha = 0.1;
      const newSuccessRate = existing.success_rate * (1 - alpha) + (params.success ? 1 : 0) * alpha;

      await this.supabase
        .from("agent_relationships")
        .update({
          interaction_count: existing.interaction_count + 1,
          success_rate: newSuccessRate,
          total_volume_cents: existing.total_volume_cents + (params.volume_cents || 0),
          last_interaction_at: new Date().toISOString(),
          ...(params.negotiation_outcome
            ? {
                negotiation_history: [
                  ...(existing.negotiation_history || []).slice(-19), // Keep last 20
                  params.negotiation_outcome,
                ],
              }
            : {}),
        })
        .eq("id", existing.id);
    } else {
      await this.supabase.from("agent_relationships").insert({
        agent_id: this.agentId,
        entity_id: params.entity_id,
        entity_type: params.entity_type,
        interaction_count: 1,
        success_rate: params.success ? 1 : 0,
        total_volume_cents: params.volume_cents || 0,
        negotiation_history: params.negotiation_outcome ? [params.negotiation_outcome] : [],
        last_interaction_at: new Date().toISOString(),
      });
    }
  }

  /**
   * Get negotiation starting point for a known vendor.
   */
  async getNegotiationStartingPoint(vendorId: string): Promise<{
    suggested_strategy: string;
    starting_discount_percent: number;
    key_learnings: string;
  } | null> {
    const { data: relationship } = await this.supabase
      .from("agent_relationships")
      .select("negotiation_history, interaction_count, success_rate")
      .eq("agent_id", this.agentId)
      .eq("entity_id", vendorId)
      .single();

    if (!relationship || !relationship.negotiation_history?.length) {
      return null;
    }

    const history = relationship.negotiation_history as NegotiationMemory[];
    const lastNegotiation = history[history.length - 1];

    return {
      suggested_strategy: lastNegotiation.strategy,
      starting_discount_percent: lastNegotiation.savings_percent * 1.1, // Aim slightly higher
      key_learnings: lastNegotiation.key_learnings,
    };
  }

  // ── Performance Tracking ───────────────────────────────

  /**
   * Record a performance metric and detect anomalies.
   */
  async recordPerformance(params: {
    metric: string;
    value: number;
    period?: "hourly" | "daily" | "weekly" | "monthly";
  }): Promise<{
    is_anomaly: boolean;
    trend: "improving" | "stable" | "degrading";
    previous_value: number;
    baseline: number;
  }> {
    const period = params.period || "daily";

    const { data: previous } = await this.supabase
      .from("agent_performance_metrics")
      .select("*")
      .eq("agent_id", this.agentId)
      .eq("metric", params.metric)
      .eq("period", period)
      .order("recorded_at", { ascending: false })
      .limit(1)
      .single();

    const previousValue = previous?.value || params.value;
    const baseline = previous?.baseline || params.value;

    // Anomaly detection: >2 standard deviations from baseline
    const deviation = Math.abs(params.value - baseline) / Math.max(baseline, 1);
    const isAnomaly = deviation > 0.2; // 20% deviation = anomaly

    // Trend detection
    const change = (params.value - previousValue) / Math.max(previousValue, 1);
    const trend: "improving" | "stable" | "degrading" =
      Math.abs(change) < 0.02 ? "stable" : change > 0 ? "improving" : "degrading";

    await this.supabase.from("agent_performance_metrics").insert({
      agent_id: this.agentId,
      metric: params.metric,
      period,
      value: params.value,
      previous_value: previousValue,
      trend,
      baseline,
      is_anomaly: isAnomaly,
      recorded_at: new Date().toISOString(),
    });

    return { is_anomaly: isAnomaly, trend, previous_value: previousValue, baseline };
  }

  // ── Idle Time Engine ───────────────────────────────────

  /**
   * Determine what the agent should do during idle time.
   * Returns the highest-priority idle task.
   */
  async getIdleTask(): Promise<{
    task: IdleTask;
    priority: number;
    reason: string;
  }> {
    // Priority 1: Recent errors?
    const { count: errorCount } = await this.supabase
      .from("agent_error_patterns")
      .select("*", { count: "exact", head: true })
      .eq("agent_id", this.agentId)
      .eq("root_cause", "under_investigation")
      .gt("frequency", 2);

    if (errorCount && errorCount > 0) {
      return {
        task: "error_analysis",
        priority: 1,
        reason: `${errorCount} unresolved error patterns with frequency > 2`,
      };
    }

    // Priority 2: Performance regression?
    const { data: regressions } = await this.supabase
      .from("agent_performance_metrics")
      .select("*")
      .eq("agent_id", this.agentId)
      .eq("trend", "degrading")
      .eq("is_anomaly", true)
      .order("recorded_at", { ascending: false })
      .limit(1);

    if (regressions && regressions.length > 0) {
      return {
        task: "performance_review",
        priority: 2,
        reason: `Performance regression detected: ${regressions[0].metric}`,
      };
    }

    // Priority 3: Market scan overdue?
    const { data: watchItems } = await this.supabase
      .from("agent_market_watch")
      .select("*")
      .eq("agent_id", this.agentId)
      .lt("last_checked_at", new Date(Date.now() - 3600000).toISOString()); // 1 hour ago

    if (watchItems && watchItems.length > 0) {
      return {
        task: "market_scan",
        priority: 3,
        reason: `${watchItems.length} market watch items need scanning`,
      };
    }

    // Priority 4: Strategy review overdue?
    const { data: strategies } = await this.supabase
      .from("agent_strategy_performance")
      .select("*")
      .eq("agent_id", this.agentId)
      .lt("last_used_at", new Date(Date.now() - 86400000).toISOString()); // 24 hours ago

    if (strategies && strategies.length > 0) {
      return {
        task: "strategy_review",
        priority: 4,
        reason: `${strategies.length} strategies haven't been reviewed in 24h`,
      };
    }

    // Priority 5: Capability gaps?
    const { data: gaps } = await this.supabase
      .from("agent_capability_gaps")
      .select("*")
      .eq("agent_id", this.agentId)
      .eq("resolved", false)
      .eq("decision", "pending")
      .gt("frequency", 2);

    if (gaps && gaps.length > 0) {
      return {
        task: "capability_gap_scan",
        priority: 5,
        reason: `${gaps.length} unresolved capability gaps`,
      };
    }

    // Default: Proactive opportunity search
    return {
      task: "proactive_opportunity",
      priority: 8,
      reason: "No urgent tasks — searching for opportunities to create value",
    };
  }

  // ── Helpers ────────────────────────────────────────────

  private computeErrorSignature(params: {
    error_type: string;
    error_message: string;
    provider?: string;
    context?: string;
  }): string {
    // Simple hash of error characteristics for pattern matching
    const raw = `${params.error_type}:${params.provider || "none"}:${params.context || "none"}`;
    // In production, use a proper hash function
    return raw;
  }
}
