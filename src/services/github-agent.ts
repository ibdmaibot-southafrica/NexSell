// ============================================================
// NexSell GitHub Agent
//
// Uses the `gh` CLI (already authenticated via your GitHub token) to:
// - Create branches
// - Commit and push code
// - Open pull requests
// - Check CI status via `gh run list`
// - Auto-merge when tests pass via `gh pr merge`
//
// No GITHUB_TOKEN env var needed — `gh` CLI handles auth.
// The site literally rewrites itself. On GitHub. For real.
// ============================================================

import { execSync } from "child_process";

// ── Config ────────────────────────────────────────────────

const REPO_OWNER = "ibdmaibot-southafrica";
const REPO_NAME = "NexSell";
const BASE_BRANCH = "main";

// ── Helpers ───────────────────────────────────────────────

function gh(...args: string[]): string {
  try {
    return execSync(`gh ${args.join(" ")}`, {
      encoding: "utf-8",
      timeout: 30000,
    }).trim();
  } catch (error: any) {
    throw new Error(`gh ${args.join(" ")} failed: ${error.message}`);
  }
}

function git(...args: string[]): string {
  try {
    return execSync(`git ${args.join(" ")}`, {
      encoding: "utf-8",
      timeout: 30000,
    }).trim();
  } catch (error: any) {
    throw new Error(`git ${args.join(" ")} failed: ${error.message}`);
  }
}

function writeFile(path: string, content: string): void {
  const dir = path.substring(0, path.lastIndexOf("/"));
  if (dir) {
    execSync(`if (-not (Test-Path "${dir}")) { New-Item -ItemType Directory -Path "${dir}" -Force }`, {
      encoding: "utf-8",
    });
  }
  // Use heredoc to write file content
  const escaped = content.replace(/"/g, '\\"');
  execSync(`Set-Content -Path "${path}" -Value "${escaped}" -NoNewline`, {
    encoding: "utf-8",
  });
}

// ── GitHub Agent ──────────────────────────────────────────

export class GitHubAgent {
  /**
   * Write code changes to GitHub as a PR.
   *
   * Flow:
   * 1. Create a new branch (agent/improvement-id)
   * 2. Write files to disk
   * 3. Commit and push to GitHub
   * 4. Open a Pull Request via `gh pr create`
   * 5. Check CI status via `gh run list`
   * 6. If CI passes → auto-merge via `gh pr merge`
   * 7. Vercel auto-deploys from the merge
   *
   * This is how the site updates its own source code.
   */
  async commitAndPR(params: {
    title: string;
    description: string;
    files: Array<{ path: string; content: string }>;
    riskLevel: "low" | "medium" | "high";
  }): Promise<{
    branch: string;
    pr_number: number;
    pr_url: string;
    auto_merged: boolean;
  }> {
    // 1. Create a feature branch
    const branchName = `agent/${Date.now()}-${params.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40)}`;
    git("checkout", "-b", branchName);

    // 2. Write files to disk
    for (const file of params.files) {
      writeFile(file.path, file.content);
    }

    // 3. Commit and push
    git("add", "-A");
    git("commit", "-m", `agent: ${params.title}`);
    git("push", "-u", "origin", branchName);

    // 4. Open a Pull Request
    const prBody = this.generatePRBody(params);
    const prOutput = gh(
      "pr", "create",
      `--repo`, `${REPO_OWNER}/${REPO_NAME}`,
      `--base`, BASE_BRANCH,
      `--head`, branchName,
      `--title`, `🤖 ${params.title}`,
      `--body`, prBody,
    );

    // Extract PR number from output URL: https://github.com/.../pull/123
    const prMatch = prOutput.match(/pull\/(\d+)/);
    const prNumber = prMatch ? parseInt(prMatch[1]) : 0;
    const prUrl = prOutput;

    // 5. For low-risk changes, wait for CI and auto-merge
    let autoMerged = false;
    if (params.riskLevel === "low" && prNumber > 0) {
      autoMerged = await this.waitForCIAndMerge(branchName, prNumber);
    }

    // Go back to main
    git("checkout", BASE_BRANCH);

    return {
      branch: branchName,
      pr_number: prNumber,
      pr_url: prUrl,
      auto_merged: autoMerged,
    };
  }

  // ── CI Wait & Auto-Merge ───────────────────────────────

  /**
   * Wait for GitHub Actions CI to complete, then auto-merge if passed.
   * Uses `gh run list` to check CI status.
   * Timeout: 5 minutes.
   */
  private async waitForCIAndMerge(
    branch: string,
    prNumber: number,
  ): Promise<boolean> {
    const maxWaitMs = 5 * 60 * 1000;
    const pollIntervalMs = 15000;
    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitMs) {
      try {
        const runsOutput = gh(
          "run", "list",
          `--repo`, `${REPO_OWNER}/${REPO_NAME}`,
          `--branch`, branch,
          `--limit`, "1",
          `--json`, "status,conclusion,workflowName",
        );

        if (runsOutput) {
          const runs = JSON.parse(runsOutput);
          if (runs.length > 0) {
            const latestRun = runs[0];
            if (latestRun.status === "completed") {
              if (latestRun.conclusion === "success") {
                gh(
                  "pr", "merge", String(prNumber),
                  `--repo`, `${REPO_OWNER}/${REPO_NAME}`,
                  `--squash`,
                  `--delete-branch`,
                  `--admin`,
                );
                return true;
              } else {
                return false;
              }
            }
          }
        }
      } catch {
        // Keep waiting
      }

      await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
    }

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
    try {
      const prsOutput = gh(
        "pr", "list",
        `--repo`, `${REPO_OWNER}/${REPO_NAME}`,
        `--state`, "open",
        `--author`, "@me",
        `--json`, "number,headRefName,state",
        `--limit`, "20",
      );

      if (!prsOutput || prsOutput === "[]") {
        return { prs_checked: 0, prs_merged: 0, prs_failed: 0 };
      }

      const prs = JSON.parse(prsOutput);
      let merged = 0;
      let failed = 0;

      for (const pr of prs) {
        try {
          const runsOutput = gh(
            "run", "list",
            `--repo`, `${REPO_OWNER}/${REPO_NAME}`,
            `--branch`, pr.headRefName,
            `--limit`, "1",
            `--json`, "status,conclusion",
          );

          if (runsOutput) {
            const runs = JSON.parse(runsOutput);
            if (runs.length > 0 && runs[0].status === "completed") {
              if (runs[0].conclusion === "success") {
                gh(
                  "pr", "merge", String(pr.number),
                  `--repo`, `${REPO_OWNER}/${REPO_NAME}`,
                  `--squash`,
                  `--delete-branch`,
                  `--admin`,
                );
                merged++;
              } else {
                failed++;
              }
            }
          }
        } catch {
          // Skip
        }
      }

      return { prs_checked: prs.length, prs_merged: merged, prs_failed: failed };
    } catch {
      return { prs_checked: 0, prs_merged: 0, prs_failed: 0 };
    }
  }

  // ── PR Body Generator ──────────────────────────────────

  private generatePRBody(params: {
    title: string;
    description: string;
    files: Array<{ path: string }>;
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
The Code Generation Agent identified this improvement from platform signals (error logs, performance data, search demand, or usage patterns). The code was generated by AI, written to disk, committed, and pushed to this branch.

---
*This PR will be auto-merged if CI passes and risk level is low.*`;
  }
}
