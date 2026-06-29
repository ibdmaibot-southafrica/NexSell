import { NextRequest, NextResponse } from "next/server";
import { CEOAgent } from "@/services/ceo-agent";

// ============================================================
// Cron: CEO Agent Decision Loop
// Runs daily at 5am UTC
// The CEO reviews the business and takes action
// ============================================================

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const ceo = new CEOAgent();
    await ceo.init();

    // Run the decision loop
    const result = await ceo.runDecisionLoop();

    // Also review past decisions for learning
    const review = await ceo.reviewPastDecisions();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      decisions_made: result.decisions_made,
      actions_executed: result.actions_executed,
      decisions: result.decisions.map(d => ({
        title: d.title,
        type: d.type,
        reasoning: d.reasoning,
        action: d.action,
        risk_level: d.risk_level,
        executed_at: d.executed_at,
        result: d.result,
      })),
      review: {
        past_decisions_reviewed: review.decisions_reviewed,
        accurate_predictions: review.accurate_predictions,
        learnings: review.learnings,
      },
    });
  } catch (error) {
    console.error("CEO agent cron failed:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
