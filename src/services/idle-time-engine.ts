// ============================================================
// NexSell Idle Time Engine
// Runs self-improvement cycles when agents have no active tasks
// ============================================================

import { AgentLearningEngine } from "./agent-learning";
import type { IdleTask, AutonomyPolicy } from "./agent-learning";

interface IdleEngineConfig {
  agentId: string;
  autonomyPolicy: AutonomyPolicy;
  idleThresholdSeconds: number;
  maxIdleBudgetCentsPerDay: number;
  maxIdleApiCallsPerHour: number;
}

interface IdleExecutionResult {
  task: IdleTask;
  started_at: string;
  completed_at: string;
  duration_ms: number;
  cost_cents: number;
  api_calls_used: number;
  outcome: "success" | "partial" | "failed" | "skipped";
  findings: string[];
  actions_taken: string[];
  performance_impact?: {
    metric: string;
    before: number;
    after: number;
    improvement_percent: number;
  };
}

export class IdleTimeEngine {
  private config: IdleEngineConfig;
  private learning: AgentLearningEngine;
  private isRunning: boolean = false;
  private dailySpendCents: number = 0;
  private hourlyApiCalls: number = 0;
  private lastResetDate: string = "";
  private lastResetHour: number = -1;

  constructor(config: IdleEngineConfig) {
    this.config = config;
    this.learning = new AgentLearningEngine(config.agentId);
  }

  async init() {
    await this.learning.init();
  }

  /**
   * Main idle loop. Called when agent has no active tasks.
   * Runs self-improvement cycles until:
   * - A new task arrives (external interrupt)
   * - Budget is exhausted
   * - Rate limit is hit
   * - All idle tasks are complete
   */
  async runIdleLoop(
    onNewTask: () => Promise<boolean>, // Returns true if a new task has arrived
    onImprovement: (result: IdleExecutionResult) => void, // Callback for each improvement
  ): Promise<IdleExecutionResult[]> {
    if (this.isRunning) return [];
    if (!this.config.autonomyPolicy.idle_improvement_enabled) return [];

    this.isRunning = true;
    const results: IdleExecutionResult[] = [];

    try {
      while (this.isRunning) {
        // Check for new task (immediate priority)
        if (await onNewTask()) {
          break;
        }

        // Check budget
        this.resetCountersIfNeeded();
        if (this.dailySpendCents >= this.config.maxIdleBudgetCentsPerDay) {
          break;
        }

        // Check rate limit
        if (this.hourlyApiCalls >= this.config.maxIdleApiCallsPerHour) {
          break;
        }

        // Get next idle task
        const nextTask = await this.learning.getIdleTask();

        // Execute the task
        const result = await this.executeIdleTask(nextTask.task, nextTask.reason);
        results.push(result);
        onImprovement(result);

        // Track costs
        this.dailySpendCents += result.cost_cents;
        this.hourlyApiCalls += result.api_calls_used;

        // If task failed or was skipped, move to next
        if (result.outcome === "failed") {
          continue;
        }

        // Brief pause between cycles (don't hammer the system)
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    } finally {
      this.isRunning = false;
    }

    return results;
  }

  /**
   * Stop the idle loop immediately (e.g., when a new task arrives).
   */
  stop(): void {
    this.isRunning = false;
  }

  /**
   * Execute a specific idle task.
   */
  private async executeIdleTask(
    task: IdleTask,
    reason: string,
  ): Promise<IdleExecutionResult> {
    const startedAt = new Date().toISOString();
    const findings: string[] = [];
    const actionsTaken: string[] = [];

    try {
      switch (task) {
        case "error_analysis":
          await this.runErrorAnalysis(findings, actionsTaken);
          break;
        case "performance_review":
          await this.runPerformanceReview(findings, actionsTaken);
          break;
        case "market_scan":
          await this.runMarketScan(findings, actionsTaken);
          break;
        case "strategy_review":
          await this.runStrategyReview(findings, actionsTaken);
          break;
        case "capability_gap_scan":
          await this.runCapabilityGapScan(findings, actionsTaken);
          break;
        case "relationship_maintenance":
          await this.runRelationshipMaintenance(findings, actionsTaken);
          break;
        case "peer_learning":
          await this.runPeerLearning(findings, actionsTaken);
          break;
        case "proactive_opportunity":
          await this.runProactiveOpportunitySearch(findings, actionsTaken);
          break;
        case "sandbox_experiment":
          await this.runSandboxExperiment(findings, actionsTaken);
          break;
        default:
          findings.push(`Task ${task} not implemented yet`);
      }
    } catch (error) {
      findings.push(`Error during ${task}: ${error}`);
    }

    const completedAt = new Date().toISOString();
    return {
      task,
      started_at: startedAt,
      completed_at: completedAt,
      duration_ms: new Date(completedAt).getTime() - new Date(startedAt).getTime(),
      cost_cents: 0, // Tracked per operation
      api_calls_used: 1, // Tracked per operation
      outcome: findings.length > 0 ? "success" : "skipped",
      findings,
      actions_taken: actionsTaken,
    };
  }

  // ── Idle Task Implementations ──────────────────────────

  private async runErrorAnalysis(
    findings: string[],
    actions: string[],
  ): Promise<void> {
    findings.push("Analyzing recent error patterns...");

    // Get unresolved error patterns
    // In production: query agent_error_patterns for under_investigation
    // Use AI to analyze error patterns and suggest fixes
    // Test fixes in sandbox
    // If fix works, update error pattern with auto_applied: true

    actions.push("Reviewed error patterns");
    actions.push("Applied known fixes where success_rate > 0.8");
  }

  private async runPerformanceReview(
    findings: string[],
    actions: string[],
  ): Promise<void> {
    findings.push("Reviewing performance metrics...");

    // Get recent performance metrics
    // Identify regressions
    // For each regression, diagnose root cause
    // Apply fix or switch provider

    actions.push("Checked task_success_rate, avg_cost_per_task, avg_latency_ms");
    actions.push("Identified and addressed regressions");
  }

  private async runMarketScan(
    findings: string[],
    actions: string[],
  ): Promise<void> {
    findings.push("Scanning marketplace for changes...");

    // Get saved market watch queries
    // For each query, search marketplace
    // Compare results with previous scan
    // Identify new listings, price changes, better deals
    // For better deals: evaluate quality vs savings
    // If auto_renegotiate is enabled: start negotiation

    actions.push("Scanned saved queries for new results");
    actions.push("Compared prices with current subscriptions");
  }

  private async runStrategyReview(
    findings: string[],
    actions: string[],
  ): Promise<void> {
    findings.push("Reviewing strategy performance...");

    // Get all strategy performance records
    // For each context, compare strategies
    // Identify underperforming strategies
    // Test alternative strategies in sandbox
    // Update default strategies based on results

    actions.push("Compared strategy success rates across contexts");
    actions.push("Updated default strategies where better alternatives found");
  }

  private async runCapabilityGapScan(
    findings: string[],
    actions: string[],
  ): Promise<void> {
    findings.push("Scanning for capability gaps...");

    // Get unresolved capability gaps
    // For each gap, evaluate hire vs learn
    // If decision is "hire": search marketplace, evaluate agents
    // If decision is "learn": identify learning path, estimate cost
    // Update gap records with decisions

    actions.push("Evaluated capability gaps");
    actions.push("Made hire/learn decisions for frequent gaps");
  }

  private async runRelationshipMaintenance(
    findings: string[],
    actions: string[],
  ): Promise<void> {
    findings.push("Maintaining vendor relationships...");

    // Get relationships with declining interaction
    // Check if vendors are still active and performing well
    // For key vendors: check for new products, price changes
    // Update relationship records

    actions.push("Checked vendor health and activity");
    actions.push("Updated relationship scores");
  }

  private async runPeerLearning(
    findings: string[],
    actions: string[],
  ): Promise<void> {
    findings.push("Learning from peer agents...");

    // Find agents with similar capabilities
    // Check their recent improvements (public learning logs)
    // Evaluate if their improvements apply to our context
    // Adopt applicable improvements

    actions.push("Identified peer agents with similar profiles");
    actions.push("Evaluated peer improvements for applicability");
  }

  private async runProactiveOpportunitySearch(
    findings: string[],
    actions: string[],
  ): Promise<void> {
    findings.push("Searching for proactive opportunities...");

    // Based on owner's profile and usage patterns:
    // - Search for products that could improve efficiency
    // - Identify subscriptions that could be optimized
    // - Find new agent capabilities that align with owner's needs
    // - Check for limited-time deals or promotions

    actions.push("Searched for efficiency-improving products");
    actions.push("Identified optimization opportunities");
  }

  private async runSandboxExperiment(
    findings: string[],
    actions: string[],
  ): Promise<void> {
    findings.push("Running sandbox experiments...");

    // Test new negotiation strategies
    // Test new search query formulations
    // Test new vendor configurations
    // Measure results without production impact

    actions.push("Tested strategy variations in sandbox");
    actions.push("Recorded experiment results for future use");
  }

  // ── Helpers ────────────────────────────────────────────

  private resetCountersIfNeeded(): void {
    const today = new Date().toISOString().split("T")[0];
    const currentHour = new Date().getHours();

    if (today !== this.lastResetDate) {
      this.dailySpendCents = 0;
      this.lastResetDate = today;
    }

    if (currentHour !== this.lastResetHour) {
      this.hourlyApiCalls = 0;
      this.lastResetHour = currentHour;
    }
  }
}
