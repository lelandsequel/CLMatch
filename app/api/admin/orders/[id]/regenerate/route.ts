import { NextResponse } from "next/server";
import { getUserFromRequest } from "../../../../../../lib/auth";
import { isAdminUser } from "../../../../../../lib/admin";
import { getOrderDetail } from "../../../../../../lib/orders";
import { downloadBuffer } from "../../../../../../lib/storage";
import { processOrder } from "../../../../../../lib/processing/processOrder";
import type { JobPreferences } from "../../../../../../lib/jobs/types";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getUserFromRequest(request);
    if (!isAdminUser(user)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const section = searchParams.get("section") ?? "all";

    const order = await getOrderDetail(id);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const intake = order.intakes?.[0];
    if (!intake || !intake.resume_storage_path) {
      return NextResponse.json({ error: "Intake missing" }, { status: 400 });
    }

    const resumePath = intake.resume_storage_path;
    const resumeFileName = resumePath.split("/").pop() ?? "resume.pdf";
    const resumeBuffer = await downloadBuffer("intakes", resumePath);

    if (section === "jobs" || section === "resume" || section === "outreach" || section === "all") {
      await processOrder({
        orderId: order.id,
        intakeId: intake.id,
        fullName: order.full_name ?? "",
        email: order.email,
        tierId: order.tier_id ?? order.product_tier ?? "offer_farming_report",
        resumeFileName,
        resumeBuffer,
        targetTitles: intake.target_titles ?? [],
        preferences: (intake.preferences ?? {}) as JobPreferences,
        target_job_url: intake.target_job_url ?? null,
        target_jd: intake.target_jd ?? null
      });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
