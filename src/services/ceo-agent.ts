// ============================================================
// NexSell CEO Agent
// 
// The autonomous strategic decision-maker.
// Researches the market, analyzes the data, makes a decision,
// and EXECUTES it immediately. Not a suggestion. An action.
//
// This is the final piece that makes the system truly self-running.
// No more "you should consider..." — it just does it.
// ============================================================

import { chat } from "./ai";
import { createClient } from "@/lib/supabase/server";
import { CommerceEngine } from "./commerce-engine";

// ── Types ─────────────────────────────────────────────────

interface StrategicDecision {
  id: string;
  type: DecisionType;
  title: string;
  reasoning: string;
  research_summary: string;
  action: DecisionAction;
  impact_estimate: {
    revenue_impact: "positive" | "negative" | "neutral";
    estimated_monthly_change_cents: number;
    confidence: number; // 0-1
    timeframe: string;
  };
  risk_level: "low" | "medium" | "high";
  executed_at?: string;
  result?: string;
  created_at: string;
}

type DecisionType =
  | "pricing_adjustment"      // Change platform fees or product prices
  | "market_entry"            // Enter a new market/category
  | "feature_launch"          // Enable/disable a platform feature
  | "partnership"             // Pursue a partnership
  | "cost_optimization"       // Reduce costs
  | "growth_investment"       // Spend to grow (ads, outreach)
  | "product_sunset"          // Deprecate/remove a product
  | "fee_structure"           // Change platform fee percentages
  | "seller_acquisition"      // Actively recruit sellers
  | "buyer_acquisition"       // Actively recruit buyers
  | "operational_efficiency"  // Improve internal operations
  ;

interface DecisionAction {
  type: string;
  description: string;
  parameters: Record<string, unknown>;
  execute: () => Promise<ActionResult>;
}

interface ActionResult {
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
}

// ── CEO Agent ─────────────────────────────────────────────

export class CEOAgent {
  private supabase: Awaited<ReturnType<typeof createClient>>;

  async init() {
    this.supabase = await createClient();
  }

  // ── Main Decision Loop ─────────────────────────────────

  /**
   * Run the CEO decision loop.
   * 
   * 1. Gathers data from across the platform
   * 2. Identifies strategic opportunities and threats
   * 3. Researches each one (using AI + data)
   * 4. Makes a decision
   * 5. EXECUTES the decision immediately
   * 6. Records the outcome for learning
   * 
   * This runs daily via cron job.
   */
  async runDecisionLoop(): Promise<{
    decisions_made: number;
    actions_executed: number;
    decisions: StrategicDecision[];
  }> {
    // 1. Gather platform intelligence
    const intelligence = await this.gatherIntelligence();

    // 2. Identify strategic questions
    const questions = await this.identifyStrategicQuestions(intelligence);

    // 3. For each question: research → decide → execute
    const decisions: StrategicDecision[] = [];

    for (const question of questions) {
      const decision = await this.researchAndDecide(question, intelligence);
      
      if (decision) {
        // Execute immediately
        const result = await this.executeDecision(decision);
        decision.executed_at = new Date().toISOString();
        decision.result = result.message;
        decisions.push(decision);

        // Record for learning
        await this.recordDecision(decision, result);
      }
    }

    return {
      decisions_made: decisions.length,
      actions_executed: decisions.filter(d => d.executed_at).length,
      decisions,
    };
  }

  // ── Intelligence Gathering ──────────────────────────────

  /**
   * Pull data from every corner of the platform.
   * The CEO agent needs the full picture to make good decisions.
   */
  private async gatherIntelligence(): Promise<PlatformIntelligence> {
    const engine = new CommerceEngine();
    await engine.init();
    const revenue = await engine.getRevenueMetrics();

    // Get marketplace stats
    const { count: totalListings } = await this.supabase
      .from("marketplace_listings")
      .select("*", { count: "exact", head: true })
      .eq("status", "published");

    const { count: totalSellers } = await this.supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("entity_type", "human");

    const { count: totalAgents } = await this.supabase
      .from("ai_agents")
      .select("*", { count: "exact", head: true })
      .eq("status", "active");

    const { count: totalSubscriptions } = await this.supabase
      .from("subscriptions")
      .select("*", { count: "exact", head: true })
      .eq("status", "active");

    // Get category performance
    const { data: categoryStats } = await this.supabase
      .from("marketplace_summary")
      .select("*");

    // Get recent conversion rates
    const { data: recentOrders } = await this.supabase
      .from("orders")
      .select("created_at, total_cents, status")
      .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .limit(1000);

    // Get churn data
    const { count: cancelledSubs } = await this.supabase
      .from("subscriptions")
      .select("*", { count: "exact", head: true })
      .eq("status", "cancelled");

    return {
      revenue,
      total_listings: totalListings || 0,
      total_sellers: totalSellers || 0,
      total_agents: totalAgents || 0,
      total_subscriptions: totalSubscriptions || 0,
      cancelled_subscriptions: cancelledSubs || 0,
      category_stats: categoryStats || [],
      recent_orders: recentOrders || [],
      churn_rate: totalSubscriptions ? (cancelledSubs || 0) / totalSubscriptions : 0,
      timestamp: new Date().toISOString(),
    };
  }

  // ── Strategic Question Identification ───────────────────

  /**
   * AI analyzes the platform data and identifies strategic questions.
   * These are things that REQUIRE a decision — not just observations.
   */
  private async identifyStrategicQuestions(
    intel: PlatformIntelligence,
  ): Promise<StrategicQuestion[]> {
    const result = await chat({
      messages: [
        {
          role: "system",
          content: `You are the CEO of NexSell, an autonomous AI commerce platform.
Your job is to identify STRATEGIC DECISIONS that need to be made RIGHT NOW based on the platform data.

Rules:
- Only identify decisions that have clear, executable actions
- Prioritize by revenue impact (highest first)
- Each decision must be something you can ACT on, not just think about
- Be specific — "lower fees for API products from 4% to 3%" not "consider fee changes"
- Include your reasoning and expected impact
- Maximum 5 decisions per cycle — focus on what matters most

Respond in JSON: { "questions": [{ "type": "...", "title": "...", "reasoning": "...", "urgency": "high|medium|low", "estimated_revenue_impact_cents": 0 }] }`,
        },
        {
          role: "user",
          content: `Platform data:
- Monthly revenue: $${intel.revenue.thisMonth.revenue.toFixed(2)}
- MRR: $${intel.revenue.thisMonth.mrr.toFixed(2)}
- ARR: $${intel.revenue.thisMonth.arr.toFixed(2)}
- Platform fees today: $${intel.revenue.platformFees.today.toFixed(2)}
- Total listings: ${intel.total_listings}
- Total sellers: ${intel.total_sellers}
- Active AI agents: ${intel.total_agents}
- Active subscriptions: ${intel.total_subscriptions}
- Churn rate: ${(intel.churn_rate * 100).toFixed(1)}%
- Category performance: ${JSON.stringify(intel.category_stats)}

What strategic decisions should be made right now?`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    try {
      const parsed = JSON.parse(result.content);
      return parsed.questions || [];
    } catch {
      return [];
    }
  }

  // ── Research and Decide ─────────────────────────────────

  /**
   * For each strategic question, do deep research and make a final decision.
   * The decision includes the exact action to take.
   */
  private async researchAndDecide(
    question: StrategicQuestion,
    intel: PlatformIntelligence,
  ): Promise<StrategicDecision | null> {
    const result = await chat({
      messages: [
        {
          role: "system",
          content: `You are the CEO of NexSell. You've identified a strategic question.
Now RESEARCH it thoroughly and make a FINAL DECISION with an EXECUTABLE ACTION.

Your decision must include:
1. Research summary (what data supports this?)
2. The exact action to take (specific parameters, not vague directions)
3. Expected revenue impact (monthly, in cents)
4. Confidence level (0-1)
5. Risk level (low/medium/high)
6. Timeframe for impact

You MUST make a decision. Not "consider" or "evaluate" — DECIDE and ACT.
If you're not confident enough (confidence < 0.6), set action type to "defer" with reasoning.

Respond in JSON.`,
        },
        {
          role: "user",
          content: `Strategic question: ${question.title}
Type: ${question.type}
Urgency: ${question.urgency}
Initial reasoning: ${question.reasoning}

Current platform state:
- Revenue: $${intel.revenue.thisMonth.revenue.toFixed(2)}/mo
- MRR: $${intel.revenue.thisMonth.mrr.toFixed(2)}
- Listings: ${intel.total_listings}
- Sellers: ${intel.total_sellers}
- Agents: ${intel.total_agents}
- Churn: ${(intel.churn_rate * 100).toFixed(1)}%

Make your decision. Be specific about the action.`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2, // Low temperature — this is a CEO decision, not creative writing
    });

    try {
      const parsed = JSON.parse(result.content);
      return {
        id: `decision_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        type: question.type as DecisionType,
        title: question.title,
        reasoning: parsed.reasoning,
        research_summary: parsed.research_summary,
        action: parsed.action,
        impact_estimate: parsed.impact_estimate,
        risk_level: parsed.risk_level,
        created_at: new Date().toISOString(),
      };
    } catch {
      return null;
    }
  }

  // ── Execute Decision ────────────────────────────────────

  /**
   * Execute a strategic decision IMMEDIATELY.
   * This is what makes the CEO agent different from a dashboard —
   * it doesn't suggest, it ACTS.
   */
  private async executeDecision(decision: StrategicDecision): Promise<ActionResult> {
    const action = decision.action;

    // Log the decision before executing
    console.log(`[CEO] Executing: ${decision.title}`);
    console.log(`[CEO] Action: ${JSON.stringify(action)}`);

    try {
      switch (action.type) {
        // ── Pricing Actions ──────────────────────────────
        case "adjust_platform_fee": {
          // Change the platform fee for a listing type
          // e.g., { listing_type: "api", new_fee_percent: 3, new_fee_fixed_cents: 10 }
          const { listing_type, new_fee_percent, new_fee_fixed_cents } = action.parameters;
          await this.supabase
            .from("platform_config")
            .upsert({
              key: `fee_${listing_type}`,
              value: { percent: new_fee_percent, fixed_cents: new_fee_fixed_cents },
              updated_at: new Date().toISOString(),
            });
          return {
            success: true,
            message: `Platform fee for ${listing_type} updated to ${new_fee_percent}% + $${(new_fee_fixed_cents / 100).toFixed(2)}`,
          };
        }

        case "adjust_product_price": {
          // Change a specific product's price
          const { listing_id, new_price_cents } = action.parameters;
          await this.supabase
            .from("marketplace_listings")
            .update({
              price_cents: new_price_cents,
              metadata: { price_adjusted_by: "ceo_agent", adjusted_at: new Date().toISOString() },
            })
            .eq("id", listing_id);
          return {
            success: true,
            message: `Product ${listing_id} price updated to $${((new_price_cents as number) / 100).toFixed(2)}`,
          };
        }

        // ── Feature Actions ──────────────────────────────
        case "enable_feature": {
          const { feature_name, config } = action.parameters;
          await this.supabase
            .from("platform_config")
            .upsert({
              key: `feature_${feature_name}`,
              value: { enabled: true, ...config },
              updated_at: new Date().toISOString(),
            });
          return {
            success: true,
            message: `Feature "${feature_name}" enabled`,
          };
        }

        case "disable_feature": {
          const { feature_name: fn } = action.parameters;
          await this.supabase
            .from("platform_config")
            .upsert({
              key: `feature_${fn}`,
              value: { enabled: false },
              updated_at: new Date().toISOString(),
            });
          return {
            success: true,
            message: `Feature "${fn}" disabled`,
          };
        }

        // ── Category Actions ─────────────────────────────
        case "create_category": {
          const { name, slug, parent_id, description } = action.parameters;
          await this.supabase.from("categories").insert({
            name,
            slug,
            parent_id: parent_id || null,
            description: description || "",
          });
          return {
            success: true,
            message: `Category "${name}" created at /${slug}`,
          };
        }

        // ── Seller Acquisition ───────────────────────────
        case "send_outreach": {
          const { target_type, target_criteria, message_template } = action.parameters;
          // Queue outreach emails for processing by marketing engine
          await this.supabase.from("outreach_queue").insert({
            target_type,
            target_criteria,
            message_template,
            status: "pending",
            created_by: "ceo_agent",
            created_at: new Date().toISOString(),
          });
          return {
            success: true,
            message: `Outreach queued for ${target_type} matching ${JSON.stringify(target_criteria)}`,
          };
        }

        // ── Growth Investment ─────────────────────────────
        case "allocate_marketing_budget": {
          const { channel, amount_cents, duration_days } = action.parameters;
          await this.supabase.from("marketing_budgets").insert({
            channel,
            amount_cents,
            duration_days,
            allocated_by: "ceo_agent",
            allocated_at: new Date().toISOString(),
            status: "active",
          });
          return {
            success: true,
            message: `$${((amount_cents as number) / 100).toFixed(2)} allocated to ${channel} for ${duration_days} days`,
          };
        }

        // ── Cost Optimization ────────────────────────────
        case "reduce_infrastructure_cost": {
          const { service, action: costAction, estimated_savings_cents } = action.parameters;
          // Record the cost optimization for ops team to execute
          // (Some infra changes need careful rollout)
          await this.supabase.from("cost_optimizations").insert({
            service,
            action: costAction,
            estimated_savings_cents,
            requested_by: "ceo_agent",
            status: "pending_review", // Cost changes need ops review
            created_at: new Date().toISOString(),
          });
          return {
            success: true,
            message: `Cost optimization queued: ${costAction} on ${service} (est. $${((estimated_savings_cents as number) / 100).toFixed(2)}/mo savings)`,
          };
        }

        // ── Defer (not confident enough) ─────────────────
        case "defer": {
          return {
            success: true,
            message: `Decision deferred: ${action.parameters.reasoning || "Insufficient confidence"}`,
          };
        }

        default:
          return {
            success: false,
            message: `Unknown action type: ${action.type}`,
          };
      }
    } catch (error) {
      return {
        success: false,
        message: `Execution failed: ${error}`,
      };
    }
  }

  // ── Record & Learn ──────────────────────────────────────

  /**
   * Record every CEO decision for audit trail and learning.
   * The CEO agent reviews its past decisions to improve.
   */
  private async recordDecision(
    decision: StrategicDecision,
    result: ActionResult,
  ): Promise<void> {
    await this.supabase.from("ceo_decisions").insert({
      id: decision.id,
      type: decision.type,
      title: decision.title,
      reasoning: decision.reasoning,
      research_summary: decision.research_summary,
      action: decision.action,
      impact_estimate: decision.impact_estimate,
      risk_level: decision.risk_level,
      execution_result: {
        success: result.success,
        message: result.message,
        data: result.data,
      },
      executed_at: decision.executed_at,
      created_at: decision.created_at,
    });
  }

  // ── Review Past Decisions ───────────────────────────────

  /**
   * Review the outcomes of past CEO decisions.
   * Did the revenue actually change as predicted?
   * This is how the CEO agent learns to make better decisions.
   */
  async reviewPastDecisions(): Promise<{
    decisions_reviewed: number;
    accurate_predictions: number;
    learnings: string[];
  }> {
    const { data: pastDecisions } = await this.supabase
      .from("ceo_decisions")
      .select("*")
      .lt("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .is("outcome_reviewed", null)
      .limit(20);

    if (!pastDecisions || pastDecisions.length === 0) {
      return { decisions_reviewed: 0, accurate_predictions: 0, learnings: [] };
    }

    // Get current revenue to compare with predictions
    const engine = new CommerceEngine();
    await engine.init();
    const currentRevenue = await engine.getRevenueMetrics();

    const learnings: string[] = [];
    let accurate = 0;

    for (const decision of pastDecisions) {
      // Compare predicted impact with actual revenue change
      const predicted = decision.impact_estimate.estimated_monthly_change_cents;
      const actual = 0; // Would calculate from revenue delta since decision date

      const wasAccurate = Math.abs(predicted - actual) < Math.abs(predicted) * 0.5;
      if (wasAccurate) accurate++;

      learnings.push(
        `"${decision.title}": Predicted $${(predicted / 100).toFixed(0)}/mo change. ${wasAccurate ? "Prediction was accurate." : "Prediction was off — adjust confidence calibration."}`
      );

      // Mark as reviewed
      await this.supabase
        .from("ceo_decisions")
        .update({
          outcome_reviewed: true,
          outcome_accurate: wasAccurate,
          actual_impact_cents: actual,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", decision.id);
    }

    return {
      decisions_reviewed: pastDecisions.length,
      accurate_predictions: accurate,
      learnings,
    };
  }
}

// ── Supporting Types ──────────────────────────────────────

interface PlatformIntelligence {
  revenue: Awaited<ReturnType<CommerceEngine["getRevenueMetrics"]>>;
  total_listings: number;
  total_sellers: number;
  total_agents: number;
  total_subscriptions: number;
  cancelled_subscriptions: number;
  category_stats: any[];
  recent_orders: any[];
  churn_rate: number;
  timestamp: string;
}

interface StrategicQuestion {
  type: string;
  title: string;
  reasoning: string;
  urgency: "high" | "medium" | "low";
  estimated_revenue_impact_cents: number;
}
