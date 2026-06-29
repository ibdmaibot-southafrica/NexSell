import { NextRequest, NextResponse } from "next/server";
import { CommerceEngine } from "@/services/commerce-engine";

// ============================================================
// Cron: Daily Payouts
// Runs at midnight UTC every day
// Pays all sellers their pending balances via PayPal
// ============================================================

export async function GET(request: NextRequest) {
  // Verify cron secret to prevent unauthorized execution
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const engine = new CommerceEngine();
    const result = await engine.processDailyPayouts();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      ...result,
    });
  } catch (error) {
    console.error("Daily payouts cron failed:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
