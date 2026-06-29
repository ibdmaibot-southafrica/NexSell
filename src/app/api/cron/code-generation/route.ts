import { NextRequest, NextResponse } from "next/server";
import { CodeGenerationAgent } from "@/services/code-generation-agent";

// ============================================================
// Cron: Code Generation Agent
// Runs daily at 3am UTC
// The site writes and deploys its own code
// ============================================================

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const agent = new CodeGenerationAgent();
    const result = await agent.run();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      improvements_identified: result.improvements_identified,
      code_deployed: result.code_deployed,
      improvements: result.improvements.map(i => ({
        title: i.title,
        type: i.type,
        reason: i.reason,
        risk_level: i.risk_level,
        status: i.status,
        estimated_impact: i.estimated_impact,
      })),
    });
  } catch (error) {
    console.error("Code generation agent cron failed:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
