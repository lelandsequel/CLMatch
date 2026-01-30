import { NextResponse } from "next/server";
import { findOrderById } from "../../../../lib/orders";

export const runtime = "nodejs";

/**
 * Get order status for polling.
 * 
 * Frontend can poll this endpoint to check if processing is complete.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get("orderId");

  if (!orderId) {
    return NextResponse.json({ error: "orderId required" }, { status: 400 });
  }

  try {
    const order = await findOrderById(orderId);
    
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Map status to user-friendly messages
    const statusMessages: Record<string, string> = {
      draft: "Order created",
      pending: "Queued for processing...",
      processing: "Analyzing your resume and finding matches...",
      qc_repairing: "Fine-tuning results...",
      needs_review: "In executive review",
      approved_auto: "Preparing delivery...",
      approved_manual: "Approved and preparing delivery...",
      delivered: "Complete! Check your dashboard.",
      failed: "Something went wrong. We'll reach out.",
      auto_qc_failed: "Needs manual review. We'll reach out."
    };

    return NextResponse.json({
      order_id: order.id,
      status: order.status,
      message: statusMessages[order.status ?? "pending"] ?? "Processing...",
      is_complete: ["delivered", "needs_review", "approved_auto", "approved_manual"].includes(order.status ?? ""),
      is_error: ["failed", "auto_qc_failed"].includes(order.status ?? "")
    });

  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
