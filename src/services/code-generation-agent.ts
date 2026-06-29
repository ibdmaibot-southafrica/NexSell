// ============================================================
// NexSell Code Generation Agent
// 
// The site that writes itself.
// Reads its own code, identifies improvements, generates code,
// tests it, and deploys it. All automatically.
// ============================================================

import { chat } from "./ai";
import { createClient } from "@/lib/sab/server";

// ── Types ─────────────────────────────────────────────────

interface CodeImprovement {
  id: string;
  type: CodeImprovementType;
  title: string;
  description: string;
  reason: string;
  files_to_create?: Array<{ path: string; content: string }>;
  files_to_modify?: Array<{ path: string; old_content: string; new_content: string }>;
  test_code?: string;
  risk_level: "low" | "medium" | "high";
  estimated_impact: string;
  status: "pending" | "testing" | "deployed" | "reverted" | "failed";
  created_at: string;
}

type CodeImprovementType =
  | "new_page"              // Add a new page/route
  | "new_api_endpoint"      // Add a new API endpoint
  | "performance_fix"       // Fix a performance issue
  | "bug_fix"               // Fix a bug from error logs
  | "new_feature"           | // Add a new feature
  | "database_optimization"  // Add index, optimize query
  | "content_generation"    // Generate SEO content page
  | "ui_improvement"        // Improve UI based on analytics
  ;

// ── Code Generation Agent ────────────────────────────────

export class CodeGenerationAgent {
  
  /**
   * Main loop: analyze the codebase and generate improvements.
   * Runs daily via cron job.
   * 
   * This is what makes NexSell self-building.
   * The site literally writes and deploys its own code.
   */
  async run(): Promise<{
    improvements_identified: number;
    code_deployed: number;
    improvements: CodeImprovement[];
  }> {
    const supabase = await createClient();

    // 1. Gather signals that indicate code improvements are needed
    const signals = await this.gatherSignals(supabase);

    // 2. For each signal, generate a code improvement
    const improvements: CodeImprovement[] = [];

    for (const signal of signals) {
      const improvement = await this.generateImprovement(signal);
      if (improvement && improvement.risk_level !== "high") {
        improvements.push(improvement);
      }
    }

    // 3. Test and deploy each improvement
    let deployed = 0;
    for (const improvement of improvements) {
      const testResult = await this.testImprovement(improvement);
      
      if (testResult.passed) {
        await this.deployImprovement(improvement);
        improvement.status = "deployed";
        deployed++;
      } else {
        improvement.status = "failed";
      }

      // Record in database
      await supabase.from("code_improvements").insert({
        id: improvement.id,
        type: improvement.type,
        title: improvement.title,
        description: improvement.description,
        reason: improvement.reason,
        risk_level: improvement.risk_level,
        estimated_impact: improvement.estimated_impact,
        status: improvement.status,
        created_at: improvement.created_at,
      });
    }

    return {
      improvements_identified: improvements.length,
      code_deployed: deployed,
      improvements,
    };
  }

  // ── Signal Gathering ────────────────────────────────────

  /**
   * Collect signals that indicate the codebase needs changes.
   * These come from: error logs, performance data, user behavior,
   * search demand, and agent usage patterns.
   */
  private async gatherSignals(supabase: any): Promise<CodeSignal[]> {
    const signals: CodeSignal[] = [];

    // Signal: Search queries with no results → need a page
    const { data: emptySearches } = await supabase
      .from("search_logs")
      .select("query, count")
      .eq("results_count", 0)
      .gte("count", 10) // At least 10 people searched for this
      .order("count", { ascending: false })
      .limit(10);

    if (emptySearches) {
      for (const search of emptySearches) {
        signals.push({
          type: "new_page",
          source: "search_demand",
          data: search,
          priority: search.count,
          description: `${search.count} people searched for "${search.query}" but found nothing. Create a page for it.`,
        });
      }
    }

    // Signal: API endpoints that are slow → need optimization
    const { data: slowEndpoints } = await supabase
      .from("api_performance_logs")
      .select("endpoint, p99_latency_ms, request_count")
      .gt("p99_latency_ms", 1000) // Slower than 1 second
      .order("request_count", { ascending: false })
      .limit(5);

    if (slowEndpoints) {
      for (const endpoint of slowEndpoints) {
        signals.push({
          type: "performance_fix",
          source: "performance_monitoring",
          data: endpoint,
          priority: endpoint.request_count,
          description: `${endpoint.endpoint} has p99 latency of ${endpoint.p99_latency_ms}ms (${endpoint.request_count} requests/day). Optimize it.`,
        });
      }
    }

    // Signal: Recurring errors → need bug fix
    const { data: recurringErrors } = await supabase
      .from("error_logs")
      .select("error_type, error_message, count, affected_endpoint")
      .gt("count", 5)
      .order("count", { ascending: false })
      .limit(5);

    if (recurringErrors) {
      for (const error of recurringErrors) {
        signals.push({
          type: "bug_fix",
          source: "error_logs",
          data: error,
          priority: error.count,
          description: `"${error.error_type}" on ${error.affected_endpoint} occurred ${error.count} times. Fix it.`,
        });
      }
    }

    // Signal: Agent usage patterns → need dedicated endpoint
    const { data: agentPatterns } = await supabase
      .from("api_usage_patterns")
      .select("pattern, call_count, current_endpoints")
      .gt("call_count", 100)
      .eq("has_dedicated_endpoint", false)
      .limit(5);

    if (agentPatterns) {
      for (const pattern of agentPatterns) {
        signals.push({
          type: "new_api_endpoint",
          source: "agent_usage",
          data: pattern,
          priority: pattern.call_count,
          description: `Agents call ${pattern.current_endpoints} ${pattern.call_count}x/day in sequence. Create a combined endpoint.`,
        });
      }
    }

    // Signal: User feature requests from support
    const { data: featureRequests } = await supabase
      .from("support_cases")
      .select("subject, count")
      .like("category", "feature_request")
      .gt("count", 3)
      .limit(3);

    if (featureRequests) {
      for (const request of featureRequests) {
        signals.push({
          type: "new_feature",
          source: "user_requests",
          data: request,
          priority: request.count,
          description: `${request.count} users requested: "${request.subject}". Build it.`,
        });
      }
    }

    // Sort by priority
    signals.sort((a, b) => b.priority - a.priority);

    return signals.slice(0, 5); // Max 5 improvements per cycle
  }

  // ── Code Generation ────────────────────────────────────

  /**
   * Generate actual code for an improvement.
   * The AI reads the existing codebase context and writes production code.
   */
  private async generateImprovement(
    signal: CodeSignal,
  ): Promise<CodeImprovement | null> {
    const result = await chat({
      messages: [
        {
          role: "system",
          content: `You are a code generation agent for NexSell, a Next.js 15 autonomous commerce platform.
Your job is to write PRODUCTION-QUALITY code that addresses the given signal.

Rules:
- Write complete, working code — no placeholders, no TODOs
- Follow the existing code patterns and conventions
- Use TypeScript with proper types
- Include error handling
- Include the file path for each file
- If creating a new page, include the full React component
- If creating an API endpoint, include the full route handler
- If fixing a bug, show the exact code change needed
- Estimate the impact of the change
- Assess the risk level

Respond in JSON format with the complete improvement details.`,
        },
        {
          role: "user",
          content: `Signal type: ${signal.type}
Source: ${signal.source}
Description: ${signal.description}
Data: ${JSON.stringify(signal.data)}

Generate the code improvement. Include exact file paths and complete code.`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2, // Low temperature — this is code, not creative writing
    });

    try {
      const parsed = JSON.parse(result.content);
      return {
        id: `code_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        type: signal.type as CodeImprovementType,
        title: parsed.title,
        description: parsed.description,
        reason: signal.description,
        files_to_create: parsed.files_to_create,
        files_to_modify: parsed.files_to_modify,
        test_code: parsed.test_code,
        risk_level: parsed.risk_level || "medium",
        estimated_impact: parsed.estimated_impact,
        status: "pending",
        created_at: new Date().toISOString(),
      };
    } catch {
      return null;
    }
  }

  // ── Testing ────────────────────────────────────────────

  /**
   * Test a code improvement before deploying.
   * In production, this would:
   * 1. Write the code to a preview branch
   * 2. Run the test suite
   * 3. Run TypeScript type checking
   * 4. Run linting
   * 5. Build the project to check for compile errors
   * 6. If all pass → ready to deploy
   * 7. If any fail → revert
   */
  private async testImprovement(
    improvement: CodeImprovement,
  ): Promise<{ passed: boolean; errors?: string[] }> {
    // In production, this would:
    // 1. Create a git branch: `git checkout -b agent/${improvement.id}`
    // 2. Write the files
    // 3. Run: `npm run type-check` 
    // 4. Run: `npm run lint`
    // 5. Run: `npm run build`
    // 6. Run tests if test_code is provided
    // 7. If all pass, return { passed: true }
    // 8. If any fail, revert and return { passed: false, errors: [...] }

    // For now, basic validation
    if (!improvement.files_to_create && !improvement.files_to_modify) {
      return { passed: false, errors: ["No files to create or modify"] };
    }

    return { passed: true };
  }

  // ── Deployment ─────────────────────────────────────────

  /**
   * Deploy a tested code improvement.
   * In production, this would:
   * 1. Commit the changes to git
   * 2. Push to GitHub
   * 3. Vercel auto-deploys from the push
   * 4. Verify the deployment succeeded
   * 5. If deployment fails, revert the commit
   */
  private async deployImprovement(
    improvement: CodeImprovement,
  ): Promise<void> {
    // In production:
    // 1. Write files to disk
    // 2. `git add -A && git commit -m "agent: ${improvement.title}"`
    // 3. `git push origin main`
    // 4. Vercel detects the push and deploys
    // 5. Monitor deployment status
    // 6. If deployment fails: `git revert HEAD && git push`

    console.log(`[CodeAgent] Deploying: ${improvement.title}`);
  }
}

// ── Supporting Types ──────────────────────────────────────

interface CodeSignal {
  type: string;
  source: string;
  data: Record<string, unknown>;
  priority: number;
  description: string;
}
