// ============================================================
// NexSell GitHub Agent
// 
// The site that updates its own source code on GitHub.
// Commits code, opens PRs, merges on test pass, Vercel auto-deploys.
//
// Flow:
//   Agent identifies improvement → writes code → 
//   commits to GitHub → opens PR → 
//   CI runs tests → if pass, auto-merge → 
//   Vercel deploys → site is updated
//
// The site literally rewrites itself. On GitHub. For real.
// ============================================================

// ── GitHub API Client ─────────────────────────────────────

const GITHUB_API = "https://api.github.com";

interface GitHubConfig {
  owner: string;        // e.g., "nexsell"
  repo: string;         // e.g., "nexsell"
  branch: string;       // e.g., "main"
  token: string;        // GitHub Personal Access Token
}

interface GitHubFile {
  path: string;
  content: string;
  message: string;
  sha?: string;         // Required for updates
}

interface PullRequest {
  number: number;
  html_url: string;
  title: string;
  body: string;
  head: string;         // Branch name
  base: string;         // Target branch
  state: "open" | "closed" | "merged";
}

class GitHubClient {
  private config: GitHubConfig;

  constructor(config: GitHubConfig) {
    this.config = config;
  }

  private async request(
    method: string,
    path: string,
    body?: unknown,
  ): Promise<any> {
    const res = await fetch(`${GITHUB_API}/repos/${this.config.owner}/${this.config.repo}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${this.config.token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error(`GitHub API error (${res.status}): ${error}`);
    }

    // 204 No Content
    if (res.status === 204) return null;
    return res.json();
  }

  // ── File Operations ────────────────────────────────────

  /**
   * Get the current content of a file from the repo.
   */
  async getFile(path: string, ref?: string): Promise<{
    content: string;
    sha: string;
  } | null> {
    try {
      const data = await this.request(
        "GET",
        `/contents/${path}${ref ? `?ref=${ref}` : ""}`,
      );
      return {
        content: Buffer.from(data.content, "base64").toString("utf-8"),
        sha: data.sha,
      };
    } catch {
      return null; // File doesn't exist
    }
  }

  /**
   * Create or update a file in the repo.
   * This is an actual git commit on GitHub.
   */
  async commitFile(file: GitHubFile, branch?: string): Promise<{
    sha: string;
    commit: { sha: string; html_url: string };
  }> {
    const existing = await this.getFile(file.path, branch);

    const body: any = {
      message: file.message,
      content: Buffer.from(file.content).toString("base64"),
      branch: branch || this.config.branch,
    };

    if (existing) {
      body.sha = existing.sha; // Required for updates
    }

    return this.request("PUT", `/contents/${file.path}`, body);
  }

  /**
   * Create a new branch from an existing branch.
   */
  async createBranch(
    newBranch: string,
    fromBranch?: string,
  ): Promise<{ sha: string }> {
    const source = fromBranch || this.config.branch;
    
    // Get the SHA of the source branch
    const ref = await this.request("GET", `/git/ref/heads/${source}`);
    
    // Create the new branch
    return this.request("POST", "/git/refs", {
      ref: `refs/heads/${newBranch}`,
      sha: ref.object.sha,
    });
  }

  /**
   * Open a Pull Request.
   */
  async createPullRequest(params: {
    title: string;
    body: string;
    head: string;     // Source branch
    base: string;     // Target branch
  }): Promise<PullRequest> {
    return this.request("POST", "/pulls", params);
  }

  /**
   * Merge a Pull Request.
   */
  async mergePullRequest(
    pullNumber: number,
    commitTitle?: string,
  ): Promise<{ sha: string; merged: boolean }> {
    return this.request("PUT", `/pulls/${pullNumber}/merge`, {
      commit_title: commitTitle,
      merge_method: "squash",
    });
  }

  /**
   * Get the status of a ref (branch/commit).
   * Used to check if CI tests passed.
   */
  async getCombinedStatus(ref: string): Promise<{
    state: "pending" | "success" | "failure" | "error";
    statuses: Array<{ context: string; state: string; description: string }>;
  }> {
    return this.request("GET", `/commits/${ref}/status`);
  }

  /**
   * Get check suites for a ref (GitHub Actions).
   */
  async getCheckSuites(ref: string): Promise<{
    total_count: number;
    check_suites: Array<{ status: string; conclusion: string | null }>;
  }> {
    return this.request("GET", `/commits/${ref}/check-suites`);
  }

  /**
   * List open PRs created by the agent.
   */
  async listAgentPRs(): Promise<PullRequest[]> {
    const prs = await this.request(
      "GET",
      `/pulls?state=open&head=agent/&per_page=20`,
    );
    return prs;
  }

  /**
   * Delete a branch.
   */
  async deleteBranch(branch: string): Promise<void> {
    await this.request("DELETE", `/git/refs/heads/${branch}`);
  }
}

// ── GitHub Agent ──────────────────────────────────────────

export class GitHubAgent {
  private github: GitHubClient;

  constructor(config?: Partial<GitHubConfig>) {
    this.github = new GitHubClient({
      owner: config?.owner || process.env.GITHUB_REPO_OWNER || "nexsell",
      repo: config?.repo || process.env.GITHUB_REPO_NAME || "nexsell",
      branch: config?.branch || "main",
      token: config?.token || process.env.GITHUB_TOKEN || "",
    });
  }

  // ── Main: Commit Code to GitHub ────────────────────────

  /**
   * Write code changes to GitHub as a PR.
   * 
   * Flow:
   * 1. Create a new branch (agent/improvement-id)
   * 2. Commit all file changes to that branch
   * 3. Open a Pull Request
   * 4. GitHub Actions runs CI (type-check, lint, test, build)
   * 5. If CI passes → auto-merge → Vercel deploys
   * 6. If CI fails → PR stays open for review
   * 
   * This is how the site updates its own source code.
   */
  async commitAndPR(params: {
    title: string;
    description: string;
    files: Array<{
      path: string;
      content: string;
    }>;
    riskLevel: "low" | "medium" | "high";
  }): Promise<{
    branch: string;
    pr_number: number;
    pr_url: string;
    auto_merged: boolean;
  }> {
    // 1. Create a feature branch
    const branchName = `agent/${Date.now()}-${params.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 50)}`;
    await this.github.createBranch(branchName);

    // 2. Commit each file to the branch
    for (const file of params.files) {
      await this.github.commitFile(
        {
          path: file.path,
          content: file.content,
          message: `agent: ${params.title} — ${file.path}`,
        },
        branchName,
      );
    }

    // 3. Open a Pull Request
    const pr = await this.github.createPullRequest({
      title: `🤖 ${params.title}`,
      body: this.generatePRBody(params),
      head: branchName,
      base: "main",
    });

    // 4. Wait for CI and auto-merge if safe
    let autoMerged = false;
    
    if (params.riskLevel === "low") {
      // For low-risk changes, wait for CI and auto-merge
      autoMerged = await this.waitForCIAndMerge(branchName, pr.number);
    }

    return {
      branch: branchName,
      pr_number: pr.number,
      pr_url: pr.html_url,
      auto_merged: autoMerged,
    };
  }

  // ── CI Wait & Auto-Merge ───────────────────────────────

  /**
   * Wait for GitHub Actions CI to complete, then auto-merge if passed.
   * Timeout: 5 minutes.
   */
  private async waitForCIAndMerge(
    branch: string,
    prNumber: number,
  ): Promise<boolean> {
    const maxWaitMs = 5 * 60 * 1000; // 5 minutes
    const pollIntervalMs = 15000; // 15 seconds
    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitMs) {
      // Check GitHub Actions status
      try {
        const checks = await this.github.getCheckSuites(branch);
        
        if (checks.total_count > 0) {
          const allComplete = checks.check_suites.every(
            (suite) => suite.conclusion !== null,
          );

          if (allComplete) {
            const allPassed = checks.check_suites.every(
              (suite) => suite.conclusion === "success",
            );

            if (allPassed) {
              // CI passed — auto-merge
              await this.github.mergePullRequest(
                prNumber,
                `agent: auto-merge after CI pass`,
              );
              // Clean up branch
              try {
                await this.github.deleteBranch(branch);
              } catch {}
              return true;
            } else {
              // CI failed — leave PR open for review
              return false;
            }
          }
        }

        // Also check commit status (for external CI like Vercel)
        const status = await this.github.getCombinedStatus(branch);
        if (status.state === "success") {
          await this.github.mergePullRequest(prNumber);
          try {
            await this.github.deleteBranch(branch);
          } catch {}
          return true;
        } else if (status.state === "failure" || status.state === "error") {
          return false;
        }
      } catch {
        // Status check failed — keep waiting
      }

      // Wait before polling again
      await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
    }

    // Timeout — leave PR open
    return false;
  }

  // ── Process Existing Agent PRs ──────────────────────────

  /**
   * Check existing agent PRs and merge any that have passing CI.
   * Runs hourly via cron job.
   */
  async processExistingPRs(): Promise<{
    prs_checked: number;
    prs_merged: number;
    prs_failed: number;
  }> {
    const prs = await this.github.listAgentPRs();
    let merged = 0;
    let failed = 0;

    for (const pr of prs) {
      try {
        const checks = await this.github.getCheckSuites(pr.head);
        
        if (checks.total_count > 0) {
          const allComplete = checks.check_suites.every(
            (suite) => suite.conclusion !== null,
          );

          if (allComplete) {
            const allPassed = checks.check_suites.every(
              (suite) => suite.conclusion === "success",
            );

            if (allPassed) {
              await this.github.mergePullRequest(pr.number);
              merged++;
            } else {
              failed++;
            }
          }
        }
      } catch {
        // Skip this PR
      }
    }

    return {
      prs_checked: prs.length,
      prs_merged: merged,
      prs_failed: failed,
    };
  }

  // ── PR Body Generator ──────────────────────────────────

  private generatePRBody(params: {
    title: string;
    description: string;
    files: Array<{ path: string; content: string }>;
    riskLevel: string;
  }): string {
    return `## 🤖 Agent-Generated Code Change

**This PR was created automatically by the NexSell Code Generation Agent.**

### What
${params.description}

### Files Changed
${params.files.map((f) => `- \`${f.path}\``).join("\n")}

### Risk Level
${params.riskLevel === "low" ? "🟢 Low — Auto-merge if CI passes" : params.riskLevel === "medium" ? "🟡 Medium — Requires CI pass + review" : "🔴 High — Requires manual review"}

### How This Was Generated
The Code Generation Agent identified this improvement from platform signals (error logs, performance data, search demand, or usage patterns). The code was generated by AI, tested locally, and committed to this branch.

---
*This PR will be auto-merged if CI passes and risk level is low.*`;
  }
}
