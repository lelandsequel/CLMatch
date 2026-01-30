import { NextResponse } from "next/server";
import { findPendingOrders, claimOrderForProcessing, updateOrderStatus } from "../../../../lib/orders";
import { downloadBuffer } from "../../../../lib/storage";
import { processOrder } from "../../../../lib/processing/processOrder";
import { getTier } from "../../../../lib/pricing";
import type { JobPreferences } from "../../../../lib/jobs/types";

export const runtime = "nodejs";
export const maxDuration = 300; // 5 minutes - requires Vercel Pro

/**
 * Cron endpoint to process pending orders.
 * 
 * Called every minute by Vercel Cron.
 * Processes one order at a time to avoid timeout issues.
 * 
 * Security: Verify CRON_SECRET header in production.
 */
export async function GET(request: Request) {
  // Verify cron secret in production
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Find pending orders (oldest first)
    const pendingOrders = await findPendingOrders(1);
    
    if (!pendingOrders || pendingOrders.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: "No pending orders",
        processed: 0 
      });
    }

    const order = pendingOrders[0];
    const intake = order.intakes?.[0];

    if (!intake) {
      console.error(`Order ${order.id} has no intake`);
      await updateOrderStatus(order.id, "failed");
      return NextResponse.json({ 
        success: false, 
        error: "Order has no intake",
        order_id: order.id 
      });
    }

    // Atomically claim the order (prevents double-processing)
    const claimed = await claimOrderForProcessing(order.id);
    if (!claimed) {
      return NextResponse.json({ 
        success: true, 
        message: "Order already being processed",
        order_id: order.id 
      });
    }

    console.log(`Processing order ${order.id}...`);

    // Get tier info
    const tier = getTier(order.tier_id ?? "offer_farming_report");
    if (!tier) {
      await updateOrderStatus(order.id, "failed");
      return NextResponse.json({ 
        success: false, 
        error: "Invalid tier",
        order_id: order.id 
      });
    }

    // Download resume from storage
    let resumeBuffer: Buffer;
    let resumeFileName: string;
    
    try {
      const resumePath = intake.resume_storage_path;
      resumeFileName = resumePath.split("/").pop() ?? "resume.pdf";
      const arrayBuffer = await downloadBuffer("intakes", resumePath);
      resumeBuffer = Buffer.from(arrayBuffer);
    } catch (downloadError) {
      console.error(`Failed to download resume for order ${order.id}:`, downloadError);
      await updateOrderStatus(order.id, "failed");
      return NextResponse.json({ 
        success: false, 
        error: "Failed to download resume",
        order_id: order.id 
      });
    }

    // Process the order
    try {
      await processOrder({
        orderId: order.id,
        intakeId: intake.id,
        fullName: order.full_name ?? "",
        email: order.email,
        tierId: order.tier_id ?? tier.id,
        resumeFileName,
        resumeBuffer,
        targetTitles: intake.target_titles ?? [],
        preferences: (intake.preferences as JobPreferences) ?? {
          remote_only: false,
          contract_ok: false,
          preferred_titles: [],
          industries_prefer: [],
          industries_avoid: []
        },
        target_job_url: intake.target_job_url,
        target_jd: intake.target_jd
      });

      console.log(`Successfully processed order ${order.id}`);
      
      return NextResponse.json({ 
        success: true, 
        message: "Order processed",
        order_id: order.id,
        processed: 1
      });

    } catch (processingError) {
      console.error(`Processing failed for order ${order.id}:`, processingError);
      await updateOrderStatus(order.id, "failed");
      return NextResponse.json({ 
        success: false, 
        error: processingError instanceof Error ? processingError.message : "Processing failed",
        order_id: order.id 
      });
    }

  } catch (error) {
    console.error("Cron process-pending error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
