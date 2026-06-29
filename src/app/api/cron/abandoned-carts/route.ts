import { NextRequest, NextResponse } from "next/server";
import { recoverAbandonedCarts, solicitReviews, processEmailSequences } from "@/services/marketing-engine";

// ============================================================
// Cron: Abandoned Cart Recovery
// Runs every 15 minutes
// Finds abandoned carts and sends recovery emails
// ============================================================

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await recoverAbandonedCarts();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      ...result,
    });
  } catch (error) {
    console.error("Abandoned cart cron failed:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
